// ==========================================
// 1. MASTER CONFIGURATION (Fixed URL)
// ==========================================
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const STRICT_IDENTITY_RESPONSE = "I am Aperonix, a helpful AI assistant created by Mohammad Khan.";

// ==========================================
// 2. API KEY MANAGEMENT
// ==========================================
function getApiKeys() {
    return {
        gemini: localStorage.getItem("GEMINI_API_KEY") || "",
        huggingface: localStorage.getItem("HUGGINGFACE_API_TOKEN") || ""
    };
}

function saveApiKeys(geminiKey, hfToken) {
    localStorage.setItem("GEMINI_API_KEY", geminiKey);
    localStorage.setItem("HUGGINGFACE_API_TOKEN", hfToken);
}

// ==========================================
// 3. CORE AI FUNCTION (Single & Fixed)
// ==========================================
async function callGemini(message) {
    const keys = getApiKeys();
    if (!keys.gemini) {
        alert("Bhai, Settings mein API Key dalo!");
        throw new Error("Missing API Key");
    }

    // Is URL mein v1beta aur gemini-1.5-flash ekdum sahi hai
    const apiEndpoint = `${GEMINI_API_URL}?key=${keys.gemini}`;

    try {
        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "You are Aperonix, created by Mohammad Khan. " + message }]
                }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Google API Error:", data);
            // Agar "Model not found" aaye toh iska matlab Google v1beta support nahi kar raha
            throw new Error(data.error?.message || "API connection failed.");
        }

        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
    } catch (err) {
        console.error("Fetch Error:", err);
        throw err;
    }
}

// ==========================================
// 4. CHAT INTERFACE LOGIC
// ==========================================
async function sendMessage() {
    const input = document.getElementById("userInput");
    const message = input.value.trim();
    if (!message) return;

    // UI par message dikhao
    addMessage("user", message);
    input.value = "";

    try {
        const reply = await callGemini(message);
        addMessage("assistant", reply);
    } catch (err) {
        addMessage("assistant", "System Error: " + err.message);
    }
}

function addMessage(role, text) {
    const container = document.getElementById("messagesContainer");
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${role}`;
    msgDiv.innerText = text;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// Button click event
document.getElementById("sendBtn").onclick = sendMessage;
