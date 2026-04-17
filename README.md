# ✨ The Mystery of the Seven Stars

> *A mythic-modern interactive experience built on the Nexus OS platform.*

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://creativecommons.org/publicdomain/zero/1.0/)
[![Deploy: GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-blue.svg)](https://nicholai.org)

## 🌌 Overview

**The Mystery of the Seven Stars** is a gamified constellation puzzle and operator dashboard deployed at [Nicholai.org](https://nicholai.org). It combines an interactive star-matching puzzle game with the Nexus OS command interface — featuring Firebase authentication, real-time telemetry, and achievement-gated content.

## 🗂️ Project Structure

```
├── src/                    # Nexus OS React application
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles (Tailwind)
├── mystery/                # Star Match puzzle game (vanilla JS)
│   ├── index.html          # Game shell
│   ├── script.js           # Puzzle engine
│   └── style.css           # Game styles (CSS-only visuals)
├── index.html              # Vite entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
├── CNAME                   # Custom domain (Nicholai.org)
└── LICENSE                 # CC0-1.0
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|  
| Framework  | React 18 + Vite 5                  |
| Styling    | Tailwind CSS 3                     |
| Auth       | Firebase Authentication            |
| Database   | Cloud Firestore                    |
| Hosting    | GitHub Pages (Nicholai.org)        |
| Game       | Vanilla JS Canvas-free puzzle engine |

## 🎮 Features

- **Star Match Puzzle** — Swap adjacent stars to form matches of 3+ in a row/column. Reach the score threshold to unlock the mystery.
- **Nexus OS Dashboard** — Operator-grade command interface with overworld navigation, telemetry panels, and terminal emulator.
- **Firebase Auth** — Anonymous, Google, and GitHub sign-in with audit logging.
- **Achievement Gating** — Unlock content and features by reaching milestones.
- **Responsive Design** — Mobile-first layout with full desktop support.

## 📜 License

This project is dedicated to the public domain under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/).

---

*Built by [Nicholai Maro Madias](https://github.com/NicholaiMadias)*
