// Browser ki memory se purana naam nikalna
let userName = localStorage.getItem("savedName") || "";

const knowledgeBase = {
    "hi": userName ? `Hello ${userName} bhai! Kaise ho?` : "Hello bhai! Kaise ho? Waise aapka naam kya hai?",
    "kaise ho": "Main ekdam badhiya hoon, aap batao?",
    "kaun ho": "Main Veltrix AI hoon, mujhe 14 saal ke ek super developer ne banaya hai!",
    "bye": "Alvida! Phir milenge."
};

function askAI() {
    const inputField = document.getElementById("userInput");
    const input = inputField.value.toLowerCase().trim();
    const chatBox = document.getElementById("messages");
    
    if (input === "") return;

    chatBox.innerHTML += `<p><b>Aap:</b> ${input}</p>`;
    
    let response = "Hmm... mujhe iska jawab nahi pata, par main seekh raha hoon!";

    // Memory Logic: Naam yaad rakhna
    if (input.includes("mera naam") || input.includes("my name is")) {
        const words = input.split(" ");
        userName = words[words.length - 1]; 
        localStorage.setItem("savedName", userName); 
        response = `Waah! Bahut pyara naam hai ${userName}. Ab main ise yaad rakhunga!`;
    } 
    else {
        for (let key in knowledgeBase) {
            if (input.includes(key)) {
                response = knowledgeBase[key];
                break;
            }
        }
    }
    
    setTimeout(() => {
        chatBox.innerHTML += `<p style="color: #3b82f6;"><b>AI:</b> ${response}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 500);

    inputField.value = "";
}
