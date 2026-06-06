/* =====================================================================
   IMPEDYME — Phases scroll-reveal
   Reveals each phase card as it scrolls into view. Degrades gracefully:
   if IntersectionObserver is unavailable, all cards show immediately.
   ===================================================================== */
(function () {
  "use strict";

  function init() {
    var cards = document.querySelectorAll(".imp-phase");
    if (!cards.length) return;

    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (c) { c.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    cards.forEach(function (card, i) {
      // small stagger so stacked cards animate in sequence
      card.style.transitionDelay = (i % 4) * 0.08 + "s";
      observer.observe(card);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
