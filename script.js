let aiKnowledge = {};

// 1. JSON File se Data Load Karna
async function loadData() {
    try {
        const response = await fetch('data.json');
        aiKnowledge = await response.json();
        console.log("AI Knowledge is ready!");
    } catch (err) {
        console.error("Data load nahi hua bhai!", err);
    }
}

// 2. Chat Function
async function askAI() {
    const inputField = document.getElementById("userInput");
    const input = inputField.value.toLowerCase().trim();
    const chatBox = document.getElementById("messages");

    if (!input) return;

    // User Message
    chatBox.innerHTML += `<div class="user-msg"><b>Aap:</b> ${input}</div>`;
    inputField.value = "";

    let response = "Hmm... iska jawab mere data mein nahi hai, par main seekh raha hoon!";

    // Logic: Match Dhundna
    for (let key in aiKnowledge) {
        if (input.includes(key)) {
            response = aiKnowledge[key];
            break;
        }
    }

    // AI Response with delay for realism
    setTimeout(() => {
        chatBox.innerHTML += `<div class="bot-msg"><b>AI:</b> ${response}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll niche ke liye
    }, 400);
}

// Start Loading
loadData();
