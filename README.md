# Simon Says

A modern, arcade-inspired recreation of the classic Simon memory game built with vanilla JavaScript, modern CSS, and Tailwind CSS. Features dynamic sound synthesis via the Web Audio API, responsive viewport-aware geometry, persistent scoring, and spring-based tactile animations.

---

## Features

- **Arcade Aesthetic**: Dark mode UI with vibrant neon gradients, 3D bevel highlights, and responsive tactile game pads.
- **Synthesized Audio (Web Audio API)**: Zero audio file dependencies — all sound frequencies (musical pad tones and game-over buzzer) are synthesized live in the browser with custom gain envelopes.
- **Robust Fullscreen Mode**: Dynamically adapts using viewport-constrained math (`100dvh`) to guarantee all pads and controls fit without clipping on both desktop and mobile screens.
- **Dual Input Controls**: Full mouse/touch support alongside keyboard hotkeys (`1-4`, `Q/W/A/S`, `Space`, `Enter`).
- **High Score Persistence**: Automatically tracks and stores the player's best score locally using `localStorage`.

---

## Technical Architecture & Core Concepts

### 1. DOM Manipulation & UI Updates
- **Dynamic Class Toggling**: Toggles active animation classes (`.flash`, `.pulse-glow`, `.screen-shake`) to give immediate visual feedback during gameplay and sequence replay.
- **State-Driven Content Rendering**: Synchronously updates DOM nodes (`#level-num`, `#feedback-msg`, `#best-score`, `#start-text`, `#fullscreen-text`) based on game state transitions.
- **DOM Selection**: Efficiently caches element references (`document.getElementById`, `document.querySelectorAll`) once at boot to minimize layout thrashing.

### 2. Event-Driven Game Loop
- **Input Gating**: Uses state flags (`isStarted`, `isPlayingSequence`) to block user clicks while the computer plays back the pattern, eliminating input race conditions.
- **Global Keyboard Listener**: Binds to `window.addEventListener("keydown")` with a mapped key dictionary to enable fast, keyboard-only play.
- **Fullscreen Synchronization**: Listens to the native `fullscreenchange` event to keep UI labels and orientation locks in sync, regardless of whether fullscreen was triggered via the button or the `Esc` key.

### 3. Audio Synthesis (Web Audio API)
- **Real-Time Wave Generation**: Uses `AudioContext` and `OscillatorNode` (`sine` and `sawtooth`) to generate precise musical tones:
  - **Green**: 329.63 Hz (E4)
  - **Red**: 261.63 Hz (C4)
  - **Yellow**: 392.00 Hz (G4)
  - **Blue**: 523.25 Hz (C5)
  - **Game Over**: Descending sawtooth pitch slide (140 Hz &rarr; 70 Hz)
- **Envelope Control**: Modulates audio volume using `GainNode.exponentialRampToValueAtTime()` for clean, click-free attack and exponential decay.
- **Mute Toggle**: Centralized audio routing allowing instant sound muting without interrupting game timers.

### 4. Browser APIs
- **Web Storage API (`localStorage`)**: Reads and writes high scores (`crazy_simon_best`) so player progress survives page refreshes.
- **Fullscreen API (`requestFullscreen` / `exitFullscreen`)**: Applied directly to `#game-frame` to provide a dedicated, distraction-free theater view.
- **Screen Orientation API (`screen.orientation`)**: Safely handles orientation states with defensive fallbacks across browser engines.

### 5. CSS Physics & Responsive Math
- **Spring Curves**: Custom `cubic-bezier(0.34, 1.56, 0.64, 1)` transitions provide a bouncy, physical feel to interactive elements.
- **Adaptive Viewport Budgeting**: Fullscreen pad dimensions are computed with:
  ```css
  max-height: min(calc(100dvh - 160px), calc(100vw - 2.5rem), 520px);
  max-width:  min(calc(100dvh - 160px), calc(100vw - 2.5rem), 520px);
  ```
  This guarantees that all four pads maintain a strict 1:1 aspect ratio and remain fully visible within any viewport aspect ratio (desktop, tablet, or mobile landscape).

---

## Controls

| Action | Mouse / Touch | Keyboard Shortcut |
| :--- | :--- | :--- |
| **Start / Retry** | Click Center Button | `Space` / `Enter` |
| **Green Pad** | Click Top-Left Pad | `1` or `Q` |
| **Red Pad** | Click Top-Right Pad | `2` or `W` |
| **Yellow Pad** | Click Bottom-Left Pad | `3` or `A` |
| **Blue Pad** | Click Bottom-Right Pad | `4` or `S` |
| **Toggle Mute** | Click Speaker Icon | — |
| **Restart Game** | Click Reset Icon | — |
| **Toggle Fullscreen** | Click Fullscreen Button | `Esc` (to exit) |

---

## Project Structure

```text
├── assets/
│   ├── Nohemi-Regular.otf   # Display font
│   └── aalto.otf            # Alternate font
├── index.html               # Semantic markup & core styles
├── app1.js                  # Game logic, DOM controller & Web Audio
├── LICENSE                  # MIT License
└── README.md                # Project documentation
```

---

## Getting Started

1. Clone or download this repository.
2. Open `index.html` in any modern web browser (Chrome, Safari, Firefox, Edge).
   - Alternatively, serve using any static server (e.g., VS Code Live Server or `npx serve .`).

---

## License

This project is licensed under the [MIT License](LICENSE).
