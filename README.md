# Simon Says

A modern, arcade-styled Simon memory game built with vanilla JavaScript, modern CSS, and Tailwind CSS. Features live audio synthesis via the Web Audio API, spring physics, and persistent local scoring.

## Core Architecture

- **DOM Manipulation**: Cached element selectors (`$`), dynamic class toggling for pad flashes (`.flash`), pulse rings (`.pulse-glow`), and game-over shakes (`.screen-shake`). Real-time text nodes (`#level-num`, `#feedback-msg`, `#best-score`).
- **State Machine**: Sequential pattern validation tracking player inputs against generated steps, gated by `playingSeq` to prevent input races.
- **Web Audio API**: Live-synthesized sine and sawtooth frequencies (Green: 329Hz, Red: 261Hz, Yellow: 392Hz, Blue: 523Hz, Game Over: 110Hz slide) using `AudioContext`, `OscillatorNode`, and exponential `GainNode` envelopes — zero audio files required.
- **Web APIs**: `localStorage` score persistence across reloads; target-element Fullscreen API with adaptive `100dvh` viewport constraints.

## Controls

| Action | Mouse / Touch | Keyboard |
| :--- | :--- | :--- |
| **Start / Retry** | Center Button | `Space` / `Enter` |
| **Pads (Green, Red, Yellow, Blue)** | Click Pad | `1, 2, 3, 4` or `Q, W, A, S` |
| **Mute / Reset** | Header Icons | — |

## Getting Started

Open `index.html` in any modern web browser or serve via Live Server.

## License

[MIT](LICENSE)
