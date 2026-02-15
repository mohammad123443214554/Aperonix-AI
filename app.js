// ======================================================
// APERONIX AI - FINAL FIXED CODE
// ======================================================

// 1. GOOGLE API URL (Isme galti thi, ab ye sahi hai)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// 2. API KEY SAMBHALNA
function getApiKeys() {
    // Ye check karega ki key 'gemini_api_key' naam se save hai ya 'GEMINI_API_KEY' se
    return localStorage.getItem("gemini_api_key") || localStorage.getItem("GEMINI_API_KEY") || "";
}

// 3. AI SE BAAT KARNA (Core Function)
async function callGemini(message) {
    const apiKey = getApiKeys();

    if (!apiKey) {
        return "⚠️ Error: API Key missing. Please click Settings and save your API Key.";
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "You are Aperonix. " + message }]
                }]
            })
        });

        const data = await response.json();

        // Agar Google ne error bheja
        if (!response.ok) {
            console.error("API Error:", data);
            return `System Error: ${data.error?.message || "Something went wrong"}`;
        }

        // Sahi jawab nikaalo
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    } catch (error) {
        console.error("Network Error:", error);
        return "Connection failed. Check your internet.";
    }
}

// 4. MESSAGE BHEJNA (Send Button Logic)
async function sendMessage() {
    const input = document.getElementById("chatInput");
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    // 1. User ka message dikhao
    addMessage("user", message);
    input.value = ""; // Box saaf karo

    // 2. "Typing..." dikhao
    addMessage("assistant", "Thinking...");

    // 3. AI ko call karo
    const reply = await callGemini(message);

    // 4. "Typing..." hata kar asli jawab dikhao
    // (Hum last message ko remove karke naya add karenge)
    const messages = document.getElementById("messagesContainer");
    messages.lastElementChild.remove(); 
    addMessage("assistant", reply);
}

// 5. SCREEN PAR MESSAGE DIKHANA
function addMessage(role, text) {
    const container = document.getElementById("messagesContainer");
    if (!container) return;

    const div = document.createElement("div");
    // Class names aapke CSS ke hisaab se
    div.className = `message ${role === "user" ? "user-message" : "ai-message"}`;
    
    // Style thoda safai ke liye (agar CSS fail ho jaye)
    div.style.padding = "10px";
    div.style.margin = "5px 0";
    div.style.borderRadius = "8px";
    div.style.background = role === "user" ? "#007bff" : "#333";
    div.style.color = "#fff";
    div.style.textAlign = role === "user" ? "right" : "left";

    div.innerText = text;
    container.appendChild(div);
    
    // Auto-scroll niche
    container.scrollTop = container.scrollHeight;
}

// 6. INITIALIZATION (Ye Buttons ko zinda karega)
document.addEventListener("DOMContentLoaded", () => {
    console.log("App Loaded Successfully");

    // Send Button par click hone par
    const sendBtn = document.getElementById("sendBtn") || document.querySelector(".send-button");
    if (sendBtn) {
        sendBtn.onclick = sendMessage;
    }

    // Enter dabane par bhi bhejo
    const chatInput = document.getElementById("chatInput");
    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendMessage();
        });
    }

    // Settings Button Logic (Simple Prompt)
    const settingsBtn = document.getElementById("settingsBtn") || document.querySelector(".settings-button");
    if (settingsBtn) {
        settingsBtn.onclick = () => {
            const newKey = prompt("Enter your Gemini API Key here:", getApiKeys());
            if (newKey) {
                localStorage.setItem("gemini_api_key", newKey.trim());
                alert("Key Saved! Try chatting now.");
            }
        };
    }
});
