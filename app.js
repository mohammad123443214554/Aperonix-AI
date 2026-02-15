// 1. API URL (Fixed)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// 2. Settings se Key nikaalne ke liye
function getApiKeys() {
    return {
        gemini: localStorage.getItem('gemini_api_key') || '',
        huggingface: localStorage.getItem('huggingface_token') || ''
    };
}

// 3. Gemini API Function
async function callGemini(message) {
    const keys = getApiKeys();
    if (!keys.gemini) {
        alert("Bhai, Settings mein ja kar API Key dalo!");
        return "Error: No API Key";
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${keys.gemini}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "API Error");
        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        return "System Error: " + err.message;
    }
}

// 4. Message Send karne ka function (Fixed)
let isProcessing = false;
async function sendMessage() {
    const input = document.getElementById("chatInput");
    if (!input) return;
    
    const text = input.value.trim();
    if (!text || isProcessing) return;

    addMessage("user", text);
    input.value = "";
    isProcessing = true;

    try {
        const reply = await callGemini(text);
        addMessage("assistant", reply);
        saveChatToHistory(text, reply);
    } catch (err) {
        addMessage("assistant", "Error: " + err.message);
    } finally {
        isProcessing = false;
    }
}

// 5. Message Screen par dikhane ke liye
function addMessage(role, text) {
    const container = document.getElementById("messagesContainer");
    if (!container) return;

    const div = document.createElement("div");
    div.className = `message ${role}-message`;
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// 6. History Save aur Load
function saveChatToHistory(u, a) {
    let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    history.unshift({ user: u, ai: a });
    localStorage.setItem('chatHistory', JSON.stringify(history.slice(0, 10)));
    renderHistory();
}

function renderHistory() {
    const list = document.querySelector('.history-list');
    if (!list) return;
    let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    list.innerHTML = history.map(item => `
        <div class="history-item" style="padding: 10px; border-bottom: 1px solid #333; font-size: 14px; cursor: pointer;">
            ${item.user.substring(0, 20)}...
        </div>
    `).join('');
}

// 7. Event Listeners (Taki button kaam karein)
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    
    // Send button click par
    const sendBtn = document.querySelector('.send-button');
    if (sendBtn) {
        sendBtn.onclick = sendMessage;
    }

    // Enter key dabane par
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});
