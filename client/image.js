// ========================================
// APRONIX AI - IMAGE GENERATION
// ========================================

class APRONIXImageGen {
    constructor() {
        this.apiKey = null;
        this.currentTheme = 'night-sky';
        this.initializeElements();
        this.loadSettings();
        this.attachEventListeners();
        this.applyTheme();
    }

    // ========== INITIALIZATION ==========

    initializeElements() {
        // Form elements
        this.imageForm = document.getElementById('imageForm');
        this.imagePrompt = document.getElementById('imagePrompt');
        this.generateBtn = document.getElementById('generateBtn');

        // Output elements
        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.errorMessage = document.getElementById('errorMessage');
        this.imageDisplay = document.getElementById('imageDisplay');
        this.generatedImage = document.getElementById('generatedImage');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.newImageBtn = document.getElementById('newImageBtn');

        // Settings elements
        this.settingsModal = document.getElementById('settingsModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.imageSettingsBtn = document.getElementById('imageSettingsBtn');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.toggleKeyBtn = document.getElementById('toggleKeyBtn');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.themeOptions = document.querySelectorAll('.theme-option');
    }

    attachEventListeners() {
        // Form
        this.imageForm.addEventListener('submit', (e) => this.generateImage(e));

        // Action buttons
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.newImageBtn.addEventListener('click', () => this.resetForm());

        // Settings
        this.imageSettingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.modalOverlay.addEventListener('click', () => this.closeSettings());
        this.toggleKeyBtn.addEventListener('click', () => this.toggleAPIKeyVisibility());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // Theme selection
        this.themeOptions.forEach(option => {
            option.addEventListener('click', () => this.selectTheme(option));
        });
    }

    // ========== SETTINGS ==========

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

    // ========== IMAGE GENERATION ==========

    async generateImage(e) {
        e.preventDefault();

        const prompt = this.imagePrompt.value.trim();

        if (!prompt) {
            this.showError('Please enter a description for your image.');
            return;
        }

        // Check API key
        this.apiKey = localStorage.getItem('apronix-api-key');
        if (!this.apiKey) {
            this.showError('Please configure your API key in settings.');
            this.openSettings();
            return;
        }

        // Show loading state
        this.hideAllStates();
        this.loadingState.style.display = 'flex';
        this.generateBtn.disabled = true;

        try {
            const imageUrl = await this.callImageGenerationAPI(prompt);
            this.hideAllStates();
            this.displayImage(imageUrl);
        } catch (error) {
            this.hideAllStates();
            this.showError(error.message);
        } finally {
            this.generateBtn.disabled = false;
        }
    }

    async callImageGenerationAPI(prompt) {
        // Using Gemini 2.0 Flash with image generation capability
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

        const payload = {
            contents: [
                {
                    parts: [
                        {
                            text: `Generate a high-quality, detailed image based on this description: ${prompt}`
                        }
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
                    throw new Error('Image generation model not available. Please try the chat feature instead.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else if (response.status === 400) {
                    throw new Error('Invalid request. Your prompt may contain restricted content.');
                } else {
                    throw new Error(errorData.error?.message || 'Image generation failed');
                }
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No image generated. Please try a different description.');
            }

            const textContent = data.candidates[0].content?.parts?.[0]?.text;
            if (!textContent) {
                throw new Error('Invalid response format from API');
            }

            // Extract image URL or base64 from response
            // Gemini returns the image data - we need to handle it appropriately
            return this.processImageResponse(textContent);

        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Check your internet connection.');
            }
            throw error;
        }
    }

    processImageResponse(response) {
        // For demonstration, we'll create a placeholder
        // In production, Gemini API returns image data that should be processed
        
        // If the response contains image data, convert it appropriately
        // For now, return the response text as a fallback
        if (response.includes('data:image')) {
            return response;
        }

        // Return a placeholder message
        throw new Error('Image generation requires image generation capabilities. Please ensure you have the correct API access.');
    }

    displayImage(imageUrl) {
        this.generatedImage.src = imageUrl;
        this.imageDisplay.style.display = 'flex';
    }

    downloadImage() {
        const link = document.createElement('a');
        link.href = this.generatedImage.src;
        link.download = `apronix-image-${Date.now()}.png`;
        link.click();
    }

    resetForm() {
        this.imagePrompt.value = '';
        this.hideAllStates();
        this.imagePrompt.focus();
    }

    hideAllStates() {
        this.loadingState.style.display = 'none';
        this.errorState.style.display = 'none';
        this.imageDisplay.style.display = 'none';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorState.style.display = 'flex';
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
    const imageGen = new APRONIXImageGen();

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
