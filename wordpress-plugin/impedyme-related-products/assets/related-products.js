(function () {
  // TOP_GAP can be overridden per-shortcode via the top_gap="" attribute.
  var TOP_GAP    = (typeof window.IMP_RP_TOP_GAP === 'number') ? window.IMP_RP_TOP_GAP : 120;
  var BOTTOM_GAP = 24;   // gap above the stop element
  var MOBILE_BP  = 1024; // below this width sticky is disabled
  var STOP_SEL   = '[data-rp-stop]'; // the "Request a Demo" button

  function ready(fn){
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var affix = document.querySelector('.rp-affix');
    if (!affix) return;
    var card = affix.querySelector('.rp-card');
    if (!card) return;
    var stopEl = document.querySelector(STOP_SEL);

    function docTop(el){
      return el.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop);
    }

    function update(){
      // mobile: reset everything
      if (window.innerWidth < MOBILE_BP){
        card.style.position = card.style.top = card.style.left = card.style.width = '';
        affix.style.minHeight = '';
        return;
      }

      // measure natural position with card in normal flow
      card.style.position = '';
      affix.style.minHeight = '';
      var startY = docTop(affix);
      var rect   = affix.getBoundingClientRect();
      var width  = affix.clientWidth;
      var leftPx = rect.left;
      var cardH  = card.offsetHeight;

      // reserve space so the column doesn't jump when card goes fixed
      affix.style.minHeight = cardH + 'px';

      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var wantTop = scrollY + TOP_GAP;
      var maxTop  = Infinity;
      if (stopEl) maxTop = docTop(stopEl) - BOTTOM_GAP - cardH;

      if (wantTop < startY){ // not reached yet -> normal flow
        card.style.position = card.style.top = card.style.left = card.style.width = '';
        affix.style.minHeight = '';
      } else if (wantTop <= maxTop){
        // FOLLOWING the scroll
        card.style.position = 'fixed';
        card.style.top = TOP_GAP + 'px';
        card.style.left = leftPx + 'px';
        card.style.width = width + 'px';
      } else {
        // PARKED at the stop point, scrolls away with the page
        card.style.position = 'fixed';
        card.style.top = (maxTop - scrollY) + 'px';
        card.style.left = leftPx + 'px';
        card.style.width = width + 'px';
      }
    }

    var ticking = false;
    function onScroll(){
      if (!ticking){
        requestAnimationFrame(function(){ update(); ticking = false; });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    update();
  });
})();
