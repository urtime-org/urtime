// ========== POMODORO VARIABLES ==========
let sessionLength = 25;
let breakLength = 5;
let seconds = sessionLength * 60;
let isRunning = false;
let timerInterval;
let mode = "session";
let completedSessions = 0;
let confettiInterval = null;
let popupTimeout = null;

// ========== QUOTES ==========
const quotes = [
  "“Small progress is still progress.”",
  "“Push yourself, because no one else is going to do it for you.”",
  "“You don’t have to be extreme, just consistent.”",
  "“Focus on being productive, not busy.”"
];
document.getElementById("quote-text").textContent =
  quotes[Math.floor(Math.random() * quotes.length)];

// ========== UPDATE TIMER DISPLAY ==========
function updateDisplay() {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  document.getElementById("timer").textContent =
    `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  document.getElementById("session-label").textContent =
    mode === "session" ? "Work Session" : "Break Time!";
}

// ========== LOGOUT ==========
function logout() {
  firebase.auth().signOut().then(() => {
    alert("👋 You’ve been logged out. See you soon!");
    window.location.href = "login.html";
  });
}

// ========== START TIMER ==========
function startTimer() {
  if (isRunning) return;
  isRunning = true;
  playMusic();

  timerInterval = setInterval(() => {
    if (seconds > 0) {
      seconds--;
      updateDisplay();
      updateGrowthProgress();
      updateRocketProgress();

    } else {
      clearInterval(timerInterval);
      isRunning = false;
      stopMusic();

      if (mode === "session") {
        completedSessions++;
        updateFocusStats();
        saveDailyStats();
        launchConfetti();
        showPopup("🎉 Work session complete! Time for a break!");
      } else {
        showPopup("🧘 Break over! Let’s get back to work!");
      }

      // 🚀 Zoom off rocket
      const rocket = document.querySelector(".rocket-anim");
      if (rocket) {
        rocket.style.animation = "none";
        rocket.style.transition = "transform 1.2s ease-out";
        rocket.style.transform = "translateY(-800px) scale(1.4) rotate(20deg)";
      }

      popupTimeout = setTimeout(() => {
        closePopup();
        startTimer();
      }, 10000);
    }
  }, 1000);
}

// ========== RESET TIMER ==========
function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  seconds = (mode === "session" ? sessionLength : breakLength) * 60;
  updateDisplay();
  stopMusic();
}

// ========== MODE SWITCH ==========
function switchMode(newMode) {
  if (isRunning) {
    alert("Reset the current timer before switching.");
    return;
  }
  mode = newMode;
  resetTimer();
}

// ========== LENGTH CONTROLS ==========
function changeSession(amount) {
  sessionLength = Math.max(1, sessionLength + amount);
  document.getElementById("session-length").textContent = sessionLength;
  if (mode === "session") resetTimer();
}
function changeBreak(amount) {
  breakLength = Math.max(1, breakLength + amount);
  document.getElementById("break-length").textContent = breakLength;
  if (mode === "break") resetTimer();
}

// ========== STATS ==========
function updateFocusStats() {
  document.getElementById("focus-stats").textContent =
    `Pomodoros Completed Today: ${completedSessions}`;
}

// ========== SAVE TO FIRESTORE ==========
async function saveDailyStats() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];
  const uid = user.uid;
  const ref = firebase.firestore().collection("urtime-history").doc(uid);

  const completedTasks = tasks.filter(t => t.completed).length;

  const newStats = {
    pomodoros: completedSessions,
    minutes: completedSessions * sessionLength,
    tasks: completedTasks
  };

  await ref.set({ [today]: newStats }, { merge: true });
}

// ========== CONFETTI ==========
function launchConfetti() {
  const defaults = {
    startVelocity: 25,
    spread: 360,
    ticks: 60,
    zIndex: 100
  };

  confettiInterval = setInterval(() => {
    confetti({
      ...defaults,
      particleCount: 80,
      origin: { x: Math.random(), y: Math.random() * 0.5 }
    });
  }, 300);
}

// ========== 🌱 GROWING PLANT ==========
function updateGrowthProgress() {
  const img = document.querySelector(".growable");
  if (!img) return;

  const total = (mode === "session" ? sessionLength : breakLength) * 60;
  const done = total - seconds;
  const percent = done / total;

  const scale = 0.4 + percent * 0.8;
  img.style.transform = `scale(${scale})`;
}

// ========== 🚀 ROCKET LAUNCH ==========
function updateRocketProgress() {
  const rocket = document.querySelector(".rocket-anim");
  if (!rocket) return;

  const total = (mode === "session" ? sessionLength : breakLength) * 60;
  const done = total - seconds;
  const percent = done / total;

  if (percent > 0.02) {
    rocket.style.animation = "none";
  }

  const distance = 100 - percent * 300;
  rocket.style.transition = "transform 0.4s ease";
  rocket.style.transform = `translateY(${distance}px) rotate(0deg)`;
}

// ========== POPUP ==========
function showPopup(message) {
  document.getElementById("popup-message").textContent = message;
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
  if (confettiInterval) clearInterval(confettiInterval);
  if (popupTimeout) clearTimeout(popupTimeout);
}

// ========== MUSIC PLAYER ==========
function playMusic() {
  stopMusic(); // stop others

  const selected = document.getElementById("musicSelector").value;
  if (selected === "none") return;

  const audio = document.getElementById(selected);
  if (!audio) return;

  // Unlock audio playback by requiring user interaction
  audio.volume = 0.5;
  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Show gentle hint if blocked
      console.warn("🔇 Audio playback was blocked. Try clicking the page or enabling sound.");
    });
  }
}


function stopMusic() {
  ["lofi", "nature", "cafe"].forEach(id => {
    const audio = document.getElementById(id);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
}

// ========== TO-DO LIST ==========
let tasks = [];
function addTask() {
  const input = document.getElementById("todo-input");
  const taskText = input.value.trim();
  if (taskText === "") return;

  const task = { text: taskText, completed: false };
  tasks.push(task);
  saveTasks();
  renderTasks();
  input.value = "";

  suggestResources(taskText);
}

function renderTasks() {
  const list = document.getElementById("todo-list");
  list.innerHTML = "";
  let completedCount = 0;

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    if (task.completed) completedCount++;

    checkbox.onchange = () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    };

    const span = document.createElement("span");
    span.textContent = task.text;
    span.className = "task-text";
    if (task.completed) span.classList.add("done");

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    };

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });

  document.getElementById("task-counter").textContent =
    `Tasks Done: ${completedCount} / ${tasks.length}`;
}

function saveTasks() {
  localStorage.setItem("urtime-tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("urtime-tasks");
  if (saved) {
    tasks = JSON.parse(saved);
    renderTasks();
  }
}

// ========== INIT ==========
updateDisplay();
loadTasks();

// ✅ Change music immediately if timer is already running
document.getElementById("musicSelector").addEventListener("change", () => {
  if (isRunning) {
    playMusic(); // instantly switch music
  }
});



