/**
 * Aperonix AI — Chat Application
 * Handles all UI interactions and API communication
 */

(function () {
  "use strict";

  // --- DOM References ---
  const messagesContainer = document.getElementById("messagesContainer");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const newChatBtn = document.getElementById("newChatBtn");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  const welcomeScreen = document.getElementById("welcomeScreen");

  // --- State ---
  let conversationHistory = [];
  let isGenerating = false;

  // --- Sidebar Overlay (mobile) ---
  const overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";
  document.body.appendChild(overlay);

  // --- Sidebar Toggle ---
  sidebarToggle.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("mobile-open");
      overlay.classList.toggle("visible");
    } else {
      sidebar.classList.toggle("collapsed");
    }
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("mobile-open");
    overlay.classList.remove("visible");
  });

  // --- New Chat ---
  newChatBtn.addEventListener("click", () => {
    conversationHistory = [];
    messagesContainer.innerHTML = "";
    if (welcomeScreen) {
      messagesContainer.appendChild(welcomeScreen);
      welcomeScreen.style.display = "flex";
    }
    userInput.value = "";
    updateSendButton();
  });

  // --- Suggestion Cards ---
  document.querySelectorAll(".suggestion-card").forEach((card) => {
    card.addEventListener("click", () => {
      const prompt = card.getAttribute("data-prompt");
      if (prompt) {
        userInput.value = prompt;
        updateSendButton();
        handleSend();
      }
    });
  });

  // --- Input Handling ---
  userInput.addEventListener("input", () => {
    autoResize(userInput);
    updateSendButton();
  });

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) handleSend();
    }
  });

  sendBtn.addEventListener("click", handleSend);

  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  function updateSendButton() {
    sendBtn.disabled = userInput.value.trim() === "" || isGenerating;
  }

  // --- Send Message ---
  async function handleSend() {
    const message = userInput.value.trim();
    if (!message || isGenerating) return;

    // Hide welcome screen
    if (welcomeScreen && welcomeScreen.parentNode) {
      welcomeScreen.style.display = "none";
    }

    isGenerating = true;
    updateSendButton();

    // Add user message to UI
    appendMessage("user", message);

    // Clear input
    userInput.value = "";
    userInput.style.height = "auto";

    // Add to history
    conversationHistory.push({ role: "user", content: message });

    // Show loading
    const loadingEl = appendLoading();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      const data = await response.json();

      // Remove loading
      loadingEl.remove();

      if (!response.ok || data.error) {
        showError(data.error || "Something went wrong. Please try again.");
        conversationHistory.pop(); // Remove failed user message from history
      } else {
        const reply = data.reply;
        appendMessage("bot", reply);
        conversationHistory.push({ role: "assistant", content: reply });
      }
    } catch (err) {
      loadingEl.remove();
      showError("Network error. Check your connection and try again.");
      conversationHistory.pop();
    } finally {
      isGenerating = false;
      updateSendButton();
    }
  }

  // --- Append User/Bot Message ---
  function appendMessage(role, content) {
    const messageEl = document.createElement("div");
    messageEl.className = `message ${role}`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = role === "user" ? "U" : "⬡";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    if (role === "bot") {
      bubble.innerHTML = renderMarkdown(content);
    } else {
      bubble.textContent = content;
    }

    messageEl.appendChild(avatar);
    messageEl.appendChild(bubble);
    messagesContainer.appendChild(messageEl);
    scrollToBottom();

    return messageEl;
  }

  // --- Loading Indicator ---
  function appendLoading() {
    const messageEl = document.createElement("div");
    messageEl.className = "message bot";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "⬡";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble loading-indicator";
    bubble.innerHTML = `
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    `;

    messageEl.appendChild(avatar);
    messageEl.appendChild(bubble);
    messagesContainer.appendChild(messageEl);
    scrollToBottom();

    return messageEl;
  }

  // --- Scroll to Bottom ---
  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  // --- Basic Markdown Renderer ---
  function renderMarkdown(text) {
    let html = escapeHtml(text);

    // Code blocks (must come before inline code)
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/_([^_]+)_/g, "<em>$1</em>");

    // Headings
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");

    // Unordered lists
    html = html.replace(/^\s*[-*] (.+)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>[\s\S]+?<\/li>)(?!\s*<li>)/g, "<ul>$1</ul>");

    // Ordered lists
    html = html.replace(/^\s*\d+\. (.+)$/gm, "<li>$1</li>");

    // Line breaks to paragraphs
    html = html
      .split(/\n{2,}/)
      .map((para) => {
        para = para.trim();
        if (!para) return "";
        if (/^<(h[1-6]|pre|ul|ol|blockquote)/.test(para)) return para;
        return `<p>${para.replace(/\n/g, "<br>")}</p>`;
      })
      .join("");

    return html;
  }

  // --- HTML Escape ---
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- Error Toast ---
  let errorTimeout;

  function showError(message) {
    let toast = document.querySelector(".error-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "error-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("visible");

    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => {
      toast.classList.remove("visible");
    }, 4000);
  }

  // --- Init ---
  userInput.focus();
})();
