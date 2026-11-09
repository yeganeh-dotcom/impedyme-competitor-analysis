/*!
 * Impedyme hero slider — behaviour (no dependencies)
 *
 * Slide timeline is driven by the slide's own video, so the overlay always lines up
 * with the footage even when the video buffers:
 *   slide 1: text, button and table at 3 s, product image 1 s before the video ends,
 *            then a 3 s pause before slide 2 (about 9 s in total, like the current site)
 *   slide 2: button straight away, next slide when the video ends
 * If autoplay is blocked (e.g. iPhone Low Power Mode) or a video fails to load, the
 * slide shows its poster image and runs the same sequence on a timer instead.
 *
 * Auto-advance pauses while the mouse is on one of the hero's links or buttons, or a keyboard
 * user is inside it; the active video pauses whenever the hero is off-screen or the tab is hidden.
 * Arrows, swipe (touch) and the left/right arrow keys change slides.
 * The header is stretched to the full window width even inside a boxed theme column.
 */
(function () {
  'use strict';

  var FADE_MS = 900;        // keep in sync with --imp-fade in the CSS
  var WATCHDOG_S = 4;       // a video that has not started after this long falls back to its poster
  var STATIC_CONTENT_AT = 0.4;
  var RESUME_DELAY_S = 1.2; // pause after the pointer leaves before auto-advancing

  function num(el, name, fallback) {
    var v = parseFloat(el.getAttribute(name));
    return isFinite(v) ? v : fallback;
  }

  function matches(el, selector) {
    try { return !!(el && el.matches && el.matches(selector)); } catch (e) { return false; }
  }

  function init(root) {
    if (!root || root.__impHero) return;
    root.__impHero = true;

    var stage = root.querySelector('.imp-hero__stage') || root;
    var track = root.querySelector('.imp-hero__track');
    var anims = [].slice.call(root.querySelectorAll('[data-imp-anim]'));
    var slides = [].slice.call(root.querySelectorAll('[data-imp-slide]')).map(function (el) {
      var video = el.querySelector('video');
      return {
        el: el,
        video: video,
        media: video ? video.closest('.imp-hero__media') : null,
        contentAt: num(el, 'data-imp-content-at', 0),
        endBefore: num(el, 'data-imp-end-before', 1),
        hold: num(el, 'data-imp-hold', 0),
        fallbackDur: num(el, 'data-imp-duration', 6),
        wall: 0, held: 0, cShown: false, eShown: false, finished: false,
        isStatic: false, failed: false, timer: 0
      };
    });
    if (!slides.length) return;

    var current = 0;
    var started = false;
    var running = false;
    var inView = true;
    var hoverMouse = false;
    var focusKeyboard = false;
    var holdByUser = false;
    var preloaded = false;
    var raf = 0;
    var last = 0;

    /* ---------- full width: span the whole window, whatever column the header sits in ---------- */

    function fitWidth() {
      var de = document.documentElement;
      var sbw = Math.max(0, window.innerWidth - de.clientWidth);   // desktop scrollbar (0 on phones/Mac)
      if (sbw > 40) sbw = 0;                                         // zoomed or unusual viewport: ignore
      root.style.setProperty('--imp-sbw', sbw + 'px');
      root.style.setProperty('--imp-shift', '0px');
      var left = root.getBoundingClientRect().left + (window.pageXOffset || 0);
      root.style.setProperty('--imp-shift', (Math.abs(left) < 0.5 ? 0 : -left).toFixed(2) + 'px');
    }

    /* ---------- start positions for the entrance animations ---------- */

    function measure() {
      root.classList.add('is-measuring');
      var stageRect = stage.getBoundingClientRect();
      var out = [];
      anims.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;                 // not displayed (e.g. table on mobile)
        var clip = el.parentElement && el.parentElement.closest('[data-imp-clip]');
        var ref = clip ? clip.getBoundingClientRect() : stageRect;
        var cap = num(el, 'data-imp-dist', Infinity);
        var type = el.getAttribute('data-imp-anim');
        var pad = 24, x = 0, y = 0;
        if (type === 'left') x = -Math.min(r.right - ref.left + pad, cap);
        else if (type === 'right') x = Math.min(ref.right - r.left + pad, cap);
        else if (type === 'top') y = -Math.min(r.bottom - ref.top + pad, cap);
        else if (type === 'bottom') y = Math.min(ref.bottom - r.top + pad, cap);
        out.push([el, x, y]);
      });
      root.classList.remove('is-measuring');
      out.forEach(function (item) {
        item[0].style.setProperty('--imp-fx', item[1].toFixed(1) + 'px');
        item[0].style.setProperty('--imp-fy', item[2].toFixed(1) + 'px');
      });
    }

    /* ---------- video helpers ---------- */

    function attemptPlay(s) {
      var v = s.video;
      if (!v || s.isStatic) return;
      var p;
      try { p = v.play(); } catch (e) { goStatic(s); return; }
      if (p && typeof p.catch === 'function') {
        p.catch(function (err) {
          if (err && err.name === 'AbortError') return;  // interrupted by our own pause(), harmless
          if (slides[current] === s) goStatic(s);
        });
      }
    }

    function goStatic(s) {
      if (s.isStatic) return;
      s.isStatic = true;
      s.wall = 0;
      if (s.video) { try { s.video.pause(); } catch (e) { /* ignore */ } }
      if (s.media) {
        var poster = s.video && (s.video.getAttribute('data-poster') || s.video.getAttribute('poster'));
        if (poster) s.media.style.backgroundImage = 'url("' + poster.replace(/"/g, '%22') + '")';
        s.media.classList.add('is-static');
      }
    }

    function startMedia(s, initial) {
      s.isStatic = false;
      if (s.media) s.media.classList.remove('is-static');
      var v = s.video;
      if (!v) { s.isStatic = true; return; }
      if (s.failed) { goStatic(s); return; }
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      var alreadyRunning = initial && !v.paused && v.currentTime > 0;  // autoplay beat the script
      if (!alreadyRunning) { try { v.currentTime = 0; } catch (e) { /* ignore */ } }
      if (v.preload !== 'auto') v.preload = 'auto';
      if (running) attemptPlay(s);
    }

    function stopMedia(s) {
      var v = s.video;
      if (!v) return;
      try { v.pause(); v.currentTime = 0; } catch (e) { /* ignore */ }
    }

    function preloadOthers() {
      preloaded = true;
      var c = navigator.connection;
      if (c && c.saveData) return;                          // respect data saver
      slides.forEach(function (s, i) {
        var v = s.video;
        if (i === current || !v || v.preload !== 'none') return;
        v.preload = 'auto';
        try { v.load(); } catch (e) { /* ignore */ }
      });
    }

    /* ---------- slide state ---------- */

    function resetSlide(s) {
      s.el.classList.remove('is-content', 'is-end');
      s.wall = 0; s.held = 0;
      s.cShown = false; s.eShown = false; s.finished = false;
    }

    function go(index, manual) {
      var n = slides.length;
      var i = ((index % n) + n) % n;
      var prev = slides[current];
      var next = slides[i];
      if (started && prev === next) return;

      if (started && prev) {
        prev.el.classList.remove('is-active');
        clearTimeout(prev.timer);
        prev.timer = setTimeout(function () {
          if (slides[current] !== prev) { resetSlide(prev); stopMedia(prev); }
        }, FADE_MS + 60);
      }

      current = i;
      clearTimeout(next.timer);
      resetSlide(next);
      next.el.classList.add('is-active');
      if (manual && track) track.setAttribute('aria-live', 'polite');
      startMedia(next, !started);
      started = true;
    }

    /* ---------- main loop ---------- */

    function tick(now) {
      raf = 0;
      if (!running) return;
      var dt = last ? Math.min((now - last) / 1000, 0.25) : 0;
      last = now;

      var s = slides[current];
      var v = s.video;
      s.wall += dt;

      var t = s.wall;
      var dur = s.fallbackDur;
      if (v && !s.isStatic) {
        t = v.currentTime || 0;
        if (isFinite(v.duration) && v.duration > 0) dur = v.duration;
        if (v.networkState === 3) { s.failed = true; goStatic(s); }   // NETWORK_NO_SOURCE: every source failed
        else if (s.wall > WATCHDOG_S && t < 0.05 && !v.ended) goStatic(s);
      }
      if (s.isStatic || !v) { t = s.wall; dur = s.fallbackDur; }

      var contentAt = s.isStatic ? Math.min(s.contentAt, STATIC_CONTENT_AT) : s.contentAt;
      var endAt = s.isStatic ? contentAt + 0.6 : Math.max(contentAt + 0.8, dur - s.endBefore);

      if (!s.cShown && t >= contentAt) { s.cShown = true; s.el.classList.add('is-content'); }
      if (!s.eShown && t >= endAt) { s.eShown = true; s.el.classList.add('is-end'); }
      if (!s.finished) {
        s.finished = (s.isStatic || !v) ? t >= dur : (v.ended || t >= dur - 0.05);
      }

      if (!preloaded && s.wall > 2) preloadOthers();

      if (s.finished && slides.length > 1) {
        s.held += dt;                                         // keeps counting while hovered...
        if (!holdByUser && s.held >= s.hold) go(current + 1, false);  // ...but only advances when free
      }

      raf = requestAnimationFrame(tick);
    }

    function setRunning() {
      var r = inView && !document.hidden;
      if (r === running) return;
      running = r;
      var s = slides[current];
      if (running) {
        last = 0;
        if (s.video && !s.isStatic && !s.video.ended) attemptPlay(s);
        if (!raf) raf = requestAnimationFrame(tick);
      } else {
        if (s.video && !s.video.paused) { try { s.video.pause(); } catch (e) { /* ignore */ } }
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
      }
    }

    function updateHold() {
      var hold = hoverMouse || focusKeyboard;
      if (holdByUser && !hold) {
        var s = slides[current];
        if (s.finished) s.held = Math.min(s.held, s.hold - RESUME_DELAY_S);  // advance ~1.2 s after leaving
      }
      holdByUser = hold;
    }

    /* ---------- events ---------- */

    slides.forEach(function (s) {
      var v = s.video;
      if (!v) return;
      var onError = function () {
        s.failed = true;
        if (slides[current] === s) goStatic(s);
      };
      var sources = v.querySelectorAll('source');
      if (sources.length) sources[sources.length - 1].addEventListener('error', onError);
      v.addEventListener('error', onError);
    });

    var prevBtn = root.querySelector('[data-imp-prev]');
    var nextBtn = root.querySelector('[data-imp-next]');
    if (prevBtn) prevBtn.addEventListener('click', function () { go(current - 1, true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(current + 1, true); });
    if (slides.length < 2) {
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
    }

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'Left') { go(current - 1, true); e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === 'Right') { go(current + 1, true); e.preventDefault(); }
    });

    // Hold while the mouse is on a link or button, so a slide never changes under a click.
    // (Resting the cursor on the video does not stop the slideshow: the hero fills most screens.)
    root.addEventListener('pointerover', function (e) {
      if (e.pointerType !== 'mouse') return;
      var onControl = !!(e.target && e.target.closest && e.target.closest('a, button'));
      if (onControl !== hoverMouse) { hoverMouse = onControl; updateHold(); }
    });
    root.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse' && hoverMouse) { hoverMouse = false; updateHold(); }
    });
    root.addEventListener('focusin', function (e) {
      focusKeyboard = matches(e.target, ':focus-visible');
      updateHold();
    });
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) { focusKeyboard = false; updateHold(); }
    });

    // Swipe on touch screens (mouse drags are left alone so text and links behave normally).
    var swipe = null;
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' || !e.isPrimary) return;
      swipe = { id: e.pointerId, x: e.clientX, y: e.clientY };
    }, { passive: true });
    stage.addEventListener('pointerup', function (e) {
      if (!swipe || e.pointerId !== swipe.id) return;
      var dx = e.clientX - swipe.x;
      var dy = e.clientY - swipe.y;
      swipe = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) go(current + (dx < 0 ? 1 : -1), true);
    }, { passive: true });
    stage.addEventListener('pointercancel', function () { swipe = null; });

    document.addEventListener('visibilitychange', setRunning);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[entries.length - 1].isIntersecting;
        setRunning();
      }).observe(root);
    }

    var resizeTimer = 0;
    var onResize = function () {
      fitWidth();
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 120);
    };
    window.addEventListener('resize', onResize);
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(onResize);
      ro.observe(document.documentElement);   // page width changes, e.g. when a scrollbar appears
      ro.observe(root);                       // the header's own size (layout switches, fonts)
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    /* ---------- start ---------- */

    slides.forEach(function (s, i) { if (i !== 0) s.el.classList.remove('is-active'); });
    fitWidth();
    measure();
    root.classList.add('is-ready');
    go(0, false);
    setRunning();
  }

  function boot() {
    [].forEach.call(document.querySelectorAll('[data-imp-hero]'), init);
  }

  boot();                                                   // markup above this script
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);    // any hero placed further down
  }
})();
