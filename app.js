// ==========================================
// GLOBALS & SETTINGS MANAGEMENT
// ==========================================

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const apiKeyInput = document.getElementById('api-key');
const themeSelector = document.getElementById('theme-selector');
const navLogo = document.getElementById('nav-logo');

// Load settings on init
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    if(document.getElementById('chat-box')) {
        loadChatHistory();
    }
});

// Settings Modal Toggles
if(settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        apiKeyInput.value = localStorage.getItem('aperonix_api_key') || '';
        themeSelector.value = localStorage.getItem('aperonix_theme') || 'night-sky';
        settingsModal.classList.remove('hidden');
    });
}

if(closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });
}

if(saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        const theme = themeSelector.value;
        
        localStorage.setItem('aperonix_api_key', key);
        localStorage.setItem('aperonix_theme', theme);
        
        applyTheme(theme);
        settingsModal.classList.add('hidden');
    });
}

function loadSettings() {
    const theme = localStorage.getItem('aperonix_theme') || 'night-sky';
    applyTheme(theme);
}

function applyTheme(themeName) {
    document.body.className = ''; // Reset classes
    if (themeName !== 'night-sky') {
        document.body.classList.add(themeName);
    }
}

function getApiKey() {
    return localStorage.getItem('aperonix_api_key');
}

// ==========================================
// CHAT LOGIC (Only runs on index.html)
// ==========================================

const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');
const welcomeScreen = document.getElementById('welcome-screen');
const newChatBtn = document.getElementById('new-chat-btn');
const historyList = document.getElementById('chat-history-list');

let currentSessionHistory = [];

if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
}

if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
        chatBox.innerHTML = '';
        chatBox.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
        currentSessionHistory = [];
    });
}

async function handleSendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    const apiKey = getApiKey();
    if (!apiKey) {
        alert("Please set your Gemini API key in Settings first.");
        return;
    }

    // Update UI
    chatInput.value = '';
    welcomeScreen.classList.add('hidden');
    chatBox.classList.remove('hidden');

    appendMessage(message, 'user');
    currentSessionHistory.push({ role: 'user', parts: [{ text: message }] });

    // Start Spinner
    if (navLogo) navLogo.classList.add('spinning');

    try {
        const reply = await fetchGeminiResponse(message, apiKey);
        appendMessage(reply, 'ai');
        currentSessionHistory.push({ role: 'model', parts: [{ text: reply }] });
        saveChatToHistory(message);
    } catch (error) {
        appendMessage(`Error: ${error.message}. Please check your API key and connection.`, 'ai');
    } finally {
        // Stop Spinner
        if (navLogo) navLogo.classList.remove('spinning');
    }
}

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function fetchGeminiResponse(prompt, apiKey) {
    // Standard endpoint format for Gemini 1.5 Flash
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Formatting history to maintain context
    const contents = currentSessionHistory.length > 1 
        ? currentSessionHistory 
        : [{ role: "user", parts: [{ text: prompt }] }];

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: contents })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch response from Gemini API');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function saveChatToHistory(firstMessage) {
    if (currentSessionHistory.length > 2) return; // Already saved this session
    
    let history = JSON.parse(localStorage.getItem('aperonix_history')) || [];
    const title = firstMessage.length > 20 ? firstMessage.substring(0, 20) + '...' : firstMessage;
    
    history.unshift(title);
    if (history.length > 10) history.pop(); // Keep last 10
    
    localStorage.setItem('aperonix_history', JSON.stringify(history));
    renderHistory();
}

function loadChatHistory() {
    renderHistory();
}

function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('aperonix_history')) || [];
    
    history.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('history-item');
        li.textContent = item;
        historyList.appendChild(li);
    });
}
