const generateBtn=document.getElementById("generateImageBtn");
const promptInput=document.getElementById("imagePrompt");
const imageEl=document.getElementById("generatedImage");
const loader=document.getElementById("imageLoader");

generateBtn.onclick=async()=>{
    const prompt=promptInput.value.trim();
    if(!prompt) return alert("Enter prompt");

    const apiKey=localStorage.getItem("gemini_api_key");
    if(!apiKey) return alert("Add API key in settings");

    loader.classList.remove("hidden");
    imageEl.classList.add("hidden");

    try{
        const response=await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                contents:[{parts:[{text:`Generate image: ${prompt}`}]}]
            })
        });

        const data=await response.json();
        loader.classList.add("hidden");

        if(data.error){
            alert(data.error.message);
            return;
        }

        const base64=data.candidates[0].content.parts[0].inlineData.data;
        imageEl.src=`data:image/png;base64,${base64}`;
        imageEl.classList.remove("hidden");

    }catch(err){
        loader.classList.add("hidden");
        alert("Image generation failed");
    }
};
