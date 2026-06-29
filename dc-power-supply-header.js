/* ============================================================
   Impedyme — DC Power Supply Header
   Small progressive-enhancement script.
   ============================================================ */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".impedyme-header__btn");
    if (!btn) return;

    // Track the "Request Information" click (hook for analytics if needed).
    btn.addEventListener("click", function () {
      if (window.dataLayer && typeof window.dataLayer.push === "function") {
        window.dataLayer.push({
          event: "request_information_click",
          location: "dc_power_supply_header",
        });
      }
    });
  });
})();
