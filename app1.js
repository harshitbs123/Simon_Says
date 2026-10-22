// =============================================================================
// CRAZY SIMON - GAME LOGIC
// =============================================================================

// Game State
const PAD_COLORS = ["green", "red", "yellow", "blue"];
let gameSeq = [];
let userSeq = [];
let level = 0;
let isStarted = false;
let isPlayingSequence = false;
let soundEnabled = true;

// High Score Persistence
let highScore = parseInt(localStorage.getItem("crazy_simon_best") || "0", 10);

// DOM Elements
const levelDisplay = document.getElementById("level-num");
const bestDisplay  = document.getElementById("best-score");
const feedbackMsg  = document.getElementById("feedback-msg");
const startBtn     = document.getElementById("start-btn");
const startText    = document.getElementById("start-text");
const startIcon    = document.getElementById("start-icon");
const restartBtn   = document.getElementById("restart-btn");
const soundBtn     = document.getElementById("sound-btn");
const soundIconOn  = document.getElementById("sound-icon-on");
const soundIconOff = document.getElementById("sound-icon-off");
const fullscreenBtn= document.getElementById("fullscreen-btn");
const gameFrame    = document.getElementById("game-frame");
const pads         = document.querySelectorAll(".game-pad");

// Display initial high score
bestDisplay.textContent = highScore;

// -----------------------------------------------------------------------------
// Web Audio API Sound Generator
// -----------------------------------------------------------------------------
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

const FREQUENCIES = {
  green: 329.63,  // E4
  red: 261.63,    // C4
  yellow: 392.00, // G4
  blue: 523.25    // C5
};

// Play arcade tone for pads
function playTone(freq, duration = 0.25, type = "sine") {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Smooth envelope attack and decay
    gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio context fallback if blocked
  }
}

// Play game over buzzer
function playGameOverTone() {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new AudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(70, audioCtx.currentTime + 0.45);

    gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
  } catch (e) {}
}

// -----------------------------------------------------------------------------
// Pad Flashing & Animations
// -----------------------------------------------------------------------------
function flashPad(color) {
  const pad = document.getElementById(color);
  if (!pad) return;

  pad.classList.add("flash");
  playTone(FREQUENCIES[color] || 350, 0.28);

  setTimeout(() => {
    pad.classList.remove("flash");
  }, 280);
}

// Play the entire pattern sequence to the user
function playSequence() {
  isPlayingSequence = true;
  feedbackMsg.textContent = "Watch the pattern...";

  let delay = 350;
  gameSeq.forEach((color, idx) => {
    setTimeout(() => {
      flashPad(color);
      if (idx === gameSeq.length - 1) {
        setTimeout(() => {
          isPlayingSequence = false;
          feedbackMsg.textContent = "Your turn";
        }, 320);
      }
    }, delay);
    delay += 550;
  });
}

// -----------------------------------------------------------------------------
// Game Progression Logic
// -----------------------------------------------------------------------------
function levelUp() {
  userSeq = [];
  level++;
  levelDisplay.textContent = level;

  // Update high score if beaten
  if (level > highScore) {
    highScore = level;
    localStorage.setItem("crazy_simon_best", highScore);
    bestDisplay.textContent = highScore;
  }

  // Pick random color and advance
  const randomColor = PAD_COLORS[Math.floor(Math.random() * PAD_COLORS.length)];
  gameSeq.push(randomColor);

  playSequence();
}

function startGame() {
  if (isStarted) return;
  isStarted = true;
  level = 0;
  gameSeq = [];
  userSeq = [];

  // Update center button
  startBtn.classList.remove("pulse-glow");
  startText.textContent = "Lvl";
  startIcon.classList.add("hidden");

  levelUp();
}

// Check player input against sequence
function checkInput(index) {
  if (userSeq[index] !== gameSeq[index]) {
    gameOver();
    return;
  }

  // Completed current sequence round
  if (userSeq.length === gameSeq.length) {
    feedbackMsg.textContent = "Nice! Next level...";
    setTimeout(levelUp, 900);
  }
}

// Handle player tap / click on pad
function handlePadPress(color) {
  if (!isStarted || isPlayingSequence) return;

  flashPad(color);
  userSeq.push(color);
  checkInput(userSeq.length - 1);
}

// Game Over state & shake effect
function gameOver() {
  playGameOverTone();
  gameFrame.classList.add("screen-shake");
  setTimeout(() => gameFrame.classList.remove("screen-shake"), 500);

  feedbackMsg.textContent = `Game over — score: ${level}`;

  // Reset state
  isStarted = false;
  isPlayingSequence = false;
  startBtn.classList.add("pulse-glow");
  startIcon.classList.remove("hidden");
  startText.textContent = "Retry";
}

// Reset Game
function resetGame() {
  isStarted = false;
  isPlayingSequence = false;
  level = 0;
  gameSeq = [];
  userSeq = [];
  levelDisplay.textContent = "0";
  feedbackMsg.textContent = "Press Play to begin";
  startBtn.classList.add("pulse-glow");
  startIcon.classList.remove("hidden");
  startText.textContent = "Play";
}

// -----------------------------------------------------------------------------
// Event Listeners & Controls
// -----------------------------------------------------------------------------

// Pad Click Events
pads.forEach((pad) => {
  pad.addEventListener("click", () => handlePadPress(pad.id));
});

// Center & Restart Buttons
startBtn.addEventListener("click", () => {
  if (!isStarted) startGame();
});

restartBtn.addEventListener("click", resetGame);

// Keyboard Controls: Space/Enter starts; 1-4 or Q,W,A,S trigger pads
window.addEventListener("keydown", (e) => {
  // Start on Space or Enter
  if (!isStarted && (e.code === "Space" || e.code === "Enter")) {
    e.preventDefault();
    startGame();
    return;
  }

  if (!isStarted || isPlayingSequence) return;

  const keyMap = {
    "Digit1": "green", "KeyQ": "green",
    "Digit2": "red",   "KeyW": "red",
    "Digit3": "yellow","KeyA": "yellow",
    "Digit4": "blue",  "KeyS": "blue"
  };

  const color = keyMap[e.code];
  if (color) {
    e.preventDefault();
    handlePadPress(color);
  }
});

// Sound Mute Toggle
soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundIconOn.classList.toggle("hidden", !soundEnabled);
  soundIconOff.classList.toggle("hidden", soundEnabled);
});

