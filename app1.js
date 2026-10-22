// Simon Says — Game Controller

const COLORS = ["green", "red", "yellow", "blue"];
const FREQS = { green: 329.63, red: 261.63, yellow: 392, blue: 523.25 };

// Game State
let gameSeq = [];
let userSeq = [];
let level = 0;
let started = false;
let playingSeq = false;
let soundOn = true;
let best = parseInt(localStorage.getItem("simon_best") || "0", 10);

// DOM Elements
const $ = (id) => document.getElementById(id);
const levelEl = $("level-num");
const bestEl = $("best-score");
const msgEl = $("feedback-msg");
const startBtn = $("start-btn");
const startTxt = $("start-text");
const startIco = $("start-icon");
const frameEl = $("game-frame");
const pads = document.querySelectorAll(".game-pad");

bestEl.textContent = best;

// Web Audio API Synthesizer
let ctx;
function playTone(freq, dur = 0.25, type = "sine") {
  if (!soundOn) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (_) {}
}

// Flash pad and trigger tone
function flash(color) {
  const pad = $(color);
  if (!pad) return;
  pad.classList.add("flash");
  playTone(FREQS[color]);
  setTimeout(() => pad.classList.remove("flash"), 260);
}

// Play pattern sequence
function playSeq() {
  playingSeq = true;
  msgEl.textContent = "Watch pattern...";
  gameSeq.forEach((col, i) => {
    setTimeout(() => {
      flash(col);
      if (i === gameSeq.length - 1) {
        setTimeout(() => {
          playingSeq = false;
          msgEl.textContent = "Your turn";
        }, 300);
      }
    }, (i + 1) * 550 - 200);
  });
}

// Advance to next level
function levelUp() {
  userSeq = [];
  level++;
  levelEl.textContent = level;

  if (level > best) {
    best = level;
    localStorage.setItem("simon_best", best);
    bestEl.textContent = best;
  }

  gameSeq.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
  playSeq();
}

// Start game
function start() {
  if (started) return;
  started = true;
  level = 0;
  gameSeq = [];
  startBtn.classList.remove("pulse-glow");
  startTxt.textContent = "Lvl";
  startIco.classList.add("hidden");
  levelUp();
}

// Handle player tap
function press(color) {
  if (!started || playingSeq) return;
  flash(color);
  userSeq.push(color);

  const idx = userSeq.length - 1;
  if (userSeq[idx] !== gameSeq[idx]) return gameOver();

  if (userSeq.length === gameSeq.length) {
    msgEl.textContent = "Nice! Next level...";
    setTimeout(levelUp, 850);
  }
}

// Game over
function gameOver() {
  playTone(110, 0.45, "sawtooth");
  frameEl.classList.add("screen-shake");
  setTimeout(() => frameEl.classList.remove("screen-shake"), 450);

  msgEl.textContent = `Game over — score: ${level}`;
  started = false;
  playingSeq = false;
  startBtn.classList.add("pulse-glow");
  startIco.classList.remove("hidden");
  startTxt.textContent = "Retry";
}

// Reset
function reset() {
  started = false;
  playingSeq = false;
  level = 0;
  gameSeq = [];
  userSeq = [];
  levelEl.textContent = "0";
  msgEl.textContent = "Press Play to begin";
  startBtn.classList.add("pulse-glow");
  startIco.classList.remove("hidden");
  startTxt.textContent = "Play";
}

// Event Listeners
pads.forEach((p) => p.addEventListener("click", () => press(p.id)));
startBtn.addEventListener("click", () => !started && start());
$("restart-btn").addEventListener("click", reset);

// Keyboard controls
window.addEventListener("keydown", (e) => {
  if (!started && (e.code === "Space" || e.code === "Enter")) {
    e.preventDefault();
    return start();
  }
  const keyMap = {
    Digit1: "green", KeyQ: "green",
    Digit2: "red",   KeyW: "red",
    Digit3: "yellow",KeyA: "yellow",
    Digit4: "blue",  KeyS: "blue"
  };
  if (started && !playingSeq && keyMap[e.code]) {
    e.preventDefault();
    press(keyMap[e.code]);
  }
});

// Sound toggle
$("sound-btn").addEventListener("click", () => {
  soundOn = !soundOn;
  $("sound-icon-on").classList.toggle("hidden", !soundOn);
  $("sound-icon-off").classList.toggle("hidden", soundOn);
});
