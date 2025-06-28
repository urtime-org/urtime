// 🌟 Use the existing theme container already in HTML
const themeContainer = document.getElementById("theme-container");
let bubbleInterval = null;

// 🌱 Theme change handler
function updateTheme() {
  // 🧽 Clear old bubbles
  if (bubbleInterval) {
    clearInterval(bubbleInterval);
    bubbleInterval = null;
  }
  const oldBubbles = document.querySelector(".bubble-bg");
  if (oldBubbles) oldBubbles.remove();

  const selected = document.getElementById("themeSelector").value;
  let src = "";
  let extraClass = "";

  if (selected === "plant") {
    src = "assets/animations/plant.svg";
    extraClass = "growable";
    themeContainer.innerHTML = `<img src="${src}" class="theme-img ${extraClass}" alt="Plant" />`;

  } else if (selected === "rocket") {
    src = "assets/animations/rocket.svg";
    extraClass = "rocket-anim";
    themeContainer.innerHTML = `<img src="${src}" class="theme-img ${extraClass}" alt="Rocket" />`;

  } else if (selected === "bubble") {
    themeContainer.innerHTML = ""; // Remove plant/rocket image
    showFloatingBubbles(); // Show background bubbles

  } else {
    themeContainer.innerHTML = ""; // fallback
  }
}

// 🫧 Bubble generator
function showFloatingBubbles() {
  const bubbleLayer = document.createElement("div");
  bubbleLayer.className = "bubble-bg";
  document.body.appendChild(bubbleLayer);

  bubbleInterval = setInterval(() => {
    const bubble = document.createElement("div");
    bubble.className = "bubble-float";
    const size = Math.random() * 20 + 15;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}vw`;
    bubble.style.animationDuration = `${10 + Math.random() * 5}s`;

    bubbleLayer.appendChild(bubble);

    setTimeout(() => bubble.remove(), 12000);
  }, 500);
}

// 🧠 Auto-call on selection
document.getElementById("themeSelector").addEventListener("change", updateTheme);
window.addEventListener("DOMContentLoaded", updateTheme);

