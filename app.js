// ======================================================
// APERONIX AI - FINAL COMPLETE CODE (NO EDITS NEEDED)
// ======================================================

// 1. CONFIGURATION
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// 2. API KEY MANAGEMENT
function getApiKeys() {
    return {
        gemini: localStorage.getItem("GEMINI_API_KEY") || localStorage.getItem("gemini_api_key") || ""
    };
}

// 3. CORE AI FUNCTION
async function callGemini(message) {
    const keys = getApiKeys();
    
    // Check if Key Exists
    if (!keys.gemini) {
        addMessage("assistant", "⚠️ Error: API Key missing! Please go to Settings and save your Gemini API Key.");
        throw new Error("Missing API Key");
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${keys.gemini}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "System: You are Aperonix. User: " + message }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("API Error Details:", data);
            throw new Error(data.error?.message || "Google API Refused Connection");
        }

        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Mafi chahta hoon, koi jawab nahi mila.";
    } catch (error) {
        console.error("Network Error:", error);
        return "Connection Error: " + error.message;
    }
}

// 4. CHAT FUNCTIONS
async function sendMessage() {
    // Input field dhoondne ki koshish (multiple IDs check karega)
    const inputField = document.getElementById("chatInput") || 
                       document.getElementById("userInput") || 
                       document.querySelector("input[type='text']");

    if (!inputField) {
        alert("Error: Input box nahi mila! HTML check karo.");
        return;
    }

    const message = inputField.value.trim();
    if (!message) return; // Agar khali hai to kuch mat karo

    // 1. User ka message screen par dikhao
    addMessage("user", message);
    inputField.value = ""; // Input saaf karo

    // 2. Loading indicator (Optional)
    const loadingId = addMessage("assistant", "Soch raha hoon...");

    // 3. AI se baat karo
    const reply = await callGemini(message);

    // 4. Loading hata kar asli jawab likho
    updateMessage(loadingId, reply);

    // 5. History mein save karo
    saveChatToHistory(message, reply);
}

// Screen par message add karne ka function
function addMessage(sender, text) {
    const chatContainer = document.getElementById("messagesContainer") || 
                          document.getElementById("chat-container") ||
                          document.querySelector(".chat-box");
    
    if (!chatContainer) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = sender === "user" ? "user-message" : "ai-message";
    msgDiv.style.margin = "10px 0";
    msgDiv.style.padding = "10px";
    msgDiv.style.borderRadius = "10px";
    msgDiv.style.backgroundColor = sender === "user" ? "#007bff" : "#333";
    msgDiv.style.color = "#fff";
    msgDiv.style.textAlign = sender === "user" ? "right" : "left";
    msgDiv.innerText = text;

    // Unique ID for updating later
    const msgId = "msg-" + Date.now();
    msgDiv.id = msgId;

    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return msgId;
}

// Loading message ko update karne ke liye
function updateMessage(id, newText) {
    const msgDiv = document.getElementById(id);
    if (msgDiv) {
        msgDiv.innerText = newText;
    }
}

// 5. HISTORY FUNCTIONS
function saveChatToHistory(userMsg, aiMsg) {
    let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    history.unshift({ user: userMsg, ai: aiMsg });
    // Sirf last 20 messages rakho
    localStorage.setItem("chatHistory", JSON.stringify(history.slice(0, 20)));
    renderHistory();
}

function renderHistory() {
    const historyList = document.querySelector(".history-list") || document.getElementById("historyList");
    if (!historyList) return;

    let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    
    historyList.innerHTML = history.map(chat => `
        <div style="padding: 10px; border-bottom: 1px solid #444; cursor: pointer;" onclick="loadFromHistory('${chat.user}', '${chat.ai.replace(/'/g, "\\'")}')">
            <strong>You:</strong> ${chat.user.substring(0, 20)}...
        </div>
    `).join("");
}

// History click karne par wapas dikhana
window.loadFromHistory = function(u, a) {
    addMessage("user", u);
    addMessage("assistant", a);
}

// 6. EVENT LISTENERS (Buttons ko zinda karne ke liye)
document.addEventListener("DOMContentLoaded", () => {
    console.log("Aperonix Loaded!");
    renderHistory();

    // Send Button dhoondho (ID ya Class dono se)
    const sendBtn = document.getElementById("sendBtn") || 
                    document.querySelector(".send-button") || 
                    document.querySelector("button");

    if (sendBtn) {
        sendBtn.onclick = sendMessage; // Click karne par message bhejo
        console.log("Send Button Connected!");
    } else {
        console.error("Send Button nahi mila!");
    }

    // Enter button dabane par bhi send ho
    const inputField = document.getElementById("chatInput") || document.querySelector("input");
    if (inputField) {
        inputField.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                sendMessage();
            }
        });
    }
});
