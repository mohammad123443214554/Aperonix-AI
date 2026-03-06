// script.js — Aperonix AI Frontend Logic

const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");

// Conversation history for context
let conversationHistory = [];

// Auto-resize textarea
userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 160) + "px";
});

// Send on Enter (Shift+Enter for newline)
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);
newChatBtn.addEventListener("click", startNewChat);

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Hide welcome screen
  document.getElementById("welcomeScreen").style.display = "none";
  chatMessages.style.display = "flex";

  appendMessage("user", text);
  conversationHistory.push({ role: "user", content: text });

  userInput.value = "";
  userInput.style.height = "auto";
  setInputEnabled(false);

  const typingId = showTypingIndicator();

  fetchAIResponse(text)
    .then((reply) => {
      removeTypingIndicator(typingId);
      appendMessage("assistant", reply);
      conversationHistory.push({ role: "assistant", content: reply });
    })
    .catch((err) => {
      removeTypingIndicator(typingId);
      appendMessage("assistant", "⚠️ Something went wrong. Please try again.");
      console.error(err);
    })
    .finally(() => {
      setInputEnabled(true);
      userInput.focus();
    });
}

async function fetchAIResponse(message) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: conversationHistory.slice(-10), // send last 10 turns for context
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "API error");
  }

  const data = await response.json();
  return data.reply;
}

function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", role === "user" ? "user-wrapper" : "ai-wrapper");

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble", role === "user" ? "user-bubble" : "ai-bubble");

  if (role === "assistant") {
    bubble.innerHTML = formatMarkdown(text);
  } else {
    bubble.textContent = text;
  }

  // Add avatar for AI
  if (role === "assistant") {
    const avatar = document.createElement("div");
    avatar.classList.add("ai-avatar");
    avatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="url(#grad)"/>
      <defs><linearGradient id="grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stop-color="#6366f1"/><stop offset="1" stop-color="#06b6d4"/>
      </linearGradient></defs>
      <path d="M8 12h8M12 8v8" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
    wrapper.appendChild(avatar);
  }

  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Animate in
  requestAnimationFrame(() => {
    bubble.classList.add("visible");
  });
}

function showTypingIndicator() {
  const id = "typing-" + Date.now();
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", "ai-wrapper");
  wrapper.id = id;

  const avatar = document.createElement("div");
  avatar.classList.add("ai-avatar");
  avatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="url(#grad2)"/>
    <defs><linearGradient id="grad2" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
      <stop stop-color="#6366f1"/><stop offset="1" stop-color="#06b6d4"/>
    </linearGradient></defs>
    <path d="M8 12h8M12 8v8" stroke="white" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble", "ai-bubble", "typing-bubble", "visible");
  bubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function setInputEnabled(enabled) {
  userInput.disabled = !enabled;
  sendBtn.disabled = !enabled;
  sendBtn.style.opacity = enabled ? "1" : "0.5";
}

function startNewChat() {
  conversationHistory = [];
  chatMessages.innerHTML = "";
  chatMessages.style.display = "none";
  document.getElementById("welcomeScreen").style.display = "flex";
  userInput.value = "";
  userInput.style.height = "auto";
  userInput.focus();
}

// Basic markdown formatter
function formatMarkdown(text) {
  return text
    // Code blocks
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code class="lang-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Unordered lists
    .replace(/^\s*[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Line breaks
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    // Wrap in paragraph
    .replace(/^(?!<[hupol]|<pre)(.+)$/gm, (m) => m.startsWith("<") ? m : m);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Suggestion chips
document.querySelectorAll(".suggestion-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    userInput.value = chip.dataset.prompt;
    userInput.focus();
    sendMessage();
  });
});
