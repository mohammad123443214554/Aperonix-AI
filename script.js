// script.js — Aperonix AI Frontend Logic

document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chat-messages");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const clearBtn = document.getElementById("clear-btn");
  const charCount = document.getElementById("char-count");

  const MAX_CHARS = 2000;

  // ── On load: restore chat history ──────────────────────────────────────────
  const savedHistory = Memory.load();
  if (savedHistory.length > 0) {
    savedHistory.forEach(({ role, content }) => {
      appendMessage(role === "user" ? "user" : "ai", content, false);
    });
    scrollToBottom();
  } else {
    showWelcome();
  }

  // ── Input character counter ─────────────────────────────────────────────────
  userInput.addEventListener("input", () => {
    const len = userInput.value.length;
    charCount.textContent = `${len} / ${MAX_CHARS}`;
    charCount.style.color = len > MAX_CHARS * 0.9 ? "var(--accent-warn)" : "var(--text-muted)";
    sendBtn.disabled = len === 0 || len > MAX_CHARS;
  });

  // ── Send on Enter (Shift+Enter = newline) ───────────────────────────────────
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  sendBtn.addEventListener("click", handleSend);
  clearBtn.addEventListener("click", handleClear);

  // ── Core send handler ───────────────────────────────────────────────────────
  async function handleSend() {
    const text = userInput.value.trim();
    if (!text || text.length > MAX_CHARS) return;

    // Remove welcome screen if present
    const welcome = document.getElementById("welcome-screen");
    if (welcome) welcome.remove();

    // Display user message
    appendMessage("user", text);
    Memory.save("user", text);

    // Clear input
    userInput.value = "";
    charCount.textContent = `0 / ${MAX_CHARS}`;
    sendBtn.disabled = true;
    userInput.style.height = "auto";

    // Show loading indicator
    const loaderId = showLoader();

    try {
      const history = Memory.getForAPI();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await response.json();

      removeLoader(loaderId);

      if (!response.ok) {
        appendMessage("ai", `❌ Error: ${data.error || "Something went wrong. Please try again."}`, true);
        return;
      }

      appendMessage("ai", data.reply);
      Memory.save("assistant", data.reply);

    } catch (err) {
      removeLoader(loaderId);
      appendMessage("ai", "❌ Network error. Please check your connection and try again.", true);
      console.error("Aperonix fetch error:", err);
    }

    scrollToBottom();
  }

  // ── Clear chat ──────────────────────────────────────────────────────────────
  function handleClear() {
    if (!confirm("Clear all chat history?")) return;
    Memory.clear();
    chatMessages.innerHTML = "";
    showWelcome();
  }

  // ── Append a message bubble ─────────────────────────────────────────────────
  function appendMessage(role, text, isError = false) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("message-wrapper", role === "user" ? "user-wrapper" : "ai-wrapper");

    const bubble = document.createElement("div");
    bubble.classList.add("message-bubble", role === "user" ? "user-bubble" : "ai-bubble");
    if (isError) bubble.classList.add("error-bubble");

    // Render line breaks and basic markdown-ish formatting
    bubble.innerHTML = formatText(text);

    // Timestamp
    const time = document.createElement("span");
    time.classList.add("message-time");
    time.textContent = getTime();

    wrapper.appendChild(bubble);
    wrapper.appendChild(time);
    chatMessages.appendChild(wrapper);

    // Animate in
    requestAnimationFrame(() => bubble.classList.add("visible"));

    scrollToBottom();
  }

  // ── Loading dots ────────────────────────────────────────────────────────────
  function showLoader() {
    const id = "loader-" + Date.now();
    const wrapper = document.createElement("div");
    wrapper.classList.add("message-wrapper", "ai-wrapper");
    wrapper.id = id;

    const bubble = document.createElement("div");
    bubble.classList.add("message-bubble", "ai-bubble", "loader-bubble", "visible");
    bubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;

    wrapper.appendChild(bubble);
    chatMessages.appendChild(wrapper);
    scrollToBottom();
    return id;
  }

  function removeLoader(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // ── Welcome screen ──────────────────────────────────────────────────────────
  function showWelcome() {
    const div = document.createElement("div");
    div.id = "welcome-screen";
    div.innerHTML = `
      <div class="welcome-icon">✦</div>
      <h2>Welcome to Aperonix AI</h2>
      <p>Your intelligent assistant, crafted by <strong>Kadir Khan</strong>.</p>
      <p class="welcome-sub">Ask me anything — coding, learning, knowledge, and more.</p>
    `;
    chatMessages.appendChild(div);
  }

  // ── Utilities ───────────────────────────────────────────────────────────────
  function scrollToBottom() {
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });
  }

  function getTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function formatText(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Code blocks
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      // Inline code
      .replace(/`([^`]+)`/g, "<code class='inline-code'>$1</code>")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Newlines
      .replace(/\n/g, "<br>");
  }

  // Auto-resize textarea
  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 160) + "px";
  });
});
