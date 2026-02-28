/* =============================================
   APERONIX AI — script.js  (Complete Rewrite)
   ============================================= */

// ── GEMINI API CONFIG ────────────────────────
// Replace with your actual Gemini API key
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models' + GEMINI_API_KEY;

const SYSTEM_PROMPT =
  'You are Aperonix AI, a highly intelligent, helpful, and friendly AI assistant. ' +
  'Provide accurate, detailed, and well-structured responses. ' +
  'Use Markdown formatting — headers, bullet points, bold, code blocks where appropriate. ' +
  'Be concise yet thorough. Always be respectful and professional.';

// ── APP STATE ─────────────────────────────────
var chats = [];
var activeChatId = null;
var isLoading = false;

// ── HELPERS ───────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function saveData() {
  try {
    localStorage.setItem('aperonix-chats', JSON.stringify(chats));
    localStorage.setItem('aperonix-active', activeChatId || '');
  } catch(e) {}
}

function loadData() {
  try {
    var raw = localStorage.getItem('aperonix-chats');
    var active = localStorage.getItem('aperonix-active');
    if (raw) {
      chats = JSON.parse(raw);
      activeChatId = active || (chats[0] ? chats[0].id : null);
    }
  } catch(e) { chats = []; activeChatId = null; }
}

function getActive() {
  return chats.find(function(c) { return c.id === activeChatId; }) || null;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function el(id) { return document.getElementById(id); }

// ── THEME ─────────────────────────────────────
function applyTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId);
  try { localStorage.setItem('aperonix-theme', themeId); } catch(e) {}

  document.querySelectorAll('.theme-card').forEach(function(card) {
    card.classList.toggle('selected', card.getAttribute('data-theme') === themeId);
  });
}

function initTheme() {
  var t = 'midnight';
  try { t = localStorage.getItem('aperonix-theme') || 'midnight'; } catch(e) {}
  document.documentElement.setAttribute('data-theme', t);
  // Sync cards if modal already in DOM
  document.querySelectorAll('.theme-card').forEach(function(card) {
    card.classList.toggle('selected', card.getAttribute('data-theme') === t);
  });
}

// ── MARKDOWN RENDERER ─────────────────────────
function renderMarkdown(text) {
  var html = text;

  // Code blocks
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, function(_, lang, code) {
    var id = genId();
    var escaped = code.trim()
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return '<div class="code-block">' +
      '<div class="code-header">' +
        '<span class="code-lang">' + (lang || 'code') + '</span>' +
        '<button class="copy-btn" onclick="copyCode(this,\'' + id + '\')">' +
          '📋 Copy</button>' +
      '</div>' +
      '<pre id="code-' + id + '"><code>' + escaped + '</code></pre>' +
    '</div>';
  });

  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm,   '<h1>$1</h1>');

  // Blockquote
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // HR
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:10px 0;">');

  // Lists
  html = html.replace(/^[\-\*\+] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.+)$/gm,  '<li>$2</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)(\n(?=<li>)|$)/g, '$1');
  html = html.replace(/((<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Paragraphs
  var parts = html.split(/\n{2,}/);
  html = parts.map(function(p) {
    p = p.trim();
    if (!p) return '';
    if (/^<(h[1-6]|ul|ol|blockquote|div|pre|hr)/.test(p)) return p;
    return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
  }).join('');

  return html;
}

function copyCode(btn, id) {
  var pre = el('code-' + id);
  if (!pre) return;
  navigator.clipboard.writeText(pre.innerText).then(function() {
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = '📋 Copy';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(function() {
    // Fallback
    var ta = document.createElement('textarea');
    ta.value = pre.innerText;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = '✓ Copied!';
    setTimeout(function() { btn.textContent = '📋 Copy'; }, 2000);
  });
}

// ── CHAT CRUD ─────────────────────────────────
function createChat() {
  return { id: genId(), title: 'New Chat', messages: [], createdAt: Date.now() };
}

function newChat() {
  var chat = createChat();
  chats.unshift(chat);
  activeChatId = chat.id;
  saveData();
  renderSidebar();
  renderMessages();
  closeSidebar();
}

function selectChat(id) {
  activeChatId = id;
  saveData();
  renderSidebar();
  renderMessages();
  closeSidebar();
}

function deleteChat(id) {
  chats = chats.filter(function(c) { return c.id !== id; });
  if (activeChatId === id) {
    if (chats.length === 0) {
      var fresh = createChat();
      chats.push(fresh);
      activeChatId = fresh.id;
    } else {
      activeChatId = chats[0].id;
    }
  }
  saveData();
  renderSidebar();
  renderMessages();
}

function duplicateChat(id) {
  var src = chats.find(function(c) { return c.id === id; });
  if (!src) return;
  var dup = {
    id: genId(),
    title: src.title + ' (copy)',
    messages: JSON.parse(JSON.stringify(src.messages)),
    createdAt: Date.now()
  };
  var idx = chats.findIndex(function(c) { return c.id === id; });
  chats.splice(idx + 1, 0, dup);
  activeChatId = dup.id;
  saveData();
  renderSidebar();
  renderMessages();
}

function startRename(id) {
  var item = document.querySelector('.chat-item[data-id="' + id + '"]');
  if (!item) return;
  var titleEl = item.querySelector('.chat-item-title');
  var current = titleEl.textContent;

  var input = document.createElement('input');
  input.className = 'rename-input';
  input.value = current;
  titleEl.replaceWith(input);
  input.focus(); input.select();

  function finish() {
    var val = input.value.trim() || current;
    var chat = chats.find(function(c) { return c.id === id; });
    if (chat) chat.title = val;
    saveData();
    renderSidebar();
    if (activeChatId === id) {
      var tt = el('topbar-title');
      if (tt) tt.textContent = val;
    }
  }

  input.addEventListener('blur', finish);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter')  { input.blur(); }
    if (e.key === 'Escape') { input.value = current; input.blur(); }
  });
}

// ── DROPDOWN MENU ─────────────────────────────
var _openMenuId = null;

function toggleMenu(e, id) {
  e.stopPropagation();
  var menu = el('menu-' + id);
  if (!menu) return;
  var wasOpen = menu.classList.contains('open');
  closeAllMenus();
  if (!wasOpen) { menu.classList.add('open'); _openMenuId = id; }
}

function closeAllMenus() {
  document.querySelectorAll('.dropdown-menu.open').forEach(function(m) {
    m.classList.remove('open');
  });
  _openMenuId = null;
}

function renameMenu(id)    { closeAllMenus(); startRename(id); }
function duplicateMenu(id) { closeAllMenus(); duplicateChat(id); }
function deleteMenu(id)    { closeAllMenus(); deleteChat(id); }

document.addEventListener('click', function(e) {
  if (!e.target.closest('.chat-menu-btn') && !e.target.closest('.dropdown-menu')) {
    closeAllMenus();
  }
});

// ── SIDEBAR RENDER ────────────────────────────
function renderSidebar() {
  var list = el('chat-list');
  if (!list) return;

  if (chats.length === 0) {
    list.innerHTML =
      '<div style="text-align:center;padding:32px 12px;">' +
        '<div style="font-size:28px;margin-bottom:8px;opacity:0.25">💬</div>' +
        '<p style="font-size:11px;color:var(--text-muted)">No chats yet. Start a conversation!</p>' +
      '</div>';
    return;
  }

  list.innerHTML = chats.map(function(chat) {
    var isActive = chat.id === activeChatId;
    return '<div class="chat-item ' + (isActive ? 'active' : '') + '" ' +
      'data-id="' + chat.id + '" onclick="selectChat(\'' + chat.id + '\')">' +
      '<span class="chat-item-icon">💬</span>' +
      '<span class="chat-item-title">' + escHtml(chat.title) + '</span>' +
      '<button class="chat-menu-btn" onclick="toggleMenu(event,\'' + chat.id + '\')">⋯</button>' +
      '<div class="dropdown-menu" id="menu-' + chat.id + '">' +
        '<button class="dropdown-item" onclick="renameMenu(\'' + chat.id + '\')">✏️ Rename</button>' +
        '<button class="dropdown-item" onclick="duplicateMenu(\'' + chat.id + '\')">📋 Duplicate</button>' +
        '<div class="dropdown-divider"></div>' +
        '<button class="dropdown-item delete" onclick="deleteMenu(\'' + chat.id + '\')">🗑️ Delete</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ── MESSAGES RENDER ───────────────────────────
function renderMessages() {
  var container = el('chat-messages');
  var titleEl   = el('topbar-title');
  if (!container) return;

  var chat = getActive();

  if (!chat || chat.messages.length === 0) {
    container.innerHTML =
      '<div class="welcome-screen">' +
        '<div class="welcome-logo">' +
          '<img src="logo.png" alt="Aperonix AI" ' +
            'onerror="this.style.display=\'none\';this.parentElement.querySelector(\'.wl-fallback\').style.display=\'flex\'">' +
          '<span class="wl-fallback" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--bg-base);">A</span>' +
        '</div>' +
        '<h1 class="welcome-title">Hello, I\'m Aperonix AI</h1>' +
        '<p class="welcome-sub">' +
          'Your intelligent AI assistant powered by Google Gemini. ' +
          'Ask me anything — write, code, analyze, or type <code>/image</code> for image prompts.' +
        '</p>' +
        '<div class="suggestions-grid">' +
          '<button class="suggestion-btn" onclick="fillInput(\'Explain quantum computing simply\')">' +
            '<span class="suggestion-icon">💡</span> Explain quantum computing simply</button>' +
          '<button class="suggestion-btn" onclick="fillInput(\'Write a Python web scraper\')">' +
            '<span class="suggestion-icon">💻</span> Write a Python web scraper</button>' +
          '<button class="suggestion-btn" onclick="fillInput(\'Summarize the history of AI\')">' +
            '<span class="suggestion-icon">📖</span> Summarize the history of AI</button>' +
          '<button class="suggestion-btn" onclick="fillInput(\'Give me productivity tips for developers\')">' +
            '<span class="suggestion-icon">⚡</span> Productivity tips for developers</button>' +
        '</div>' +
      '</div>';

    if (titleEl) titleEl.textContent = 'Aperonix AI';
    return;
  }

  if (titleEl) titleEl.textContent = chat.title;
  container.innerHTML = chat.messages.map(renderMessageHTML).join('');
  scrollBottom();
}

function renderMessageHTML(msg) {
  var isUser = msg.role === 'user';
  var avatar = isUser
    ? '<div class="msg-avatar user-avatar">U</div>'
    : '<div class="msg-avatar ai-avatar">' +
        '<img src="logo.png" alt="AI" ' +
          'onerror="this.style.display=\'none\';this.parentElement.style.display=\'flex\';this.parentElement.style.alignItems=\'center\';this.parentElement.style.justifyContent=\'center\';this.parentElement.textContent=\'A\'">' +
      '</div>';

  var bubbleContent;
  if (msg.error) {
    bubbleContent = '<div class="error-text">⚠️ ' + escHtml(msg.error) + '</div>';
  } else if (isUser) {
    bubbleContent = escHtml(msg.content).replace(/\n/g, '<br>');
  } else {
    bubbleContent = renderMarkdown(msg.content);
  }

  return '<div class="message-row ' + (isUser ? 'user' : 'ai') + '">' +
    avatar +
    '<div class="msg-content">' +
      '<div class="msg-bubble ' + (isUser ? 'user' : 'ai') + '">' +
        bubbleContent +
      '</div>' +
    '</div>' +
  '</div>';
}

function appendMessage(msg) {
  var container = el('chat-messages');
  if (!container) return;

  var welcome = container.querySelector('.welcome-screen');
  if (welcome) container.innerHTML = '';

  var div = document.createElement('div');
  div.innerHTML = renderMessageHTML(msg);
  var node = div.firstElementChild;
  if (node) {
    container.appendChild(node);
    scrollBottom();
  }
}

function showTyping() {
  var container = el('chat-messages');
  if (!container) return;

  var row = document.createElement('div');
  row.className = 'message-row ai';
  row.id = 'typing-row';
  row.innerHTML =
    '<div class="msg-avatar ai-avatar" style="overflow:hidden;">' +
      '<img src="logo.png" alt="AI" class="logo-spin" ' +
        'onerror="this.style.display=\'none\';this.parentElement.textContent=\'A\'">' +
    '</div>' +
    '<div class="msg-content">' +
      '<div class="msg-bubble ai">' +
        '<div class="typing-indicator">' +
          '<div class="typing-dot"></div>' +
          '<div class="typing-dot"></div>' +
          '<div class="typing-dot"></div>' +
        '</div>' +
      '</div>' +
    '</div>';

  container.appendChild(row);
  scrollBottom();
}

function hideTyping() {
  var row = el('typing-row');
  if (row) row.remove();
}

function scrollBottom() {
  var c = el('chat-messages');
  if (c) c.scrollTop = c.scrollHeight;
}

function fillInput(text) {
  var inp = el('chat-input');
  if (!inp) return;
  inp.value = text;
  inp.focus();
  autoResize(inp);
  updateSendBtn();
}

// ── SEND MESSAGE ──────────────────────────────
async function sendMessage() {
  if (isLoading) return;
  var inp = el('chat-input');
  var text = inp ? inp.value.trim() : '';
  if (!text) return;

  // Make sure we have an active chat
  if (!activeChatId || !getActive()) newChat();
  var chat = getActive();
  if (!chat) return;

  // Auto-title on first message
  if (chat.messages.length === 0) {
    chat.title = text.slice(0, 48) + (text.length > 48 ? '…' : '');
  }

  var userMsg = { id: genId(), role: 'user', content: text, ts: Date.now() };
  chat.messages.push(userMsg);
  saveData();
  renderSidebar();
  appendMessage(userMsg);

  // Clear input
  inp.value = '';
  autoResize(inp);
  updateSendBtn();
  var hint = document.querySelector('.image-hint');
  if (hint) hint.classList.remove('visible');

  isLoading = true;
  showTyping();
  updateSendBtn();

  try {
    // Build conversation history for Gemini
    var history = chat.messages.slice(0, -1).map(function(m) {
      return { role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] };
    });

    var body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: history.concat([{ role: 'user', parts: [{ text: text }] }]),
      generationConfig: { temperature: 0.8, topK: 40, topP: 0.95, maxOutputTokens: 8192 }
    };

    var res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    var data = await res.json();

    if (!res.ok) {
      var errMsg = (data && data.error && data.error.message) || ('HTTP ' + res.status);
      throw new Error(errMsg);
    }

    var aiText = (data.candidates &&
                  data.candidates[0] &&
                  data.candidates[0].content &&
                  data.candidates[0].content.parts &&
                  data.candidates[0].content.parts[0] &&
                  data.candidates[0].content.parts[0].text) || 'No response received.';

    var aiMsg = { id: genId(), role: 'assistant', content: aiText, ts: Date.now() };
    chat.messages.push(aiMsg);
    saveData();
    hideTyping();
    appendMessage(aiMsg);

  } catch(err) {
    console.error('Gemini Error:', err);
    var errText = err.message || 'Failed to get response. Please try again.';
    if (errText.includes('API_KEY_INVALID') || errText.includes('API key not valid')) {
      errText = 'Invalid API key. Open script.js and replace YOUR_GEMINI_API_KEY_HERE with your real key.';
    } else if (errText.includes('RESOURCE_EXHAUSTED') || errText.includes('quota')) {
      errText = 'API quota exceeded. Please try again later.';
    }
    var eMsg = { id: genId(), role: 'assistant', content: '', error: errText, ts: Date.now() };
    chat.messages.push(eMsg);
    saveData();
    hideTyping();
    appendMessage(eMsg);
  } finally {
    isLoading = false;
    updateSendBtn();
  }
}

// ── INPUT HELPERS ─────────────────────────────
function autoResize(inp) {
  inp.style.height = 'auto';
  inp.style.height = Math.min(inp.scrollHeight, 180) + 'px';
}

function updateSendBtn() {
  var btn = el('send-btn');
  var inp = el('chat-input');
  if (!btn || !inp) return;
  btn.disabled = (!inp.value.trim()) || isLoading;
}

// ── SIDEBAR TOGGLE ────────────────────────────
function openSidebar() {
  var sb = el('sidebar');
  var ov = document.querySelector('.sidebar-overlay');
  if (sb) sb.classList.add('open');
  if (ov) ov.classList.add('open');
}

function closeSidebar() {
  var sb = el('sidebar');
  var ov = document.querySelector('.sidebar-overlay');
  if (sb) sb.classList.remove('open');
  if (ov) ov.classList.remove('open');
}

// ── SETTINGS MODAL ────────────────────────────
function openSettings() {
  var m = el('settings-modal');
  if (m) m.classList.add('open');
  // Sync selected theme when modal opens
  var t = 'midnight';
  try { t = localStorage.getItem('aperonix-theme') || 'midnight'; } catch(e) {}
  document.querySelectorAll('.theme-card').forEach(function(card) {
    card.classList.toggle('selected', card.getAttribute('data-theme') === t);
  });
}

function closeSettings() {
  var m = el('settings-modal');
  if (m) m.classList.remove('open');
}

// ── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // 1. Apply saved theme
  initTheme();

  // 2. Load saved chats
  loadData();

  // 3. Ensure at least one chat exists
  if (chats.length === 0) {
    var c = createChat();
    chats.push(c);
    activeChatId = c.id;
    saveData();
  } else if (!activeChatId) {
    activeChatId = chats[0].id;
  }

  // 4. Render
  renderSidebar();
  renderMessages();

  // 5. Input event listeners
  var inp = el('chat-input');
  if (inp) {
    inp.addEventListener('input', function() {
      autoResize(inp);
      updateSendBtn();
      var hint = document.querySelector('.image-hint');
      if (hint) hint.classList.toggle('visible', inp.value.startsWith('/image'));
    });

    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // 6. Theme card click listeners
  document.querySelectorAll('.theme-card').forEach(function(card) {
    card.addEventListener('click', function() {
      applyTheme(card.getAttribute('data-theme'));
    });
  });

  // 7. Close modal on overlay click
  var modal = el('settings-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeSettings();
    });
  }

  // 8. Initial send button state
  updateSendBtn();
});
