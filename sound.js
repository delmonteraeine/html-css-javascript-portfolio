(function () {
  "use strict";

  var STORAGE_KEY = "rm-portfolio-sound";
  var enabled = false;
  try {
    enabled = localStorage.getItem(STORAGE_KEY) === "on";
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initToggle();
      initGenericClicks();
    });
  } else {
    initToggle();
    initGenericClicks();
  }
})();