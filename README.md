# The Mystery of the Seven Stars

> *A mythic-modern interactive experience built on the Nexus OS platform -- prepared for the Voice of Jesus Ministry.*

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://creativecommons.org/publicdomain/zero/1.0/)
[![Deploy: GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-blue.svg)](https://voj.amazinggracehl.org)

## Overview

**The Mystery of the Seven Stars** is a gamified constellation puzzle and operator dashboard deployed at [voj.amazinggracehl.org](https://voj.amazinggracehl.org). It combines an interactive star-matching puzzle game with the Nexus OS command interface -- featuring Firebase authentication, real-time telemetry, and achievement-gated content.

Prepared for the **Voice of Jesus Ministry** (VOJ) as part of the Amazing Grace HL digital outreach initiative.

## Project Structure

```
+-- src/                    # Nexus OS React application
|   +-- App.jsx             # Main application component
|   +-- main.jsx            # React entry point
|   +-- index.css           # Global styles (Tailwind)
+-- mystery/                # Star Match puzzle game (vanilla JS)
|   +-- index.html          # Game shell
|   +-- script.js           # Puzzle engine
|   +-- style.css           # Game styles (CSS-only visuals)
+-- arcade/                 # Arcade mini-games
+-- backend/                # Server-side components
+-- index.html              # Vite entry point
+-- package.json            # Dependencies and scripts
+-- vite.config.js          # Vite configuration
+-- tailwind.config.js      # Tailwind CSS config
+-- postcss.config.js       # PostCSS config
+-- CNAME                   # Custom domain (voj.amazinggracehl.org)
+-- LICENSE                 # CC0-1.0
```

## Quick Start

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

## Tech Stack

| Layer      | Technology                         |
|------------|------------------------------------|
| Framework  | React 18 + Vite 5                  |
| Styling    | Tailwind CSS 3                     |
| Auth       | Firebase Authentication            |
| Database   | Cloud Firestore                    |

## About the Voice of Jesus Ministry

This repository has been prepared for deployment under the **Voice of Jesus Ministry** domain (`voj.amazinggracehl.org`). The interactive experience serves as a digital outreach tool, combining engaging gameplay with inspirational content.

### Deployment Checklist

- [x] CNAME configured for `voj.amazinggracehl.org`
- [x] GitHub Pages enabled
- [ ] Firebase project linked
- [ ] Custom SSL certificate configured
- [ ] Analytics/DNS records verified

## License

This project is dedicated to the public domain under the [CC0 1.0 Universal](LICENSE) license.
