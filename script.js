/* ============================================
   APERONIX AI — script.js
   ============================================ */

/* ── CONFIG ── */
// Replace with your actual Gemini API key
// For production: use a backend proxy instead of exposing key here
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are Aperonix AI, a highly intelligent, helpful, and friendly AI assistant. 
Provide accurate, detailed, and well-structured responses. 
Format responses using Markdown when appropriate (headers, bold, code blocks, lists). 
Be concise yet thorough. Always be respectful and professional.`;

/* ── STATE ── */
let chats = [];
let activeChatId = null;
let isLoading = false;

/* ── DOM REFS ── */
const sidebar          = document.getElementById('sidebar');
const sidebarOverlay   = document.getElementById('sidebar-overlay');
const chatList         = document.getElementById('chat-list');
const chatArea         = document.getElementById('chat-area');
const welcomeScreen    = document.getElementById('welcome-screen');
const messagesEl       = document.getElementById('messages');
const userInput        = document.getElementById('user-input');
const btnSend          = document.getElementById('btn-send');
const topbarTitle      = document.getElementById('topbar-title');
const imageHint        = document.getElementById('image-hint');
const charCount        = document.getElementById('char-count');
const settingsModal    = document.getElementById('settings-modal');
const themesGrid       = document.getElementById('themes-grid');

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadChats();
  renderChatList();
  buildThemeCards();
  bindEvents();

  if (chats.length === 0) {
    newChat();
  } else {
    setActiveChat(activeChatId || chats[0].id);
  }
});

/* ============================================
   THEME
   ============================================ */
const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight Blue',
    desc: 'Deep dark with crystal blue',
    bg: '#070b14', surface: '#0d1526', accent: '#4facfe', accent2: '#00f2fe',
  },
  {
    id: 'purple',
    name: 'Royal Purple Neon',
    desc: 'Mystique with purple & pink',
    bg: '#08050f', surface: '#110a1f', accent: '#a78bfa', accent2: '#f472b6',
  },
  {
    id: 'emerald',
    name: 'Emerald Green Pro',
    desc: 'Deep forest with emerald glow',
    bg: '#030d0a', surface: '#071510', accent: '#34d399', accent2: '#6ee7b7',
  },
  {
    id: 'light',
    name: 'Clean Light Minimal',
    desc: 'Crisp white with indigo elegance',
    bg: '#f0f4ff', surface: '#ffffff', accent: '#6366f1', accent2: '#818cf8',
  },
];

function loadTheme() {
  const saved = localStorage.getItem('aperonix-theme') || 'midnight';
  document.documentElement.setAttribute('data-theme', saved);
}

function applyTheme(id) {
  document.documentElement.setAttribute('data-theme', id);
  localStorage.setItem('aperonix-theme', id);
  document.querySelectorAll('.theme-card').forEach(c => {
    c.classList.toggle('active', c.dataset.theme === id);
  });
}

function buildThemeCards() {
  const current = localStorage.getItem('aperonix-theme') || 'midnight';
  themesGrid.innerHTML = '';
  THEMES.forEach(t => {
    const card = document.createElement('div');
    card.className = `theme-card${t.id === current ? ' active' : ''}`;
    card.dataset.theme = t.id;
    card.innerHTML = `
      <div class="theme-preview" style="background:${t.bg}">
        <div class="theme-preview-bar" style="background:${t.surface}"></div>
        <div class="theme-preview-dot" style="background:linear-gradient(135deg,${t.accent},${t.accent2})"></div>
        <div class="theme-preview-check" style="background:${t.accent}">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${t.bg}" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>
      <div class="theme-card-name">${t.name}</div>
      <div class="theme-card-desc">${t.desc}</div>
    `;
    card.addEventListener('click', () => applyTheme(t.id));
    themesGrid.appendChild(card);
  });
}

/* ============================================
   CHAT MANAGEMENT
   ============================================ */
function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function loadChats() {
  try {
    chats = JSON.parse(localStorage.getItem('aperonix-chats') || '[]');
    activeChatId = localStorage.getItem('aperonix-active') || null;
  } catch { chats = []; }
}

function saveChats() {
  localStorage.setItem('aperonix-chats', JSON.stringify(chats));
  if (activeChatId) localStorage.setItem('aperonix-active', activeChatId);
}

function newChat() {
  const chat = {
    id: generateId(),
    title: 'New Chat',
    messages: [],
    createdAt: Date.now(),
  };
  chats.unshift(chat);
  saveChats();
  setActiveChat(chat.id);
  renderChatList();
  closeSidebar();
}

function setActiveChat(id) {
  activeChatId = id;
  localStorage.setItem('aperonix-active', id);
  renderMessages();
  renderChatList();
  updateTopbarTitle();
}

function getActiveChat() {
  return chats.find(c => c.id === activeChatId);
}

function updateTopbarTitle() {
  const chat = getActiveChat();
  if (topbarTitle) topbarTitle.textContent = chat ? chat.title : 'New Chat';
}

function renameChat(id, newTitle) {
  const chat = chats.find(c => c.id === id);
  if (chat && newTitle.trim()) {
    chat.title = newTitle.trim();
    saveChats();
    renderChatList();
    updateTopbarTitle();
  }
}

function deleteChat(id) {
  chats = chats.filter(c => c.id !== id);
  if (chats.length === 0) {
    newChat(); return;
  }
  if (activeChatId === id) {
    setActiveChat(chats[0].id);
  }
  saveChats();
  renderChatList();
}

function duplicateChat(id) {
  const chat = chats.find(c => c.id === id);
  if (!chat) return;
  const dup = {
    ...chat,
    id: generateId(),
    title: chat.title + ' (copy)',
    messages: JSON.parse(JSON.stringify(chat.messages)),
    createdAt: Date.now(),
  };
  const idx = chats.findIndex(c => c.id === id);
  chats.splice(idx + 1, 0, dup);
  saveChats();
  setActiveChat(dup.id);
  renderChatList();
}

/* ============================================
   RENDER CHAT LIST
   ============================================ */
function renderChatList() {
  if (chats.length === 0) {
    chatList.innerHTML = `
      <div class="chat-empty">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        No chats yet. Start a conversation!
      </div>`;
    return;
  }

  chatList.innerHTML = '';
  chats.forEach(chat => {
    const item = document.createElement('div');
    item.className = `chat-item${chat.id === activeChatId ? ' active' : ''}`;
    item.dataset.id = chat.id;
    item.innerHTML = `
      <svg class="chat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span class="chat-item-title">${escHtml(chat.title)}</span>
      <button class="chat-item-menu-btn" data-id="${chat.id}" title="Options">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </button>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('.chat-item-menu-btn') || e.target.closest('.chat-dropdown')) return;
      setActiveChat(chat.id);
      closeSidebar();
    });

    item.querySelector('.chat-item-menu-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns();
      openDropdown(chat, item);
    });

    chatList.appendChild(item);
  });
}

let activeDropdown = null;

function openDropdown(chat, itemEl) {
  closeAllDropdowns();
  const drop = document.createElement('div');
  drop.className = 'chat-dropdown';
  drop.innerHTML = `
    <button class="rename-btn">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      Rename
    </button>
    <button class="dup-btn">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      Duplicate
    </button>
    <div class="divider"></div>
    <button class="del-btn danger">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      Delete
    </button>
  `;

  drop.querySelector('.rename-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    startRename(chat, itemEl);
  });
  drop.querySelector('.dup-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    duplicateChat(chat.id);
  });
  drop.querySelector('.del-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    deleteChat(chat.id);
  });

  itemEl.appendChild(drop);
  activeDropdown = drop;
}

function closeAllDropdowns() {
  document.querySelectorAll('.chat-dropdown').forEach(d => d.remove());
  activeDropdown = null;
}

document.addEventListener('click', () => closeAllDropdowns());

function startRename(chat, itemEl) {
  const titleEl = itemEl.querySelector('.chat-item-title');
  const orig = chat.title;
  titleEl.outerHTML = `<input class="rename-input" value="${escHtml(orig)}" maxlength="60" />`;
  const input = itemEl.querySelector('.rename-input');
  input.focus();
  input.select();

  const finish = () => {
    renameChat(chat.id, input.value || orig);
  };
  input.addEventListener('blur', finish);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.value = orig; input.blur(); }
  });
}

/* ============================================
   RENDER MESSAGES
   ============================================ */
function renderMessages() {
  const chat = getActiveChat();
  if (!chat || chat.messages.length === 0) {
    welcomeScreen.style.display = 'flex';
    messagesEl.style.display = 'none';
    return;
  }
  welcomeScreen.style.display = 'none';
  messagesEl.style.display = 'block';
  messagesEl.innerHTML = '';
  chat.messages.forEach(msg => appendMessageToDOM(msg));
  scrollBottom();
}

function appendMessageToDOM(msg) {
  welcomeScreen.style.display = 'none';
  messagesEl.style.display = 'block';

  const row = document.createElement('div');
  row.className = `message-row ${msg.role}`;
  row.dataset.id = msg.id;

  const avatarHtml = msg.role === 'user'
    ? `<div class="avatar"><div class="avatar-user">U</div></div>`
    : `<div class="avatar">
        <img class="avatar-ai" src="logo.png" alt="AI" onerror="this.outerHTML='<div class=\\'avatar-ai-fallback\\'>A</div>'" />
       </div>`;

  let contentHtml = '';

  if (msg.error) {
    contentHtml = `<div class="bubble-error">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      ${escHtml(msg.error)}
    </div>`;
  } else if (msg.role === 'user') {
    contentHtml = `<div class="bubble bubble-user">${escHtml(msg.content)}</div>`;
  } else {
    contentHtml = `<div class="bubble bubble-ai">${renderMarkdown(msg.content)}</div>`;
  }

  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const actionsHtml = msg.role === 'assistant' ? `
    <div class="bubble-actions">
      <span>${time}</span>
      <button onclick="copyMsg('${msg.id}', this)">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Copy
      </button>
    </div>` : '';

  row.innerHTML = `
    ${avatarHtml}
    <div class="bubble-wrap">
      ${contentHtml}
      ${actionsHtml}
    </div>
  `;

  messagesEl.appendChild(row);
}

function scrollBottom(smooth = true) {
  chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

/* ============================================
   MARKDOWN RENDERER
   ============================================ */
function renderMarkdown(text) {
  if (!text) return '';

  let html = escHtml(text);

  // Code blocks (must come before inline code)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const id = 'cb_' + Math.random().toString(36).slice(2, 8);
    return `<div class="code-block">
      <div class="code-block-header">
        <span class="code-lang">${lang || 'code'}</span>
        <button class="btn-copy-code" onclick="copyCode('${id}', this)">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy
        </button>
      </div>
      <pre id="${id}"><code>${code.trim()}</code></pre>
    </div>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Blockquote
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:12px 0">');

  // Unordered list
  html = html.replace(/^[*\-] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`);

  // Ordered list
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Paragraphs (double newline)
  html = html.replace(/\n\n+/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) html = `<p>${html}</p>`;

  return html;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============================================
   COPY FUNCTIONS
   ============================================ */
function copyCode(id, btn) {
  const pre = document.getElementById(id);
  if (!pre) return;
  navigator.clipboard.writeText(pre.innerText).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
    }, 2000);
  });
}

function copyMsg(msgId, btn) {
  const chat = getActiveChat();
  if (!chat) return;
  const msg = chat.messages.find(m => m.id === msgId);
  if (!msg) return;
  navigator.clipboard.writeText(msg.content).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Copied`;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
    }, 2000);
  });
}

/* ============================================
   SEND MESSAGE & GEMINI API
   ============================================ */
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  const chat = getActiveChat();
  if (!chat) return;

  // Auto-title from first message
  if (chat.messages.length === 0) {
    chat.title = text.slice(0, 48) + (text.length > 48 ? '…' : '');
    updateTopbarTitle();
    renderChatList();
  }

  // Add user message
  const userMsg = { id: generateId(), role: 'user', content: text, timestamp: Date.now() };
  chat.messages.push(userMsg);
  saveChats();
  appendMessageToDOM(userMsg);
  userInput.value = '';
  userInput.style.height = 'auto';
  charCount.textContent = '';
  imageHint.style.display = 'none';
  scrollBottom();

  // Show loading
  isLoading = true;
  btnSend.disabled = true;
  const loadingEl = showLoading();

  try {
    const aiText = await callGemini(chat.messages);
    loadingEl.remove();

    const aiMsg = { id: generateId(), role: 'assistant', content: aiText, timestamp: Date.now() };
    chat.messages.push(aiMsg);
    saveChats();
    appendMessageToDOM(aiMsg);
  } catch (err) {
    loadingEl.remove();
    const errMsg = {
      id: generateId(), role: 'assistant', content: '',
      error: err.message || 'Failed to get response. Please try again.',
      timestamp: Date.now(),
    };
    chat.messages.push(errMsg);
    saveChats();
    appendMessageToDOM(errMsg);
  }

  isLoading = false;
  btnSend.disabled = false;
  scrollBottom();
}

function showLoading() {
  const el = document.createElement('div');
  el.className = 'loading-row';
  el.innerHTML = `
    <div class="avatar">
      <img class="avatar-ai logo-spinning" src="logo.png" alt="AI" 
        onerror="this.outerHTML='<div class=\\'avatar-ai-fallback logo-spinning\\'>A</div>'" />
    </div>
    <div class="typing-bubble">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>`;
  messagesEl.appendChild(el);
  scrollBottom();
  return el;
}

async function callGemini(messages) {
  // Build conversation history for Gemini
  const contents = [];

  // Add system context as first user turn
  contents.push({
    role: 'user',
    parts: [{ text: SYSTEM_PROMPT }],
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'Understood! I am Aperonix AI, ready to help you.' }],
  });

  // Add actual conversation
  messages.forEach(msg => {
    if (msg.error) return; // skip error messages
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  });

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 400) throw new Error('Invalid API key. Please check your GEMINI_API_KEY in script.js.');
    if (response.status === 429) throw new Error('API quota exceeded. Please try again later.');
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini. Please try again.');
  return text;
}

/* ============================================
   SIDEBAR
   ============================================ */
function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('open');
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
}

/* ============================================
   EVENT BINDINGS
   ============================================ */
function bindEvents() {
  // New chat buttons
  document.getElementById('btn-new-chat')?.addEventListener('click', newChat);
  document.getElementById('btn-new-chat-mobile')?.addEventListener('click', newChat);

  // Mobile sidebar
  document.getElementById('btn-open-sidebar')?.addEventListener('click', openSidebar);
  document.getElementById('btn-close-sidebar')?.addEventListener('click', closeSidebar);
  sidebarOverlay?.addEventListener('click', closeSidebar);

  // Settings
  document.getElementById('btn-settings')?.addEventListener('click', openSettings);
  document.getElementById('btn-settings-mobile')?.addEventListener('click', openSettings);
  document.getElementById('modal-close')?.addEventListener('click', closeSettings);
  document.getElementById('modal-done')?.addEventListener('click', closeSettings);
  document.querySelector('.modal-backdrop')?.addEventListener('click', closeSettings);

  // Input
  userInput?.addEventListener('input', onInputChange);
  userInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  btnSend?.addEventListener('click', sendMessage);

  // Suggestions
  document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      userInput.value = btn.dataset.text || btn.textContent.trim();
      userInput.focus();
      onInputChange();
    });
  });
}

function onInputChange() {
  const val = userInput.value;
  charCount.textContent = val.length > 0 ? `${val.length}` : '';
  btnSend.disabled = val.trim().length === 0;

  // Image hint
  if (val.startsWith('/image')) {
    imageHint.style.display = 'flex';
  } else {
    imageHint.style.display = 'none';
  }

  // Auto resize
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 200) + 'px';
}

function openSettings() {
  settingsModal.classList.add('open');
  buildThemeCards();
}
function closeSettings() {
  settingsModal.classList.remove('open');
}

// Expose globals for inline onclick
window.copyCode = copyCode;
window.copyMsg = copyMsg;
