// ==========================================
// IMAGE GENERATION LOGIC (Only runs on image.html)
// ==========================================

const imagePrompt = document.getElementById('image-prompt');
const generateBtn = document.getElementById('generate-image-btn');
const generatedImg = document.getElementById('generated-img');
const imageLoading = document.getElementById('image-loading');
const placeholderText = document.getElementById('placeholder-text');
const imageError = document.getElementById('image-error');

if (generateBtn && imagePrompt) {
    generateBtn.addEventListener('click', handleImageGeneration);
    imagePrompt.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleImageGeneration();
    });
}

async function handleImageGeneration() {
    const prompt = imagePrompt.value.trim();
    if (!prompt) return;

    const apiKey = localStorage.getItem('aperonix_api_key');
    if (!apiKey) {
        showError("Please set your API key in Settings.");
        return;
    }

    // Reset UI State
    imageError.classList.add('hidden');
    generatedImg.classList.add('hidden');
    placeholderText.classList.add('hidden');
    imageLoading.classList.remove('hidden');
    generateBtn.disabled = true;

    try {
        // NOTE: Google's standard developer API (generativelanguage) handles text/chat primarily. 
        // For Image Generation, it typically requires Vertex AI or the specific Imagen endpoints.
        // Assuming access to a standard Imagen generation REST endpoint via API key:
        
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate:predict?key=${apiKey}`;
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [
                    { prompt: prompt }
                ],
                parameters: {
                    sampleCount: 1,
                    outputOptions: { mimeType: "image/png" }
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Image Generation failed or model not available in your region/tier.");
        }

        const data = await response.json();
        
        // Extract base64 image depending on response format (assuming standard predictions format)
        if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
            generatedImg.src = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
            generatedImg.classList.remove('hidden');
        } else {
            throw new Error("Invalid response format received from image endpoint.");
        }

    } catch (error) {
        showError(`Error: ${error.message}`);
        placeholderText.classList.remove('hidden');
    } finally {
        imageLoading.classList.add('hidden');
        generateBtn.disabled = false;
    }
}

function showError(msg) {
    imageError.textContent = msg;
    imageError.classList.remove('hidden');
}
