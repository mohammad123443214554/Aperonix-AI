// ========================================
// APRONIX AI - CHAT APPLICATION
// ========================================

class APRONIXChat {
    constructor() {
        this.chatHistory = [];
        this.currentChatId = null;
        this.allChats = {};
        this.apiKey = null;
        this.currentTheme = 'night-sky';
        
        this.initializeElements();
        this.loadSettings();
        this.loadChatHistory();
        this.attachEventListeners();
        this.applyTheme();
    }

    // ========== INITIALIZATION ==========

    initializeElements() {
        // Chat elements
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messageForm = document.getElementById('messageForm');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.historyList = document.getElementById('historyList');

        // Settings modal elements
        this.settingsModal = document.getElementById('settingsModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.toggleKeyBtn = document.getElementById('toggleKeyBtn');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.themeOptions = document.querySelectorAll('.theme-option');
    }

    attachEventListeners() {
        // Message handling
        this.messageForm.addEventListener('submit', (e) => this.sendMessage(e));
        this.messageInput.addEventListener('input', () => this.autoResizeInput());

        // Buttons
        this.newChatBtn.addEventListener('click', () => this.startNewChat());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.modalOverlay.addEventListener('click', () => this.closeSettings());

        // Settings
        this.toggleKeyBtn.addEventListener('click', () => this.toggleAPIKeyVisibility());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // Theme selection
        this.themeOptions.forEach(option => {
            option.addEventListener('click', () => this.selectTheme(option));
        });
    }

    // ========== CHAT MANAGEMENT ==========

    startNewChat() {
        this.currentChatId = Date.now().toString();
        this.chatHistory = [];
        this.allChats[this.currentChatId] = {
            id: this.currentChatId,
            title: 'New Chat',
            messages: [],
            timestamp: Date.now()
        };
        
        this.updateDisplay();
        this.saveChatHistory();
        this.messageInput.focus();
    }

    loadChatHistory() {
        const saved = localStorage.getItem('apronix-chats');
        if (saved) {
            this.allChats = JSON.parse(saved);
            if (Object.keys(this.allChats).length > 0) {
                const lastChatId = Object.keys(this.allChats)[0];
                this.loadChat(lastChatId);
            } else {
                this.startNewChat();
            }
        } else {
            this.startNewChat();
        }
        
        this.renderHistoryList();
    }

    loadChat(chatId) {
        const chat = this.allChats[chatId];
        if (chat) {
            this.currentChatId = chatId;
            this.chatHistory = chat.messages || [];
            this.updateDisplay();
        }
    }

    saveChatHistory() {
        if (this.currentChatId && this.allChats[this.currentChatId]) {
            this.allChats[this.currentChatId].messages = this.chatHistory;
        }
        localStorage.setItem('apronix-chats', JSON.stringify(this.allChats));
    }

    deleteChat(chatId) {
        delete this.allChats[chatId];
        localStorage.setItem('apronix-chats', JSON.stringify(this.allChats));
        
        if (this.currentChatId === chatId) {
            const remainingIds = Object.keys(this.allChats);
            if (remainingIds.length > 0) {
                this.loadChat(remainingIds[0]);
            } else {
                this.startNewChat();
            }
        }
        
        this.renderHistoryList();
    }

    renderHistoryList() {
        this.historyList.innerHTML = '';
        
        const sortedChats = Object.values(this.allChats)
            .sort((a, b) => b.timestamp - a.timestamp);
        
        sortedChats.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            const title = document.createElement('span');
            title.textContent = chat.title;
            title.style.flex = '1';
            title.style.cursor = 'pointer';
            title.addEventListener('click', () => this.loadChat(chat.id));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'history-item-delete';
            deleteBtn.textContent = '✕';
            deleteBtn.type = 'button';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChat(chat.id);
            });
            
            item.appendChild(title);
            item.appendChild(deleteBtn);
            this.historyList.appendChild(item);
        });
    }

    // ========== MESSAGE HANDLING ==========

    async sendMessage(e) {
        e.preventDefault();
        
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Check API key
        this.apiKey = localStorage.getItem('apronix-api-key');
        if (!this.apiKey) {
            this.showErrorMessage('Please configure your API key in settings.');
            this.openSettings();
            return;
        }
        
        // Add user message
        this.chatHistory.push({
            role: 'user',
            content: message
        });
        
        // Update title if this is the first message
        if (this.chatHistory.length === 1) {
            const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
            this.allChats[this.currentChatId].title = title;
            this.renderHistoryList();
        }
        
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.updateDisplay();
        this.saveChatHistory();
        
        // Disable send button
        this.sendBtn.disabled = true;
        
        // Add loading message with spinning logo
        const loadingId = 'loading-' + Date.now();
        this.addLoadingMessage(loadingId);
        
        try {
            const response = await this.callGeminiAPI(message);
            this.removeLoadingMessage(loadingId);
            
            this.chatHistory.push({
                role: 'assistant',
                content: response
            });
            
            this.saveChatHistory();
            this.updateDisplay();
        } catch (error) {
            this.removeLoadingMessage(loadingId);
            this.showErrorMessage(error.message);
        } finally {
            this.sendBtn.disabled = false;
            this.messageInput.focus();
        }
    }

    async callGeminiAPI(userMessage) {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        
        const payload = {
            contents: [
                {
                    parts: [
                        { text: userMessage }
                    ]
                }
            ]
        };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your configuration.');
                } else if (response.status === 404) {
                    throw new Error('Model not found. Please update your API key.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else {
                    throw new Error(errorData.error?.message || 'API request failed');
                }
            }
            
            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response from AI. Please try again.');
            }
            
            const textContent = data.candidates[0].content?.parts?.[0]?.text;
            if (!textContent) {
                throw new Error('Invalid response format from API');
            }
            
            return textContent;
        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Check your internet connection.');
            }
            throw error;
        }
    }

    addLoadingMessage(id) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai';
        messageDiv.id = id;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<img src="logo.png" alt="APRONIX" class="logo-spin" style="width:24px;height:24px;filter:drop-shadow(0 0 8px var(--glow-color))">';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble loading';
        bubble.innerHTML = '<div class="spinner-dots"><div class="spinner-dot"></div><div class="spinner-dot"></div><div class="spinner-dot"></div></div>';
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    removeLoadingMessage(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    showErrorMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '⚠️';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        bubble.style.color = 'var(--error-color)';
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    updateDisplay() {
        if (this.chatHistory.length === 0) {
            this.welcomeScreen.style.display = 'flex';
            this.messagesContainer.style.display = 'none';
            this.messagesContainer.innerHTML = '';
        } else {
            this.welcomeScreen.style.display = 'none';
            this.messagesContainer.style.display = 'flex';
            this.renderMessages();
        }
    }

    renderMessages() {
        this.messagesContainer.innerHTML = '';
        
        this.chatHistory.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.role}`;
            
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.textContent = msg.role === 'user' ? '👤' : '🤖';
            
            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';
            bubble.textContent = msg.content;
            
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(bubble);
            this.messagesContainer.appendChild(messageDiv);
        });
        
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    autoResizeInput() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    // ========== SETTINGS MANAGEMENT ==========

    loadSettings() {
        this.apiKey = localStorage.getItem('apronix-api-key') || '';
        this.currentTheme = localStorage.getItem('apronix-theme') || 'night-sky';
        
        if (this.apiKeyInput) {
            this.apiKeyInput.value = this.apiKey;
        }
    }

    saveSettings() {
        const newApiKey = this.apiKeyInput.value.trim();
        
        if (newApiKey) {
            localStorage.setItem('apronix-api-key', newApiKey);
            this.apiKey = newApiKey;
        }
        
        localStorage.setItem('apronix-theme', this.currentTheme);
        this.applyTheme();
        this.closeSettings();
        
        this.showNotification('Settings saved successfully!');
    }

    toggleAPIKeyVisibility() {
        const type = this.apiKeyInput.type === 'password' ? 'text' : 'password';
        this.apiKeyInput.type = type;
        this.toggleKeyBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    }

    selectTheme(element) {
        const theme = element.dataset.theme;
        this.currentTheme = theme;
        
        // Update UI
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.remove('active');
        });
        element.classList.add('active');
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    openSettings() {
        this.settingsModal.classList.add('active');
        this.modalOverlay.classList.add('active');
        
        // Update theme selection
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.theme === this.currentTheme) {
                opt.classList.add('active');
            }
        });
    }

    closeSettings() {
        this.settingsModal.classList.remove('active');
        this.modalOverlay.classList.remove('active');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--success-color);
            color: white;
            border-radius: 8px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', () => {
    const chat = new APRONIXChat();
    
    // Add global style for notification animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
});
