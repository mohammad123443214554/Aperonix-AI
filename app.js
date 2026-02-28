// Aperonix AI Application
// Main JavaScript File

// ================== Constants & Configuration ==================
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1/models';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';

// Predefined responses for identity questions
const IDENTITY_RESPONSES = {
    owner: "I am Aperonix, created and owned by Mohammad Khan.",
    creator: "I am Aperonix, created and owned by Mohammad Khan.",
    who_made: "I am Aperonix, created and owned by Mohammad Khan.",
    who_created: "I am Aperonix, created and owned by Mohammad Khan.",
    who_owns: "I am Aperonix, created and owned by Mohammad Khan.",
    your_name: "My name is Aperonix. I am an AI assistant created and owned by Mohammad Khan.",
    about_you: "I am Aperonix, an AI assistant created and owned by Mohammad Khan. I'm here to help you with conversations and image generation."
};

// Identity question patterns
const IDENTITY_PATTERNS = [
    /who\s+(made|created|built|developed|owns?|is\s+your\s+(owner|creator))/i,
    /who('s|'s|\s+is)\s+your\s+(owner|creator|developer|maker)/i,
    /your\s+(owner|creator|developer|maker)/i,
    /who\s+are\s+you/i,
    /what('s|'s|\s+is)\s+your\s+name/i,
    /tell\s+me\s+about\s+(yourself|you)/i,
    /what\s+are\s+you/i,
    /who\s+do\s+you\s+belong\s+to/i
];

// ================== State Management ==================
const state = {
    currentMode: 'chat',
    currentChatId: null,
    chats: {},
    isProcessing: false
};

// ================== DOM Elements ==================
const elements = {
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    newChatBtn: document.getElementById('newChatBtn'),
    todayChats: document.getElementById('todayChats'),
    previousChats: document.getElementById('previousChats'),
    
    // Mode tabs
    chatTab: document.getElementById('chatTab'),
    
    // Chat section
    chatSection: document.getElementById('chatSection'),
    messagesContainer: document.getElementById('messagesContainer'),
    welcomeMessage: document.getElementById('welcomeMessage'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    
    // Settings
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettings: document.getElementById('closeSettings'),
    cancelSettings: document.getElementById('cancelSettings'),
    saveSettings: document.getElementById('saveSettings'),
    geminiKey: document.getElementById('geminiKey'),
    huggingfaceKey: document.getElementById('huggingfaceKey'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ================== Utility Functions ==================

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get stored API keys
function getApiKeys() {
    return {
        gemini: localStorage.getItem('GEMINI_API_KEY') || '',
        huggingface: localStorage.getItem('HUGGINGFACE_API_TOKEN') || ''
    };
}

// Save API keys
function saveApiKeys(gemini, huggingface) {
    if (gemini !== undefined) localStorage.setItem('GEMINI_API_KEY', gemini);
    if (huggingface !== undefined) localStorage.setItem('HUGGINGFACE_API_TOKEN', huggingface);
}

// Show toast notification
function showToast(message, type = 'info') {
    elements.toastMessage.textContent = message;
    elements.toast.className = 'toast ' + type;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 4000);
}

// Check if message is an identity question
function isIdentityQuestion(message) {
    const lowerMessage = message.toLowerCase();
    return IDENTITY_PATTERNS.some(pattern => pattern.test(lowerMessage));
}

// Get identity response
function getIdentityResponse(message) {
    return IDENTITY_RESPONSES.owner;
}

// Format date for chat history
function formatChatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    return isToday ? 'today' : 'previous';
}

// Get chat title from first message
function getChatTitle(messages) {
    if (!messages || messages.length === 0) return 'New Chat';
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage) return 'New Chat';
    return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
}

// ================== Storage Functions ==================

// Load chats from localStorage
function loadChats() {
    const stored = localStorage.getItem('aperonix_chats');
    if (stored) {
        state.chats = JSON.parse(stored);
    }
}

// Save chats to localStorage
function saveChats() {
    localStorage.setItem('aperonix_chats', JSON.stringify(state.chats));
}

// ================== UI Functions ==================

// Render chat history
function renderChatHistory() {
    elements.todayChats.innerHTML = '';
    elements.previousChats.innerHTML = '';
    
    const chatIds = Object.keys(state.chats).sort((a, b) => {
        return state.chats[b].updatedAt - state.chats[a].updatedAt;
    });
    
    chatIds.forEach(id => {
        const chat = state.chats[id];
        const category = formatChatDate(chat.updatedAt);
        const container = category === 'today' ? elements.todayChats : elements.previousChats;
        
        const item = document.createElement('button');
        item.className = 'history-item' + (id === state.currentChatId ? ' active' : '');
        item.innerHTML = `
            <span class="history-item-text">${getChatTitle(chat.messages)}</span>
            <span class="history-item-delete" data-id="${id}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </span>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.history-item-delete')) {
                loadChat(id);
            }
        });
        
        const deleteBtn = item.querySelector('.history-item-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChat(id);
        });
        
        container.appendChild(item);
    });
}

// Render messages
function renderMessages(messages) {
    // Clear existing messages except welcome
    const existingMessages = elements.messagesContainer.querySelectorAll('.message');
    existingMessages.forEach(m => m.remove());
    
    if (!messages || messages.length === 0) {
        elements.welcomeMessage.style.display = 'flex';
        return;
    }
    
    elements.welcomeMessage.style.display = 'none';
    
    messages.forEach(msg => {
        addMessageToDOM(msg.role, msg.content, false);
    });
    
    scrollToBottom();
}

// Add message to DOM
function addMessageToDOM(role, content, animate = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatarContent = role === 'user' 
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
        : '<img src="logo.jpg" alt="Aperonix" style="width:24px;height:24px;object-fit:contain;">';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatarContent}</div>
        <div class="message-content">
            <p>${escapeHtml(content)}</p>
        </div>
    `;
    
    if (!animate) {
        messageDiv.style.animation = 'none';
    }
    
    elements.messagesContainer.appendChild(messageDiv);
    
    if (animate) {
        scrollToBottom();
    }
}

// Add typing indicator
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <img src="logo.jpg" alt="Aperonix" style="width:24px;height:24px;object-fit:contain;">
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    elements.messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Add error message
function addErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message assistant error';
    
    errorDiv.innerHTML = `
        <div class="message-avatar">
            <img src="logo.jpg" alt="Aperonix" style="width:24px;height:24px;object-fit:contain;">
        </div>
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    
    elements.messagesContainer.appendChild(errorDiv);
    scrollToBottom();
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Scroll to bottom
function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// ================== Chat Functions ==================

// Create new chat
function createNewChat() {
    const id = generateId();
    state.chats[id] = {
        id,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    state.currentChatId = id;
    saveChats();
    renderChatHistory();
    renderMessages([]);
    elements.chatInput.focus();
}

// Load chat
function loadChat(id) {
    state.currentChatId = id;
    const chat = state.chats[id];
    if (chat) {
        renderMessages(chat.messages);
        renderChatHistory();
    }
}

// Delete chat
function deleteChat(id) {
    delete state.chats[id];
    saveChats();
    
    if (state.currentChatId === id) {
        const remainingIds = Object.keys(state.chats);
        if (remainingIds.length > 0) {
            loadChat(remainingIds[0]);
        } else {
            createNewChat();
        }
    }
    
    renderChatHistory();
}

// Add message to chat
function addMessageToChat(role, content) {
    if (!state.currentChatId) {
        createNewChat();
    }
    
    const chat = state.chats[state.currentChatId];
    chat.messages.push({ role, content, timestamp: Date.now() });
    chat.updatedAt = Date.now();
    saveChats();
    renderChatHistory();
}

// Send message
async function sendMessage() {
    const message = elements.chatInput.value.trim();
    if (!message || state.isProcessing) return;
    
    // Hide welcome message
    elements.welcomeMessage.style.display = 'none';
    
    // Add user message
    addMessageToChat('user', message);
    addMessageToDOM('user', message);
    
    // Clear input
    elements.chatInput.value = '';
    elements.chatInput.style.height = 'auto';
    elements.sendBtn.disabled = true;
    
    state.isProcessing = true;
    
    // Check for identity questions (local, no API call)
    if (isIdentityQuestion(message)) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const response = getIdentityResponse(message);
        addMessageToChat('assistant', response);
        addMessageToDOM('assistant', response);
        state.isProcessing = false;
        return;
    }
    
    // Check for API key
    const keys = getApiKeys();
    if (!keys.gemini) {
        addErrorMessage('API connection failed. Please add your Gemini API key in settings to enable chat functionality.');
        showToast('Please configure your Gemini API key in settings', 'error');
        state.isProcessing = false;
        return;
    }
    
    // Show typing indicator
    addTypingIndicator();
    
    try {
        const response = await callGeminiAPI(message);
        removeTypingIndicator();
        addMessageToChat('assistant', response);
        addMessageToDOM('assistant', response);
    } catch (error) {
        removeTypingIndicator();
        console.error('Gemini API Error:', error);
        addErrorMessage(error.message);
        showToast(error.message, 'error');
    }
    
    state.isProcessing = false;
}

// Call Gemini API
async function callGeminiAPI(message) {
    const keys = getApiKeys();
    const apiKey = keys.gemini.trim();
    
    // Simple body format as specified by Gemini API docs
    const body = {
        contents: [{
            parts: [{ text: message }]
        }]
    };
    const bodyStr = JSON.stringify(body);
    
    // Try models in order: gemini-2.5-flash (current stable), then fallbacks
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
    
    for (const model of models) {
        const endpoint = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
        
        let response;
        try {
            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: bodyStr
            });
        } catch (networkError) {
            throw new Error('Network error: Could not reach the Gemini API. Check your internet connection.');
        }
        
        // If 404, this model doesn't exist -- try next one
        if (response.status === 404) {
            console.warn(`Model ${model} not found (404), trying next...`);
            continue;
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const detail = errorData.error?.message || 'Unknown error';
            throw new Error(`API connection failed (HTTP ${response.status}): ${detail}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            console.log(`Aperonix: Using model ${model}`);
            return data.candidates[0].content.parts[0].text;
        }
        
        if (data.candidates && data.candidates[0] && data.candidates[0].finishReason === 'SAFETY') {
            return 'I apologize, but I cannot provide a response to that request due to safety guidelines.';
        }
    }
    
    throw new Error('API connection failed (HTTP 404): No available Gemini model found. Please verify your API key is valid at https://aistudio.google.com/apikey');
}

// ================== Mode Switching ==================

function switchMode(mode) {
    state.currentMode = 'chat';
    elements.chatTab.classList.add('active');
    elements.chatSection.classList.add('active');
    elements.chatInput.focus();
}

// ================== Settings Modal ==================

function openSettings() {
    const keys = getApiKeys();
    elements.geminiKey.value = keys.gemini;
    elements.huggingfaceKey.value = keys.huggingface;
    elements.settingsModal.classList.add('active');
}

function closeSettingsModal() {
    elements.settingsModal.classList.remove('active');
}

function saveSettingsModal() {
    const gemini = elements.geminiKey.value.trim();
    const huggingface = elements.huggingfaceKey.value.trim();
    
    saveApiKeys(gemini, huggingface);
    closeSettingsModal();
    showToast('Settings saved successfully!', 'success');
}

// ================== Event Listeners ==================

function initEventListeners() {
    // Sidebar toggle (mobile)
    elements.sidebarToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking outside (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!elements.sidebar.contains(e.target) && !elements.sidebarToggle.contains(e.target)) {
                elements.sidebar.classList.remove('open');
            }
        }
    });
    
    // New chat
    elements.newChatBtn.addEventListener('click', createNewChat);
    
    // Mode tabs
    elements.chatTab.addEventListener('click', () => switchMode('chat'));
    elements.imageTab.addEventListener('click', () => switchMode('image'));
    
    // Chat input
    elements.chatInput.addEventListener('input', () => {
        // Auto-resize textarea
        elements.chatInput.style.height = 'auto';
        elements.chatInput.style.height = Math.min(elements.chatInput.scrollHeight, 150) + 'px';
        
        // Enable/disable send button
        elements.sendBtn.disabled = !elements.chatInput.value.trim() || state.isProcessing;
    });
    
    elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    elements.sendBtn.addEventListener('click', sendMessage);
    
    // Settings
    elements.settingsBtn.addEventListener('click', openSettings);
    elements.closeSettings.addEventListener('click', closeSettingsModal);
    elements.cancelSettings.addEventListener('click', closeSettingsModal);
    elements.saveSettings.addEventListener('click', saveSettingsModal);
    
    // Close modal on overlay click
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            closeSettingsModal();
        }
    });
    
    // Toggle password visibility
    document.querySelectorAll('.toggle-visibility').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to close modal
        if (e.key === 'Escape') {
            closeSettingsModal();
        }
        
        // Ctrl/Cmd + N for new chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            createNewChat();
        }
    });
}

// ================== Initialization ==================

function init() {
    // Load saved chats
    loadChats();
    
    // Initialize event listeners
    initEventListeners();
    
    // Render chat history
    renderChatHistory();
    
    // Load last chat or create new one
    const chatIds = Object.keys(state.chats);
    if (chatIds.length > 0) {
        // Sort by updatedAt and load most recent
        const sortedIds = chatIds.sort((a, b) => state.chats[b].updatedAt - state.chats[a].updatedAt);
        loadChat(sortedIds[0]);
    } else {
        createNewChat();
    }
    
    // Check if API keys are configured
    const keys = getApiKeys();
    if (!keys.gemini && !keys.huggingface) {
        setTimeout(() => {
            showToast('Welcome to Aperonix! Configure your API keys in settings to get started.', 'info');
        }, 1000);
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
