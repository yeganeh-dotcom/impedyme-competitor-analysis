/* ===== Impedyme — Interactive product lineup ===== */
(function () {
  document.querySelectorAll('[data-imp-lineup]').forEach(function (root) {
    // Product shown before the visitor interacts (set data-rest="" to show none)
    var REST = root.getAttribute('data-rest');
    if (REST === null) REST = 'chp300';

    var state = { touched: false, active: null };

    function all(id) {
      return root.querySelectorAll('[data-id="' + id + '"]');
    }

    function render() {
      var active = state.touched ? state.active : (REST || null);
      root.classList.toggle('is-engaged', !!(state.touched && state.active));

      root.querySelectorAll('[data-id]').forEach(function (el) {
        var on = el.getAttribute('data-id') === active;
        el.classList.toggle('is-on', on);
        if (el.hasAttribute('aria-expanded')) el.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    }

    function open(id) {
      state = { touched: true, active: id };
      render();
    }

    // Hover / focus / click on markers, index rows and invisible hit areas
    root.querySelectorAll('[data-open]').forEach(function (el) {
      var id = el.getAttribute('data-open');
      el.addEventListener('mouseenter', function () { open(id); });
      el.addEventListener('focus', function () { open(id); });
      el.addEventListener('click', function () { open(id); });
    });

    // Close buttons inside the cards
    root.querySelectorAll('.imp-lu__close').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        state = { touched: true, active: null };
        render();
      });
    });

    // Escape closes the open card
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        state = { touched: true, active: null };
        render();
      }
    });

    // Leaving the whole figure goes back to the resting callout
    var area = root.querySelector('.imp-lu__interactive');
    area.addEventListener('mouseleave', function () {
      state = { touched: false, active: null };
      render();
    });

    // Tap outside on touch devices closes the card
    document.addEventListener('click', function (e) {
      if (!area.contains(e.target) && state.touched) {
        state = { touched: false, active: null };
        render();
      }
    });

    // Stagger the pulse animation on the markers
    root.querySelectorAll('.imp-lu__pulse').forEach(function (p, i) {
      p.style.animationDelay = (i * 0.22).toFixed(2) + 's';
    });

    render();
  });
})();
