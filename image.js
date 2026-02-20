/**
 * Aperonix AI — Image Generation Page
 * Handles image generation via /api/image serverless function
 */

(function () {
  "use strict";

  // --- DOM References ---
  const imagePrompt = document.getElementById("imagePrompt");
  const generateBtn = document.getElementById("generateBtn");
  const btnContent = document.getElementById("btnContent");
  const imageResult = document.getElementById("imageResult");
  const generatedImage = document.getElementById("generatedImage");
  const downloadBtn = document.getElementById("downloadBtn");
  const regenerateBtn = document.getElementById("regenerateBtn");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  // --- State ---
  let isGenerating = false;
  let lastPrompt = "";

  // --- Sidebar Toggle ---
  sidebarToggle.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("mobile-open");
      sidebarOverlay.classList.toggle("visible");
    } else {
      sidebar.classList.toggle("collapsed");
    }
  });

  sidebarOverlay.addEventListener("click", () => {
    sidebar.classList.remove("mobile-open");
    sidebarOverlay.classList.remove("visible");
  });

  // --- Prompt Example Buttons ---
  document.querySelectorAll(".prompt-example").forEach((btn) => {
    btn.addEventListener("click", () => {
      imagePrompt.value = btn.getAttribute("data-prompt");
      imagePrompt.focus();
    });
  });

  // --- Generate on Enter (Ctrl+Enter) ---
  imagePrompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleGenerate();
    }
  });

  generateBtn.addEventListener("click", handleGenerate);
  regenerateBtn.addEventListener("click", () => {
    if (lastPrompt) {
      imagePrompt.value = lastPrompt;
      handleGenerate();
    }
  });

  // --- Generate Image ---
  async function handleGenerate() {
    const prompt = imagePrompt.value.trim();
    if (!prompt || isGenerating) return;

    isGenerating = true;
    lastPrompt = prompt;

    // Show loading state
    btnContent.innerHTML = `<span class="spinner" style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px;"></span>Generating...`;
    generateBtn.disabled = true;

    // Hide previous result
    imageResult.classList.remove("visible");

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        showError(data.error || "Image generation failed. Please try again.");
      } else if (data.image) {
        generatedImage.src = data.image;
        generatedImage.onload = () => {
          imageResult.classList.add("visible");
          imageResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
        };
      } else {
        showError("No image was returned. Please try a different prompt.");
      }
    } catch (err) {
      showError("Network error. Please check your connection and try again.");
    } finally {
      isGenerating = false;
      generateBtn.disabled = false;
      btnContent.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:6px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Generate Image
      `;
    }
  }

  // --- Download Image ---
  downloadBtn.addEventListener("click", () => {
    if (!generatedImage.src || generatedImage.src === window.location.href) return;

    const link = document.createElement("a");
    link.href = generatedImage.src;
    link.download = `aperonix-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // --- Error Toast ---
  let errorTimeout;

  function showError(message) {
    let toast = document.querySelector(".error-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "error-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("visible");

    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => {
      toast.classList.remove("visible");
    }, 5000);
  }
})();
