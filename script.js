(function () {
  "use strict";

  /* ---------- Year in footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var THEME_KEY = "rm-portfolio-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved) {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      applyTheme("dark");
    }
  })();

  if (themeToggle) {
    themeToggle.addEventListener("click", function (e) {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      if (window.UISound) UISound.toggleOn();

      var reduceMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!reduceMotion && document.startViewTransition) {
        var rect = themeToggle.getBoundingClientRect();
        var x = (e.clientX || rect.left + rect.width / 2);
        var y = (e.clientY || rect.top + rect.height / 2);
        root.style.setProperty("--toggle-x", x + "px");
        root.style.setProperty("--toggle-y", y + "px");
        document.startViewTransition(function () {
          applyTheme(next);
        });
      } else {
        applyTheme(next);
      }
    });
  }

  /* ---------- Hamburger / mobile menu ---------- */
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobileMenu");

  function closeMobileMenu() {
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("open");
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      var isOpen = hamburger.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
      mobileMenu.classList.toggle("open");
      if (window.UISound) UISound.click();
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  /* ---------- Header scroll state + progress bar ---------- */
  var header = document.getElementById("site-header");
  var progressBar = document.getElementById("progressBar");

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    if (progressBar) {
      var doc = document.documentElement;
      var scrollTop = window.scrollY;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (scrollTop / max) * 100 : 0;
      progressBar.style.width = pct + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scrollspy: highlight active nav link ---------- */
  var navLinks = document.querySelectorAll(".nav-links a[data-nav]");
  var navIndicator = document.getElementById("navIndicator");
  var navLinksWrap = document.querySelector(".nav-links-wrap");
  var sections = Array.prototype.slice.call(
    document.querySelectorAll("main section[id]")
  );

  function moveNavIndicator(link) {
    if (!navIndicator || !navLinksWrap || !link) return;
    var wrapRect = navLinksWrap.getBoundingClientRect();
    var linkRect = link.getBoundingClientRect();
    navIndicator.style.left = (linkRect.left - wrapRect.left) + "px";
    navIndicator.style.width = linkRect.width + "px";
    navIndicator.style.opacity = "1";
  }

  if ("IntersectionObserver" in window && navLinks.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              var isActive = link.getAttribute("data-nav") === id;
              link.classList.toggle("active", isActive);
              if (isActive) moveNavIndicator(link);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (sec) { spy.observe(sec); });
  }

  window.addEventListener("resize", function () {
    var active = document.querySelector(".nav-links a.active");
    if (active) moveNavIndicator(active);
  });

  /* ---------- Reveal-on-scroll ---------- */
  var revealTargets = document.querySelectorAll(
    ".section-head, .about-grid, .capability-card, .project-row, .contact-grid, .stack-group, .academic-card"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Animated skill bars ---------- */
  var skillBars = document.querySelectorAll(".skill-bar");
  if ("IntersectionObserver" in window && skillBars.length) {
    var barObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("filled");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    skillBars.forEach(function (bar) { barObserver.observe(bar); });
  } else {
    skillBars.forEach(function (bar) { bar.classList.add("filled"); });
  }

  /* ---------- Magnetic buttons ---------- */
  var magneticEls = document.querySelectorAll(".magnetic");
  var supportsHover = window.matchMedia("(hover: hover)").matches;

  if (supportsHover) {
    magneticEls.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = "translate(" + x * 0.18 + "px," + y * 0.35 + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ---------- Subtle tilt on the hero photo card ---------- */
  var photoCard = document.querySelector(".photo-card");
  if (photoCard && supportsHover) {
    photoCard.addEventListener("mousemove", function (e) {
      var rect = photoCard.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      photoCard.style.transform =
        "rotateY(" + px * 6 + "deg) rotateX(" + py * -6 + "deg)";
    });
    photoCard.addEventListener("mouseleave", function () {
      photoCard.style.transform = "";
    });
  }

  /* ---------- Cursor spotlight glow ---------- */
  var cursorGlow = document.getElementById("cursorGlow");
  var reduceMotionQuery =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

  if (cursorGlow && supportsHover && !(reduceMotionQuery && reduceMotionQuery.matches)) {
    var glowX = 0, glowY = 0, ticking = false;

    function moveGlow() {
      cursorGlow.style.transform =
        "translate3d(" + glowX + "px," + glowY + "px,0) translate(-50%,-50%)";
      ticking = false;
    }

    window.addEventListener(
      "mousemove",
      function (e) {
        glowX = e.clientX;
        glowY = e.clientY;
        cursorGlow.classList.add("active");
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(moveGlow);
        }
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", function () {
      cursorGlow.classList.remove("active");
    });
  }

  /* ---------- Subtle parallax on hero decorative diagram ---------- */
  var heroFlowDiagram = document.querySelector(".flow-diagram");
  if (heroFlowDiagram && supportsHover && !(reduceMotionQuery && reduceMotionQuery.matches)) {
    var parallaxTicking = false;
    function updateParallax() {
      var offset = Math.min(window.scrollY * 0.08, 40);
      heroFlowDiagram.style.transform = "translateY(" + offset + "px)";
      parallaxTicking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!parallaxTicking) {
          parallaxTicking = true;
          requestAnimationFrame(updateParallax);
        }
      },
      { passive: true }
    );
  }
})();