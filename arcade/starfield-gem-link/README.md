# Starfield Gem-Link - Google Apps Script Game

A match-3 puzzle game built with Google Apps Script, part of the Nexus Arcade OS.

## Game Description

Starfield Gem-Link is a classic match-3 puzzle game where players swap adjacent gems to create matches of three or more identical gems. Each successful match awards points, and players can save their high scores.

## Features

- 8x8 game board with 6 different gem types
- Smooth animations and visual effects
- Score tracking and saving functionality
- Responsive design for mobile and desktop
- Cosmic starfield theme with golden accents

## Deployment Instructions

### Prerequisites
- A Google account
- Access to Google Apps Script

### Steps to Deploy

1. **Create a New Apps Script Project**
   - Go to [Google Apps Script](https://script.google.com)
   - Click "New Project"
   - Name your project "Starfield Gem-Link"

2. **Add the Files**
   - Replace the default `Code.gs` content with the code from `Code.gs`
   - Click the "+" next to "Files" and select "HTML"
   - Name it `match3` (without the .html extension)
   - Paste the content from `match3.html`

3. **Configure the Project**
   - Create a new file called `appsscript.json` by clicking "Project Settings" > "Show appsscript.json manifest in editor"
   - Replace the content with the code from `appsscript.json`

4. **Deploy as Web App**
   - Click "Deploy" > "New deployment"
   - Click "Select type" > "Web app"
   - Configure:
     - **Description**: Starfield Gem-Link v1.0
     - **Execute as**: Me (your email)
     - **Who has access**: Anyone
   - Click "Deploy"
   - Authorize the application when prompted
   - Copy the web app URL

5. **Test Your Game**
   - Open the web app URL in a browser
   - Play the game and test the score saving feature

### Embedding in Your Hub

The game is configured with `XFrameOptionsMode.ALLOWALL`, which allows it to be embedded in iframes on your main hub website (nicholai.org).

Example embed code:
```html
<iframe src="YOUR_WEB_APP_URL" width="100%" height="800px" frameborder="0"></iframe>
```

## Game Controls

- **Click** on a gem to select it
- **Click** on an adjacent gem to swap
- Match 3 or more gems in a row or column to score points
- Click "New Game" to reset
- Click "Save Score" to save your high score (requires email)

## Score System

- Each matched gem is worth 100 points
- Combos and cascading matches award additional points
- Scores are saved using Google Apps Script Properties Service

## Technical Details

### Backend (Code.gs)
- `doGet()`: Serves the HTML game interface
- `saveScore(email, score)`: Saves player scores to Script Properties

### Frontend (match3.html)
- Pure JavaScript implementation
- CSS3 animations for smooth gameplay
- Responsive grid layout
- Integration with Google Apps Script backend

## Customization

You can customize the game by modifying:
- `GEM_TYPES`: Change colors or add new gem types
- `BOARD_SIZE`: Adjust grid dimensions (default: 8x8)
- CSS variables in `:root`: Change theme colors
- Score multipliers in `updateScore()`

## Matrix Backend Integration

The `saveScore()` function is designed to work with a Matrix backend for telemetry. To enable full integration:

1. Set up your Matrix backend endpoint
2. Modify the `saveScore()` function to POST to your backend
3. Configure authentication if needed

## License

Part of The Mystery of the Seven Stars project.
