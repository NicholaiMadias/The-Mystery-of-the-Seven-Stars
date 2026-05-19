1. Single tileset design (shared across games)

Use one atlas for all core tiles (planets, stars, comets, supernovae, black hole, nebula), based on your 4×4 “Mystery of the Seven Stars” grid.

Recommended atlas

File: assets/games/shared/tileset_atlas.png

Grid: 4×4

Tile size: 192×192 (or 128×128 if you prefer smaller)

Mapping (example):

{
  "name": "Shared_Tileset",
  "tileSize": 192,
  "columns": 4,
  "rows": 4,
  "tiles": [
    { "id": "planet_mars",   "x": 0,   "y": 0   },
    { "id": "planet_earth",  "x": 192, "y": 0   },
    { "id": "planet_saturn", "x": 384, "y": 0   },
    { "id": "planet_nebula", "x": 576, "y": 0   },

    { "id": "red_star",      "x": 0,   "y": 192 },
    { "id": "yellow_star",   "x": 192, "y": 192 },
    { "id": "blue_star",     "x": 384, "y": 192 },
    { "id": "blue_star_alt", "x": 576, "y": 192 },

    { "id": "comet_red",     "x": 0,   "y": 384 },
    { "id": "comet_blue",    "x": 192, "y": 384 },
    { "id": "comet_white",   "x": 384, "y": 384 },
    { "id": "supernova_red", "x": 576, "y": 384 },

    { "id": "supernova_blue","x": 0,   "y": 576 },
    { "id": "supernova_white","x":192, "y":576 },
    { "id": "black_hole",    "x": 384, "y": 576 },
    { "id": "nebula",        "x": 576, "y": 576 }
  ]
}

All three games can load this same tileset_atlas.png + tileset.json.

Your explosion sequence image can be a separate FX atlas (for supernova/black‑hole animations) later.

2. Level packs (A) — 7 levels per vanilla game

Shared level format for Match Master and Mystery of the Seven Stars:

Level JSON schema

{
  "level": 1,
  "targetScore": 500,
  "moves": 20,
  "boardSize": 8,
  "tileTypes": ["red_star", "yellow_star", "blue_star", "planet_mars", "planet_earth"]
}

Example pack for Match Master

src/arcade/games/match_master/levels/level1.json → level7.json:

// level1.json
{
  "level": 1,
  "targetScore": 500,
  "moves": 20,
  "boardSize": 8,
  "tileTypes": ["red_star", "yellow_star", "blue_star"]
}

// level4.json
{
  "level": 4,
  "targetScore": 2000,
  "moves": 25,
  "boardSize": 8,
  "tileTypes": ["red_star", "yellow_star", "blue_star", "planet_mars"]
}

// level7.json
{
  "level": 7,
  "targetScore": 4000,
  "moves": 30,
  "boardSize": 9,
  "tileTypes": ["red_star", "yellow_star", "blue_star", "planet_mars", "planet_earth", "planet_saturn"]
}

Mystery can reuse the same pattern but ramp difficulty slightly faster.

Shared loader

export async function loadLevel(gameId, levelNumber) {
  const res = await fetch(`src/arcade/games/${gameId}/levels/level${levelNumber}.json`);
  return res.json();
}

3. Revelation quiz UI (B) — overlay, not prompt

Questions file

src/arcade/games/mystery_seven_stars/quiz/revelation_questions.json (you already saw the content earlier).

Quiz overlay UI

export class QuizOverlay {
  constructor(container, questions, onCorrect, onIncorrect) {
    this.container = container;
    this.questions = questions;
    this.onCorrect = onCorrect;
    this.onIncorrect = onIncorrect;
    this.root = document.createElement('div');
    this.root.style.position = 'absolute';
    this.root.style.inset = '0';
    this.root.style.background = 'rgba(0,0,0,0.8)';
    this.root.style.display = 'flex';
    this.root.style.alignItems = 'center';
    this.root.style.justifyContent = 'center';
    this.root.style.color = '#fff';
    this.root.style.zIndex = '1000';
    container.appendChild(this.root);
  }

  ask(questionIndex) {
    const q = this.questions[questionIndex];
    this.root.innerHTML = '';

    const box = document.createElement('div');
    box.style.background = '#111';
    box.style.padding = '20px';
    box.style.borderRadius = '8px';
    box.style.maxWidth = '480px';

    const title = document.createElement('h2');
    title.textContent = `Mystery of the Seven Stars`;
    const text = document.createElement('p');
    text.textContent = q.question;

    const options = document.createElement('div');
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.style.display = 'block';
      btn.style.margin = '8px 0';
      btn.onclick = () => {
        if (i === q.correct) this.onCorrect();
        else this.onIncorrect();
        this.hide();
      };
      options.appendChild(btn);
    });

    box.appendChild(title);
    box.appendChild(text);
    box.appendChild(options);
    this.root.appendChild(box);
  }

  hide() {
    this.root.style.display = 'none';
  }

  destroy() {
    this.root.remove();
  }
}

Mystery engine calls quizOverlay.ask(currentChurchIndex) at level end or after N matches.

4. Badge art (C) — spec for 7 badges

You can generate these as a single badge atlas later, but here’s a clean spec:

File: assets/ui/badges_star.png

Grid: 7×1 (horizontal strip)

Size: 128×128 per badge

Badges:

Star 1 — simple gold star

Star 2 — star with faint halo

Star 3 — star with double halo

Star 4 — star + small planet

Star 5 — star + two orbiting sparks

Star 6 — star + laurel wreath

Star 7 — radiant starburst (Seven‑Star Ministry crest)

Badge mapping JSON

{
  "name": "Badge_Stars",
  "badgeSize": 128,
  "badges": [
    { "id": "star_1", "x": 0 },
    { "id": "star_2", "x": 128 },
    { "id": "star_3", "x": 256 },
    { "id": "star_4", "x": 384 },
    { "id": "star_5", "x": 512 },
    { "id": "star_6", "x": 640 },
    { "id": "star_7", "x": 768 }
  ]
}

Your existing “Mystery of the Seven Stars” title art can visually echo badge 7.

5. Star map with constellations (D)

Extend the earlier star map to show constellation lines and per‑game progress.

import { getProgress } from './progression.js';

export function renderStarMap(container) {
  container.innerHTML = '';

  const p = getProgress();

  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.width = '600px';
  wrapper.style.height = '200px';
  wrapper.style.margin = '20px auto';
  wrapper.style.background = 'radial-gradient(circle at top, #1a2340, #050814)';
  wrapper.style.borderRadius = '12px';
  wrapper.style.boxShadow = '0 0 30px rgba(0,0,0,0.7)';

  // constellation line
  const line = document.createElement('div');
  line.style.position = 'absolute';
  line.style.top = '50%';
  line.style.left = '5%';
  line.style.right = '5%';
  line.style.height = '2px';
  line.style.background = 'linear-gradient(to right, #555, #aaa, #555)';
  wrapper.appendChild(line);

  for (let i = 1; i <= 7; i++) {
    const star = document.createElement('div');
    star.style.position = 'absolute';
    const t = 5 + (90 / 6) * (i - 1);
    star.style.left = `${t}%`;
    star.style.top = '50%';
    star.style.transform = 'translate(-50%, -50%)';
    star.style.width = '40px';
    star.style.height = '40px';
    star.style.borderRadius = '50%';
    star.style.display = 'flex';
    star.style.alignItems = 'center';
    star.style.justifyContent = 'center';
    star.style.fontSize = '22px';
    star.style.color = '#000';
    star.style.background = i <= p.total
      ? 'radial-gradient(circle, gold, orange)'
      : 'radial-gradient(circle, #333, #111)';
    star.textContent = i <= p.total ? '★' : '☆';
    wrapper.appendChild(star);
  }

  container.appendChild(wrapper);
}

You can add per‑game progress text below:

const info = document.createElement('div');
info.style.color = '#fff';
info.style.textAlign = 'center';
info.textContent = `Match Master: ${p.match_master}/7 • Mystery: ${p.mystery}/7 • Total: ${p.total}/7`;
container.appendChild(info);

6. Sound hooks (E) — optional, non‑blocking

Create a tiny helper that fails gracefully if files are missing or audio is blocked.

export function createSound(src, { loop = false, volume = 0.5 } = {}) {
  try {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    return {
      play: () => { audio.currentTime = 0; audio.play().catch(() => {}); },
      stop: () => audio.pause()
    };
  } catch {
    return { play: () => {}, stop: () => {} };
  }
}

Usage in Match Master:

import { createSound } from '../../core/sound.js';

const sfxMatch = createSound('assets/audio/sfx/match.wav');
const sfxStar  = createSound('assets/audio/sfx/star_collect.wav');

this.resolveMatches = (matches) => {
  sfxMatch.play();
  // existing logic...
};

onLevelComplete(level) {
  sfxStar.play();
  this.onWin(level);
}

If the files don’t exist yet, the game still runs.

7. Seven‑Star Ministry progression screen (F)

A dedicated “meta‑screen” that combines:

Star map

Badge list

Per‑game progress

Star_Match lock status

import { getProgress, isStarMatchUnlocked } from './progression.js';
import { renderStarMap } from './starMap.js';

export function renderSevenStarMinistry(container) {
  container.innerHTML = '';
  container.style.position = 'relative';
  container.style.padding = '20px';
  container.style.color = '#fff';
  container.style.background = '#050814';

  const title = document.createElement('h1');
  title.textContent = 'Seven-Star Ministry';
  title.style.textAlign = 'center';
  container.appendChild(title);

  renderStarMap(container);

  const p = getProgress();

  const summary = document.createElement('div');
  summary.style.textAlign = 'center';
  summary.style.marginTop = '16px';
  summary.textContent =
    `Match Master: ${p.match_master}/7 • Mystery: ${p.mystery}/7 • Total: ${p.total}/7`;
  container.appendChild(summary);

  const status = document.createElement('div');
  status.style.textAlign = 'center';
  status.style.marginTop = '8px';
  status.textContent = isStarMatchUnlocked()
    ? 'Star Match: UNLOCKED'
    : 'Star Match: Locked — collect 7 stars.';
  container.appendChild(status);
}

Wire a button in your launcher:

launcher.addButton('Seven-Star Ministry', () => {
  const mount = document.getElementById('arcade-root');
  renderSevenStarMinistry(mount);
});

What you can do right now

Export a single tileset atlas matching the mapping above.

Drop in:

tileset_atlas.png

tileset.json

Add:

progression.js, starMap.js, badges.js

Wire Match Master to:

load level1.json

call addStar('match_master') and arcadeApi.unlockBadge(...) on level win

You’ll immediately see:

Stars filling in the star map

Badge popups

Seven‑Star Ministry screen reflecting progress

Once that’s live, we can tighten:

Full 7‑level packs

Mystery quiz flow per level

Star_Match using the same shared tileset.
