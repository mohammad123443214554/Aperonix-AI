// script.js — Aperonix AI Frontend Logic

// ── DOM References ────────────────────────────────────────────
const chatMessages    = document.getElementById("chat-messages");
const userInput       = document.getElementById("user-input");
const sendBtn         = document.getElementById("send-btn");
const newChatBtn      = document.getElementById("new-chat-btn");
const historyList     = document.getElementById("history-list");
const sidebarToggle   = document.getElementById("sidebar-toggle");
const sidebar         = document.getElementById("sidebar");
const charCount       = document.getElementById("char-count");
const welcomeScreen   = document.getElementById("welcome-screen");

// ── State ──────────────────────────────────────────────────────
const STORAGE_KEY  = "aperonix_sessions";
const ACTIVE_KEY   = "aperonix_active_session";
let activeSessions = [];
let activeSessionId = null;

// ── Init ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadSessions();
  renderSidebar();

  const lastId = localStorage.getItem(ACTIVE_KEY);
  if (lastId && activeSessions.find(s => s.id === lastId)) {
    loadSession(lastId);
  } else {
    showWelcome();
  }

  // Input events
  userInput.addEventListener("input", onInputChange);
  userInput.addEventListener("keydown", onKeyDown);
  sendBtn.addEventListener("click", handleSend);
  newChatBtn.addEventListener("click", startNewChat);
  sidebarToggle?.addEventListener("click", toggleSidebar);

  // Suggestion chips
  document.querySelectorAll(".suggestion-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      userInput.value = btn.dataset.prompt || btn.textContent.trim();
      onInputChange();
      userInput.focus();
    });
  });
});

// ── Session Management ─────────────────────────────────────────
function loadSessions() {
  try {
    activeSessions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { activeSessions = []; }
}

function saveSessions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activeSessions));
}

function getActiveSession() {
  return activeSessions.find(s => s.id === activeSessionId);
}

function createSession(firstMessage) {
  const id = "s_" + Date.now();
  const title = firstMessage.length > 40
    ? firstMessage.slice(0, 40) + "…"
    : firstMessage;
  const session = { id, title, messages: [], createdAt: Date.now() };
  activeSessions.unshift(session);
  saveSessions();
  return session;
}

function loadSession(id) {
  activeSessionId = id;
  localStorage.setItem(ACTIVE_KEY, id);

  const session = getActiveSession();
  if (!session) return;

  // Hide welcome, clear chat
  if (welcomeScreen) welcomeScreen.style.display = "none";
  chatMessages.innerHTML = "";

  session.messages.forEach(m => renderBubble(m.role, m.content, false));
  scrollToBottom();
  renderSidebar();
}

function startNewChat() {
  activeSessionId = null;
  localStorage.removeItem(ACTIVE_KEY);
  chatMessages.innerHTML = "";
  showWelcome();
  renderSidebar();
  userInput.value = "";
  onInputChange();
  userInput.focus();
}

function showWelcome() {
  if (welcomeScreen) welcomeScreen.style.display = "flex";
}

// ── Sidebar ─────────────────────────────────────────────────────
function renderSidebar() {
  historyList.innerHTML = "";

  if (activeSessions.length === 0) {
    historyList.innerHTML = `<p class="no-history">No conversations yet.</p>`;
    return;
  }

  activeSessions.forEach(session => {
    const item = document.createElement("button");
    item.className = "history-item" + (session.id === activeSessionId ? " active" : "");
    item.title = session.title;
    item.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span>${escapeHTML(session.title)}</span>
      <button class="del-btn" data-id="${session.id}" title="Delete">✕</button>`;

    item.addEventListener("click", (e) => {
      if (e.target.classList.contains("del-btn")) {
        deleteSession(e.target.dataset.id);
        return;
      }
      loadSession(session.id);
      if (window.innerWidth < 768) sidebar.classList.remove("open");
    });

    historyList.appendChild(item);
  });
}

function deleteSession(id) {
  activeSessions = activeSessions.filter(s => s.id !== id);
  saveSessions();
  if (id === activeSessionId) startNewChat();
  else renderSidebar();
}

function toggleSidebar() {
  sidebar.classList.toggle("open");
}

// ── Input Helpers ──────────────────────────────────────────────
function onInputChange() {
  const len = userInput.value.length;
  if (charCount) charCount.textContent = `${len}/4000`;
  sendBtn.disabled = userInput.value.trim() === "";
  autoResize(userInput);
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 200) + "px";
}

function onKeyDown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) handleSend();
  }
}

// ── Send & Receive ─────────────────────────────────────────────
async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  // Hide welcome screen
  if (welcomeScreen) welcomeScreen.style.display = "none";

  // Create session on first message
  if (!activeSessionId) {
    const session = createSession(text);
    activeSessionId = session.id;
    localStorage.setItem(ACTIVE_KEY, session.id);
    renderSidebar();
  }

  // Add user message
  addToSession("user", text);
  renderBubble("user", text);

  // Reset input
  userInput.value = "";
  userInput.style.height = "auto";
  sendBtn.disabled = true;
  if (charCount) charCount.textContent = "0/4000";

  // Show typing indicator
  const typingId = showTyping();

  try {
    const history = getActiveSession()?.messages.slice(-20) || [];
    const reply = await fetchAIReply(text, history);
    removeTyping(typingId);
    addToSession("assistant", reply);
    renderBubble("assistant", reply);
  } catch (err) {
    removeTyping(typingId);
    renderBubble("assistant", `⚠️ **Error:** ${err.message}`, false, true);
  }
}

async function fetchAIReply(message, history) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server error ${response.status}`);
  }

  return data.reply;
}

function addToSession(role, content) {
  const session = getActiveSession();
  if (!session) return;
  session.messages.push({ role, content, ts: Date.now() });
  saveSessions();
}

// ── Render Bubbles ─────────────────────────────────────────────
function renderBubble(role, text, animate = true, isError = false) {
  const wrap = document.createElement("div");
  wrap.className = `msg-wrap ${role}${animate ? " entering" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "U" : "A";

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}${isError ? " error" : ""}`;
  bubble.innerHTML = formatMessage(text);

  wrap.appendChild(role === "user" ? bubble : avatar);
  wrap.appendChild(role === "user" ? avatar : bubble);

  // Add copy button to AI messages
  if (role === "assistant") {
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.title = "Copy response";
    copyBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerHTML = "✓";
        setTimeout(() => {
          copyBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
        }, 1500);
      });
    });
    wrap.appendChild(copyBtn);
  }

  chatMessages.appendChild(wrap);
  scrollToBottom();

  if (animate) {
    requestAnimationFrame(() => wrap.classList.remove("entering"));
  }
}

// ── Typing Indicator ───────────────────────────────────────────
function showTyping() {
  const id = "typing_" + Date.now();
  const wrap = document.createElement("div");
  wrap.id = id;
  wrap.className = "msg-wrap assistant";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "A";

  const bubble = document.createElement("div");
  bubble.className = "bubble assistant typing";
  bubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  chatMessages.appendChild(wrap);
  scrollToBottom();
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

// ── Markdown-lite Formatter ────────────────────────────────────
function formatMessage(text) {
  // Escape HTML first
  let t = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Code blocks (``` lang)
  t = t.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="lang-${lang || 'text'}">${code.trim()}</code></pre>`);

  // Inline code
  t = t.replace(/`([^`\n]+)`/g, "<code>$1</code>");

  // Bold
  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic
  t = t.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Headers
  t = t.replace(/^### (.+)$/gm, "<h4>$1</h4>");
  t = t.replace(/^## (.+)$/gm, "<h3>$1</h3>");
  t = t.replace(/^# (.+)$/gm, "<h2>$1</h2>");

  // Unordered lists
  t = t.replace(/^\s*[-•] (.+)$/gm, "<li>$1</li>");
  t = t.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");

  // Line breaks
  t = t.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>");
  t = `<p>${t}</p>`;

  return t;
}

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function scrollToBottom() {
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });
}
