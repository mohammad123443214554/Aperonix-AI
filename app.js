// app.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const chatContainer = document.getElementById('chat-container');
    const messagesContainer = document.getElementById('chat-messages');
    const welcomeScreen = document.getElementById('welcome-screen');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const historyList = document.getElementById('chat-history-list');
    
    // Settings & Modal
    const settingsModal = document.getElementById('settings-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const closeModal = document.querySelector('.close-modal');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const themeBtns = document.querySelectorAll('.theme-btn');

    // --- State Management ---
    let currentApiKey = localStorage.getItem('aperonix_api_key') || '';
    let currentTheme = localStorage.getItem('aperonix_theme') || 'night';
    let chatHistory = JSON.parse(localStorage.getItem('aperonix_history')) || [];
    let currentChatId = null;

    // --- Initialization ---
    applyTheme(currentTheme);
    loadHistoryList();
    
    // Check if API Key exists, if not open settings
    if (!currentApiKey) {
        settingsModal.style.display = 'block';
    }

    // --- Event Listeners ---

    // Send Message
    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    // New Chat
    newChatBtn.addEventListener('click', startNewChat);

    // Settings Modal
    settingsBtn.addEventListener('click', () => settingsModal.style.display = 'block');
    closeModal.addEventListener('click', () => settingsModal.style.display = 'none');
    
    // Save Settings
    saveSettingsBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            currentApiKey = key;
            localStorage.setItem('aperonix_api_key', key);
            settingsModal.style.display = 'none';
            alert('API Key Saved!');
        } else {
            alert('Please enter an API Key');
        }
    });

    // Theme Switching
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            themeBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');
            
            const theme = btn.getAttribute('data-theme');
            applyTheme(theme);
            currentTheme = theme;
            localStorage.setItem('aperonix_theme', theme);
        });
    });

    // --- Core Functions ---

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        // Update UI inputs to reflect saved state
        if(apiKeyInput) apiKeyInput.value = currentApiKey;
    }

    function handleSendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        if (!currentApiKey) {
            alert('Please set your Gemini API Key in Settings.');
            settingsModal.style.display = 'block';
            return;
        }

        // UI: Hide Welcome, Show Chat
        welcomeScreen.style.display = 'none';
        
        // Create new chat session if none exists
        if (!currentChatId) {
            currentChatId = Date.now();
            chatHistory.push({ id: currentChatId, title: message, messages: [] });
            loadHistoryList();
        }

        // Add User Message
        addMessageToUI('user', message);
        
        // Save to history
        const currentChat = chatHistory.find(c => c.id === currentChatId);
        currentChat.messages.push({ role: 'user', text: message });
        saveHistory();

        // Clear Input
        userInput.value = '';

        // Send to AI
        getAIResponse(message);
    }

    function addMessageToUI(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', role);
        
        // Avatar Logic
        const avatar = role === 'user' ? 'You' : '<img src="logo.png" class="ai-avatar" onerror="this.src=\'https://placehold.co/40x40/333/fff?text=AI\'">';
        
        // Content Logic
        let contentHtml = `<p>${text}</p>`;
        
        // If it's AI and we are waiting (loading), add spinner class
        if (role === 'model' && text === '') {
            msgDiv.classList.add('loading');
            contentHtml = `<div class="spinner"></div>`;
            avatar = '<img src="logo.png" class="ai-avatar spinning" onerror="this.src=\'https://placehold.co/40x40/333/fff?text=AI\'">';
        }

        msgDiv.innerHTML = `
            <div class="avatar">${avatar}</div>
            <div class="bubble">${contentHtml}</div>
        `;
        
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function getAIResponse(prompt) {
        // Add empty AI message placeholder
        addMessageToUI('model', '');

        try {
            const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${currentApiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API Request Failed');
            }

            const data = await response.json();
            const aiText = data.candidates[0].content.parts[0].text;

            // Remove loading spinner and add text
            const lastMsg = messagesContainer.lastElementChild;
            lastMsg.classList.remove('loading');
            
            // Update avatar (remove spinning)
            const avatarImg = lastMsg.querySelector('.ai-avatar');
            if(avatarImg) avatarImg.classList.remove('spinning');

            lastMsg.querySelector('.bubble').innerHTML = `<p>${formatText(aiText)}</p>`;
            
            // Save to History
            const currentChat = chatHistory.find(c => c.id === currentChatId);
            currentChat.messages.push({ role: 'model', text: aiText });
            saveHistory();

        } catch (error) {
            console.error(error);
            const lastMsg = messagesContainer.lastElementChild;
            lastMsg.querySelector('.bubble').innerHTML = `<p style="color: #ff5252;">Error: ${error.message}</p>`;
        }
    }

    function formatText(text) {
        // Simple regex to handle new lines
        return text.replace(/\n/g, '<br>');
    }

    function startNewChat() {
        messagesContainer.innerHTML = '';
        welcomeScreen.style.display = 'flex'; // Use flex to center content
        currentChatId = null;
        userInput.focus();
    }

    function loadHistoryList() {
        historyList.innerHTML = '';
        chatHistory.forEach(chat => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.textContent = chat.title.length > 20 ? chat.title.substring(0, 20) + '...' : chat.title;
            li.onclick = () => loadChat(chat.id);
            historyList.appendChild(li);
        });
    }

    function loadChat(id) {
        const chat = chatHistory.find(c => c.id === id);
        if (!chat) return;
        
        currentChatId = chat.id;
        messagesContainer.innerHTML = '';
        welcomeScreen.style.display = 'none';
        
        chat.messages.forEach(msg => {
            addMessageToUI(msg.role, msg.text);
        });
    }

    function saveHistory() {
        localStorage.setItem('aperonix_history', JSON.stringify(chatHistory));
    }
});
