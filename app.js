// ================== GEMINI API CONFIG ==================
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// 1. API Key nikaalne ke liye
function getApiKeys() {
    return {
        gemini: localStorage.getItem('gemini_api_key') || '',
        huggingface: localStorage.getItem('huggingface_token') || ''
    };
}

// 2. Gemini ko call karne ka sahi tarika
async function callGemini(message) {
    const keys = getApiKeys();
    if (!keys.gemini) {
        alert("Bhai, Settings mein API Key daal do pehle!");
        return "Error: API Key missing";
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${keys.gemini}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "You are Aperonix, created by Mohammad Khan. " + message }]
                }]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "API Error");
        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        console.error(err);
        return "System Error: " + err.message;
    }
}

// 3. Message bhejnewala function (Fixed for your HTML)
let isProcessing = false;
async function sendMessage() {
    const input = document.getElementById("chatInput"); // Aapka HTML ID yahi hai
    const text = input.value.trim();
    
    if (!text || isProcessing) return;

    // User ka message dikhao
    addMessage("user", text);
    input.value = "";
    isProcessing = true;

    try {
        const reply = await callGemini(text);
        addMessage("assistant", reply);
        
        // History save karne ka logic
        saveToHistory(text, reply);
    } catch (err) {
        addMessage("assistant", "Error: " + err.message);
    } finally {
        isProcessing = false;
    }
}

// 4. Message Screen par dikhane ke liye
function addMessage(role, text) {
    const container = document.getElementById("messagesContainer");
    if(!container) return;
    
    const div = document.createElement("div");
    div.className = `message ${role}-message`;
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// 5. History logic
function saveToHistory(u, a) {
    let h = JSON.parse(localStorage.getItem('chatHistory')) || [];
    h.unshift({ user: u, ai: a });
    localStorage.setItem('chatHistory', JSON.stringify(h.slice(0, 10)));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById("historyList") || document.querySelector('.history-list');
    if (!list) return;
    let h = JSON.parse(localStorage.getItem('chatHistory')) || [];
    list.innerHTML = h.map(item => `
        <div class="history-item">
            ${item.user.substring(0, 15)}...
        </div>
    `).join('');
}

// Page load hote hi history dikhao
document.addEventListener('DOMContentLoaded', renderHistory);
