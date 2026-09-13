(function () {
  "use strict";

  var STORAGE_KEY = "rm-portfolio-sound";
  var enabled = true;
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) enabled = saved === "on";
  } catch (e) {}

  var ctx = null;
  function getCtx() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, duration, opts) {
    if (!enabled) return;
    var c = getCtx();
    if (!c) return;
    opts = opts || {};

    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = opts.type || "sine";
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (opts.sweepTo) {
      osc.frequency.linearRampToValueAtTime(opts.sweepTo, c.currentTime + duration);
    }

    var peak = opts.volume != null ? opts.volume : 0.07;
    gain.gain.setValueAtTime(0.0001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(peak, c.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);

    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration + 0.03);
  }

  var UISound = {
    isEnabled: function () {
      return enabled;
    },
    setEnabled: function (v) {
      enabled = v;
      try {
        localStorage.setItem(STORAGE_KEY, v ? "on" : "off");
      } catch (e) {}
    },
    click: function () {
      tone(520, 0.06, { type: "sine", volume: 0.05 });
    },
    hover: function () {
      tone(1040, 0.035, { type: "sine", volume: 0.018 });
    },
    toggleOn: function () {
      tone(420, 0.12, { type: "sine", sweepTo: 840, volume: 0.06 });
    },
    toggleOff: function () {
      tone(640, 0.11, { type: "sine", sweepTo: 320, volume: 0.06 });
    },
    open: function () {
      tone(480, 0.1, { type: "triangle", sweepTo: 740, volume: 0.055 });
    },
    close: function () {
      tone(480, 0.08, { type: "triangle", sweepTo: 300, volume: 0.045 });
    },
    send: function () {
      tone(680, 0.07, { type: "sine", sweepTo: 980, volume: 0.055 });
    },
    receive: function () {
      tone(580, 0.09, { type: "sine", volume: 0.045 });
    },
  };

  window.UISound = UISound;

  /* ---------------------------------------------------------
     Browsers block audio output until a genuine user gesture
     happens (click, keydown, or touch — hover does NOT count,
     by design, to stop unwanted autoplay sound). We can't play
     anything before that first gesture, but we can unlock the
     AudioContext on the very first one, anywhere on the page,
     so sound is ready as early as physically possible rather
     than requiring a click specifically on the sound button.
  --------------------------------------------------------- */
  function initEarlyUnlock() {
    var unlocked = false;
    function unlock() {
      if (unlocked) return;
      unlocked = true;
      getCtx();
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
      document.removeEventListener("touchstart", unlock, true);
    }
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("keydown", unlock, true);
    document.addEventListener("touchstart", unlock, true);
  }

  /* ---------------------------------------------------------
     Speaker toggle button
  --------------------------------------------------------- */
  function initToggle() {
    var btn = document.getElementById("soundToggle");
    if (!btn) return;

    function reflect() {
      btn.classList.toggle("is-on", enabled);
      btn.setAttribute("aria-pressed", String(enabled));
    }
    reflect();

    btn.addEventListener("click", function () {
      getCtx(); // unlock/create audio context on this user gesture
      if (!enabled) {
        UISound.setEnabled(true);
        reflect();
        UISound.toggleOn();
      } else {
        UISound.toggleOff();
        setTimeout(function () {
          UISound.setEnabled(false);
          reflect();
        }, 130);
      }
    });
  }

  /* ---------------------------------------------------------
     Generic click feedback across the site. Kept to real
     interactive elements only (not hover) so it stays subtle.
  --------------------------------------------------------- */
  function initGenericClicks() {
    var SELECTOR =
      ".btn, .nav-links a, .mobile-menu a, .contact-card, .social-link, .back-to-top, .kpi-card, .stack-item";

    document.addEventListener(
      "click",
      function (e) {
        var el = e.target.closest(SELECTOR);
        if (!el) return;
        if (el.id === "themeToggle" || el.id === "soundToggle") return; // these have their own sounds
        UISound.click();
      },
      true
    );
  }

  /* ---------------------------------------------------------
     Subtle hover feedback for cards, stack items, and nav
     links. Uses a WeakSet-style timestamp guard per element
     so re-entering quickly doesn't spam the same tone, and
     only fires on real mouse hover (not touch taps).
  --------------------------------------------------------- */
  function initHoverSounds() {
    var supportsHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
    if (!supportsHover) return;

    var HOVER_SELECTOR =
      ".nav-links a, .capability-card, .academic-card, .stack-item, .project-media, .contact-card, .kpi-card, .stack-icon, .social-link, .theme-toggle, .sound-toggle";

    var lastFired = new Map();
    var COOLDOWN = 250;

    document.addEventListener(
      "mouseover",
      function (e) {
        var el = e.target.closest(HOVER_SELECTOR);
        if (!el) return;
        // Ignore moves between children of the same hovered element
        if (el.contains(e.relatedTarget)) return;

        var now = Date.now();
        var last = lastFired.get(el) || 0;
        if (now - last < COOLDOWN) return;
        lastFired.set(el, now);

        UISound.hover();
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initEarlyUnlock();
      initToggle();
      initGenericClicks();
      initHoverSounds();
    });
  } else {
    initEarlyUnlock();
    initToggle();
    initGenericClicks();
    initHoverSounds();
  }
})();