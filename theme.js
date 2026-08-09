/* ============================================================
   ALSAFLIX — theme.js
   Handles: light/dark theme toggle (persisted) + scroll-fade
   reveal animation for cards and sections.
   Safe to include on every page — each part checks that its
   target elements exist before doing anything.
   ============================================================ */

(function () {
  "use strict";

  var STORAGE_KEY = "alsaflix-theme";
  var root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  function getStoredTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function storeTheme(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* ignore */ }
  }

  function systemPrefersLight() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  }

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function updateToggleIcon(theme) {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.textContent = theme === "light" ? "☀️" : "🌙";
    btn.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    updateToggleIcon(theme);
  }

  function initTheme() {
    // The <head> already sets data-theme early (before paint) to avoid a flash.
    // Here we just make sure the toggle icon matches whatever was set.
    var theme = getStoredTheme() || (systemPrefersLight() ? "light" : "dark");
    applyTheme(theme);

    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = currentTheme() === "light" ? "dark" : "light";
        applyTheme(next);
        storeTheme(next);
      });
    }

    // Follow system changes only if the user hasn't picked a theme manually.
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
        if (getStoredTheme()) return;
        applyTheme(e.matches ? "light" : "dark");
      });
    }
  }

  /* ---------- Scroll-fade reveal ---------- */
  var revealSelectors = ".welcome-block, .movie-card";

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initReveal() {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      return; // elements are visible by default via CSS fallback
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    function observe(el) {
      if (el.classList.contains("reveal")) return; // already wired up
      el.classList.add("reveal");
      observer.observe(el);
    }

    document.querySelectorAll(revealSelectors).forEach(observe);

    // Movie cards are typically rendered after a data fetch — watch the
    // grid for new cards and hook them into the same reveal system.
    var grid = document.getElementById("movie-grid");
    if (grid && "MutationObserver" in window) {
      var mo = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          m.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1) return;
            if (node.classList && node.classList.contains("movie-card")) {
              observe(node);
            }
            if (node.querySelectorAll) {
              node.querySelectorAll(".movie-card").forEach(observe);
            }
          });
        });
      });
      mo.observe(grid, { childList: true });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initReveal();
  });
})();
