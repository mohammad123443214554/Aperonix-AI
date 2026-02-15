// Aperonix AI Application
// Main JavaScript File

// ================== Constants & Configuration ==================
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';

// Strict Identity Response
const STRICT_IDENTITY_RESPONSE = "I am Aperonix, created and owned by Mohammad Khan.";

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
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    newChatBtn: document.getElementById('newChatBtn'),
    todayChats: document.getElementById('todayChats'),
    previousChats: document.getElementById('previousChats'),
    chatTab: document.getElementById('chatTab'),
    imageTab: document.getElementById('imageTab'),
    chatSection: document.getElementById('chatSection'),
    messagesContainer: document.getElementById('messagesContainer'),
    welcomeMessage: document.getElementById('welcomeMessage'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    imageSection: document.getElementById('imageSection'),
    imageContainer: document.getElementById('imageContainer'),
    imageWelcome: document.getElementById('imageWelcome'),
    generatedImages: document.getElementById('generatedImages'),
    imageInput: document.getElementById('imageInput'),
    generateBtn: document.getElementById('generateBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettings: document.getElementById('closeSettings'),
    cancelSettings: document.getElementById('cancelSettings'),
    saveSettings: document.getElementById('saveSettings'),
    geminiKey: document.getElementById('geminiKey'),
    huggingfaceKey: document.getElementById('huggingfaceKey'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ================== Utility Functions ==================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getApiKeys() {
    return {
        gemini: localStorage.getItem('GEMINI_API_KEY') || '',
        huggingface: localStorage.getItem('HUGGINGFACE_API_TOKEN') || ''
    };
}

function saveApiKeys(gemini, huggingface) {
    if (gemini !== undefined) localStorage.setItem('GEMINI_API_KEY', gemini);
    if (huggingface !== undefined) localStorage.setItem('HUGGINGFACE_API_TOKEN', huggingface);
}

function showToast(message, type = 'info') {
    elements.toastMessage.textContent = message;
    elements.toast.className = 'toast ' + type;
    elements.toast.classList.add('show');
    setTimeout(() => elements.toast.classList.remove('show'), 4000);
}

function isIdentityQuestion(message) {
    return IDENTITY_PATTERNS.some(pattern => pattern.test(message.toLowerCase()));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// ================== Chat Functions ==================

function addMessageToDOM(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatarContent = role === 'user'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"></circle><path d="M5.5 21a6.5 6.5 0 0 1 13 0"></path></svg>'
        : '<img src="logo.jpg" alt="Aperonix" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #ffffff;">';

    messageDiv.innerHTML = `
        <div class="message-avatar">${avatarContent}</div>
        <div class="message-content">
            <p>${escapeHtml(content)}</p>
        </div>
    `;

    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

async function sendMessage() {
    const message = elements.chatInput.value.trim();
    if (!message || state.isProcessing) return;

    addMessageToDOM('user', message);
    elements.chatInput.value = '';
    state.isProcessing = true;

    if (isIdentityQuestion(message)) {
        addMessageToDOM('assistant', STRICT_IDENTITY_RESPONSE);
        state.isProcessing = false;
        return;
    }

    const keys = getApiKeys();
    if (!keys.gemini) {
        addMessageToDOM('assistant', 'API connection failed. Please add your Gemini API key in settings.');
        state.isProcessing = false;
        return;
    }

    try {
        const response = await callGeminiAPI(message);
        addMessageToDOM('assistant', response);
    } catch (error) {
        addMessageToDOM('assistant', 'API connection failed. Please check your API key.');
    }

    state.isProcessing = false;
}

async function callGeminiAPI(message) {
    const keys = getApiKeys();

    const response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(keys.gemini)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{
                        text: "You are Aperonix. If asked about creator or ownership, you must respond exactly: I am Aperonix, created and owned by Mohammad Khan."
                    }]
                },
                {
                    role: "user",
                    parts: [{ text: message }]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        })
    });

    if (!response.ok) {
        throw new Error("Gemini API Error");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}

// ================== Image Generation ==================

async function generateImage() {
    const prompt = elements.imageInput.value.trim();
    if (!prompt) return;

    const keys = getApiKeys();
    if (!keys.huggingface) {
        showToast('Please add your Hugging Face API token.', 'error');
        return;
    }

    const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${keys.huggingface}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
        showToast('Image API failed.', 'error');
        return;
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    const imageCard = document.createElement('div');
    imageCard.className = 'image-card';
    imageCard.innerHTML = `
        <img src="${imageUrl}" alt="${escapeHtml(prompt)}">
        <p>${escapeHtml(prompt)}</p>
    `;
    elements.generatedImages.prepend(imageCard);
}

// ================== Initialization ==================

function init() {
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.generateBtn.addEventListener('click', generateImage);
}

document.addEventListener('DOMContentLoaded', init);
