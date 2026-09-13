(function () {
  "use strict";

  var widget = document.getElementById("chatWidget");
  var toggle = document.getElementById("chatToggle");
  var form = document.getElementById("chatForm");
  var input = document.getElementById("chatInput");
  var messagesEl = document.getElementById("chatMessages");

  if (!widget || !toggle || !form || !input || !messagesEl) return;

  /* ----------------------------------------------------------
     Knowledge base — fully client-side, no API, no cost.
  ---------------------------------------------------------- */
  var FAQ = [
    {
      keywords: ["skill", "tool", "know", "good at", "proficient", "power bi", "power apps", "power automate", "dax", "excel"],
      answer:
        "Rae works across two areas: Data Analytics & BI (Power BI, DAX, data modeling, and Excel/data transformation — the strongest of the set), and Power Platform Automation (Power Apps, Power Automate, workflow design, and system integration). Check the Capabilities section for the full breakdown.",
    },
    {
      keywords: ["experience", "internship", "job", "work", "career", "deped"],
      answer:
        "Rae completed a 3-month internship as a Data Analyst & Power Platform Developer at the Department of Education (DepEd), Technology Infrastructure Division under ICTS — building Power BI dashboards and Power Apps solutions that digitalized manual, paper-based office processes.",
    },
    {
      keywords: ["education", "degree", "school", "university", "study", "studied", "college"],
      answer: "Rae holds a B.S. in Computer Engineering from Rizal Technological University.",
    },
    {
      keywords: ["project", "portfolio", "built", "made", "demo", "example"],
      answer:
        "Two live projects: an office workflow automation app (Power Apps + Power Automate) replacing a manual paper process, and an operations reporting dashboard (Power BI + DAX). A third project is currently in progress. See the Projects section for demo links.",
    },
    {
      keywords: ["available", "hire", "hiring", "open to", "looking for", "job search", "opportunity"],
      answer:
        "Rae is currently open to internships and entry-level data analyst or automation roles. Feel free to reach out through the Contact section!",
    },
    {
      keywords: ["contact", "email", "reach", "linkedin", "get in touch", "connect"],
      answer:
        "You can reach Rae at delmonterei09@gmail.com or on LinkedIn (ray-del-monte-a41b3938a). Both are linked in the Contact section below.",
    },
    {
      keywords: ["resume", "cv"],
      answer: "You can download Rae's CV using the \"Download CV\" button at the top of the page.",
    },
    {
      keywords: ["hello", "hi", "hey", "sup", "yo"],
      answer: "Hi there! Ask me about Rae's experience, skills, or projects — or scroll down to see the full portfolio.",
    },
    {
      keywords: ["who are you", "what are you", "are you ai", "are you real", "bot"],
      answer:
        "I'm a simple assistant built into this portfolio to help you quickly find info about Rae — I answer from a fixed set of facts about her background rather than being a general AI. For anything I can't answer, please reach out directly.",
    },
    {
      keywords: ["thank", "thanks", "cool", "nice", "great"],
      answer: "You're welcome! Let me know if there's anything else you'd like to know about Rae.",
    },
  ];

  var FALLBACK =
    "I don't have an answer for that yet. Try asking about Rae's skills, experience, education, projects, or how to get in touch — or scroll down to explore the portfolio directly.";

  var QUICK_REPLIES = [
    { label: "Skills", question: "What skills does Rae have?" },
    { label: "Experience", question: "What is her work experience?" },
    { label: "Projects", question: "Show me her projects" },
    { label: "Contact", question: "How do I contact her?" },
  ];

  function findAnswer(question) {
    var q = question.toLowerCase();
    var best = null;
    var bestScore = 0;

    FAQ.forEach(function (entry) {
      var score = 0;
      entry.keywords.forEach(function (kw) {
        if (q.indexOf(kw) !== -1) score += kw.split(" ").length;
      });
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });

    return best ? best.answer : FALLBACK;
  }

  /* ---------------------------------------------------------- */

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(text, role) {
    var row = document.createElement("div");
    row.className = "chat-row" + (role === "user" ? " chat-row-user" : "");

    if (role !== "user") {
      var avatar = document.createElement("span");
      avatar.className = "chat-avatar";
      avatar.textContent = "RM";
      row.appendChild(avatar);
    }

    var bubble = document.createElement("div");
    bubble.className = "chat-msg " + (role === "user" ? "chat-msg-user" : "chat-msg-bot");
    bubble.textContent = text;
    row.appendChild(bubble);

    messagesEl.appendChild(row);
    scrollToBottom();
  }

  function addTypingIndicator() {
    var row = document.createElement("div");
    row.className = "chat-typing-row";
    row.innerHTML =
      '<span class="chat-avatar">RM</span><span class="chat-typing"><span></span><span></span><span></span></span>';
    messagesEl.appendChild(row);
    scrollToBottom();
    return row;
  }

  function removeSuggestions() {
    var existing = document.querySelector(".chat-suggestions");
    if (existing) existing.remove();
  }

  function renderSuggestions() {
    removeSuggestions();
    var wrap = document.createElement("div");
    wrap.className = "chat-suggestions";
    QUICK_REPLIES.forEach(function (item) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chat-chip";
      chip.textContent = item.label;
      chip.addEventListener("click", function () {
        handleUserMessage(item.question);
      });
      wrap.appendChild(chip);
    });
    messagesEl.parentNode.insertBefore(wrap, messagesEl.nextSibling);
  }

  function handleUserMessage(text) {
    removeSuggestions();
    addMessage(text, "user");
    input.disabled = true;

    var typingRow = addTypingIndicator();

    setTimeout(function () {
      typingRow.remove();
      addMessage(findAnswer(text), "assistant");
      input.disabled = false;
      input.focus();
    }, 450 + Math.random() * 350);
  }

  /* ---------------------------------------------------------- */

  toggle.addEventListener("click", function () {
    var isOpen = widget.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    widget.classList.remove("attention");
    if (isOpen) input.focus();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    handleUserMessage(text);
  });

  /* Initial greeting + entrance choreography */
  addMessage(
    "Hi! I can answer questions about Rae's experience, skills, and projects — try one of these, or type your own.",
    "assistant"
  );
  renderSuggestions();

  window.addEventListener("load", function () {
    setTimeout(function () {
      widget.classList.add("widget-in");
      setTimeout(function () {
        widget.classList.add("attention");
      }, 400);
    }, 600);
  });
})();