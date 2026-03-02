// 1. Spelling Check Karne wala Function (Fuzzy Match)
function getSimilarity(s1, s2) {
    let longer = s1.length < s2.length ? s2 : s1;
    let shorter = s1.length < s2.length ? s1 : s2;
    if (longer.length == 0) return 1.0;
    
    // Do words ke beech ka antar nikalna
    let costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0) costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return (longer.length - costs[s2.length]) / parseFloat(longer.length);
}

// 2. AI Logic
const knowledgeBase = {
    "hello": "Hi bhai! Kaise ho?",
    "kaise ho": "Main ekdam badiya! Aap sunao?",
    "veltrix": "Veltrix aapka banaya hua super IDE hai.",
    "bye": "Alvida! Phir milenge."
};

function askAI() {
    const input = document.getElementById("userInput").value.toLowerCase().trim();
    const chatBox = document.getElementById("messages");
    if (!input) return;

    chatBox.innerHTML += `<p><b>Aap:</b> ${input}</p>`;
    
    let bestMatch = null;
    let highestScore = 0;

    // Har sawal ko check karna (Spelling ki galti pakadne ke liye)
    for (let key in knowledgeBase) {
        let score = getSimilarity(input, key);
        if (score > highestScore) {
            highestScore = score;
            bestMatch = key;
        }
    }

    // Agar 60% se zyada match milta hai, toh jawab do
    let response = "Maaf karna bhai, ye abhi meri knowledge mein nahi hai.";
    if (highestScore > 0.6) {
        response = knowledgeBase[bestMatch];
    }

    setTimeout(() => {
        chatBox.innerHTML += `<p style="color: #3b82f6;"><b>AI:</b> ${response}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 500);

    document.getElementById("userInput").value = "";
}
