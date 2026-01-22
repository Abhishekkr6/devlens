import { Sparkles } from "lucide-react";

// Simple toast manager using native browser APIs
export const showAIToast = (message: string, type: "success" | "info" | "error" = "success") => {
    // Create toast container if it doesn't exist
    let container = document.getElementById("ai-toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "ai-toast-container";
        container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    `;
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement("div");
    toast.style.cssText = `
    background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#6366f1"};
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 300px;
    max-width: 400px;
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
    font-size: 14px;
    font-weight: 500;
  `;

    // Add icon
    const icon = document.createElement("span");
    icon.innerHTML = "✨";
    icon.style.fontSize = "20px";
    toast.appendChild(icon);

    // Add message
    const text = document.createElement("span");
    text.textContent = message;
    text.style.flex = "1";
    toast.appendChild(text);

    // Add close button
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "×";
    closeBtn.style.cssText = `
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  `;
    closeBtn.onmouseover = () => {
        closeBtn.style.background = "rgba(255, 255, 255, 0.3)";
    };
    closeBtn.onmouseout = () => {
        closeBtn.style.background = "rgba(255, 255, 255, 0.2)";
    };
    closeBtn.onclick = () => {
        toast.style.animation = "slideOut 0.3s ease-in";
        setTimeout(() => toast.remove(), 300);
    };
    toast.appendChild(closeBtn);

    // Add animation keyframes if not already added
    if (!document.getElementById("toast-animations")) {
        const style = document.createElement("style");
        style.id = "toast-animations";
        style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
        document.head.appendChild(style);
    }

    container.appendChild(toast);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = "slideOut 0.3s ease-in";
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
};

// Specific AI analysis toast
export const showAIAnalysisToast = (prNumber: string, score: number, issuesFound: number) => {
    const message = `AI Analysis Complete! PR #${prNumber} - Score: ${score}/100, ${issuesFound} issues found`;
    showAIToast(message, "success");
};
