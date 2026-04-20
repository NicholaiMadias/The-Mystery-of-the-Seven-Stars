/**
 * The Mystery of the Seven Stars - Game Engine
 * Modular match-3 arcade with state management, accessibility, and HUD integration.
 * (c) 2026 NicholaiMadias - MIT License
 */

/* ── Constants ── */
const GRID_SIZE  = 6;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const MATCH_MIN  = 3;
const SCORE_PER  = 250;
const WIN_SCORE  = 5200;
const FUSION_GOAL = 3;

const STAR_LIBRARY = {
  yellow   : { id: 'yellow',    cls: 'star-yellow',    label: 'Chibi Star' },
  bronze   : { id: 'bronze',    cls: 'star-bronze',    label: 'Bronze Star' },
  silver   : { id: 'silver',    cls: 'star-silver',    label: 'Silver Star' },
  gold     : { id: 'gold',      cls: 'star-gold',      label: 'Gold Star' },
  blue     : { id: 'blue',      cls: 'star-blue',      label: 'Blue Star' },
  purple   : { id: 'purple',    cls: 'star-purple',    label: 'Purple Star' },
  green    : { id: 'green',     cls: 'star-green',     label: 'Fusion Green Star' },
  blackhole: { id: 'blackhole', cls: 'star-blackhole', label: 'Locked Star', locked: true }
};

const LEVELS = [
  { level: 1, pool: ['yellow', 'bronze', 'silver'], lockedChance: 0 },
  { level: 2, pool: ['yellow', 'silver', 'gold', 'blue'], lockedChance: 0.05 },
  { level: 3, pool: ['yellow', 'gold', 'blue', 'purple'], lockedChance: 0.08 },
  { level: 4, pool: ['yellow', 'blue', 'purple', 'gold'], lockedChance: 0.1 }
];
const LEVEL_THRESHOLDS = [0, 1500, 3000, 4200, WIN_SCORE];

/* ── Game State ── */
const state = {
  board      : [],
  score      : 0,
  moves      : 0,
  level      : 1,
  streak     : 0,
  fusion     : { yellow: 0, blue: 0, ready: false },
  selected   : null,
  locked     : false,
  running    : false,
  focusIndex : 0,
  lastMoveAt : Date.now()
};

/* ── DOM References ── */
const dom = {};

function cacheDom() {
  dom.board        = document.getElementById('match-board');
  dom.score        = document.getElementById('score');
  dom.moves        = document.getElementById('moves');
  dom.level        = document.getElementById('level');
  dom.streak       = document.getElementById('streak');
  dom.msg          = document.getElementById('msg');
  dom.newGame      = document.getElementById('new-game-btn');
  dom.hint         = document.getElementById('hint-btn');
  dom.fusionFill   = document.getElementById('fusion-fill');
  dom.fusionStatus = document.getElementById('fusion-status');
  dom.effects      = document.getElementById('effect-layer');
  dom.supernova    = document.getElementById('supernova');
  dom.guideText    = document.getElementById('guide-text');
}

/* ── Utilities ── */
function currentLevelConfig() {
  var idx = Math.min(state.level - 1, LEVELS.length - 1);
  return LEVELS[idx];
}

function randomType(options) {
  var cfg = currentLevelConfig();
  var allowLocked = options && options.allowLocked !== false;
  var pool = cfg.pool.slice();

  if (state.fusion.ready && pool.indexOf('green') === -1) pool.push('green');

  if (allowLocked && cfg.lockedChance && Math.random() < cfg.lockedChance) {
    return STAR_LIBRARY.blackhole;
  }

  var choice = pool[Math.floor(Math.random() * pool.length)];
  return STAR_LIBRARY[choice];
}

function toRowCol(index) {
  return { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE };
}

function toIndex(row, col) {
  return row * GRID_SIZE + col;
}

function fusionProgress() {
  var y = Math.min(state.fusion.yellow, FUSION_GOAL) / FUSION_GOAL;
  var b = Math.min(state.fusion.blue, FUSION_GOAL) / FUSION_GOAL;
  return (y + b) / 2;
}

function areNeighbors(a, b) {
  var posA = toRowCol(a);
  var posB = toRowCol(b);
  return (Math.abs(posA.row - posB.row) + Math.abs(posA.col - posB.col)) === 1;
}

/* ── Board Rendering ── */
function renderBoard() {
  dom.board.innerHTML = '';
  dom.board.setAttribute('role', 'grid');
  dom.board.setAttribute('aria-label', 'Mystery Match game board');

  state.board.forEach(function (star, i) {
    var cell = document.createElement('button');
    cell.className     = 'square ' + star.cls + (star.locked ? ' locked' : '');
    cell.dataset.index = i;
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', star.label + (star.locked ? ' (locked)' : '') + ', position ' + (i + 1));
    cell.setAttribute('tabindex', i === state.focusIndex ? '0' : '-1');
    cell.addEventListener('click', function () { onCellClick(i); });
    cell.addEventListener('keydown', function (e) { onCellKey(e, i); });
    dom.board.appendChild(cell);
  });
}

/* ── HUD Updates ── */
function updateHUD() {
  if (dom.score) dom.score.textContent = state.score;
  if (dom.moves) dom.moves.textContent = state.moves;
  if (dom.level) dom.level.textContent = state.level;
  if (dom.streak) dom.streak.textContent = state.streak;
  if (dom.fusionFill) {
    var pct = fusionProgress() * 100;
    dom.fusionFill.style.width = Math.min(100, pct) + '%';
  }
  if (dom.fusionStatus) {
    var y = Math.min(state.fusion.yellow, FUSION_GOAL);
    var b = Math.min(state.fusion.blue, FUSION_GOAL);
    dom.fusionStatus.textContent = state.fusion.ready ?
      'Fusion ready — Green Star live' :
      'Collect yellow (' + y + '/' + FUSION_GOAL + ') + blue (' + b + '/' + FUSION_GOAL + ')';
  }
}

function showMessage(text) {
  if (dom.msg) {
    dom.msg.textContent = text;
    dom.msg.setAttribute('aria-live', 'polite');
  }
}

function launchShootingStar(index) {
  if (!dom.board || !dom.effects || !dom.score) return;
  var cell = dom.board.querySelector('[data-index="' + index + '"]');
  if (!cell) return;
  var start = cell.getBoundingClientRect();
  var target = dom.score.getBoundingClientRect();
  var star = document.createElement('div');
  star.className = 'shooting-star';
  var sx = start.left + start.width / 2;
  var sy = start.top + start.height / 2;
  var dx = (target.left + target.width / 2) - sx;
  var dy = (target.top + target.height / 2) - sy;
  star.style.left = sx + 'px';
  star.style.top  = sy + 'px';
  star.style.setProperty('--dx', dx + 'px');
  star.style.setProperty('--dy', dy + 'px');
  dom.effects.appendChild(star);
  setTimeout(function () {
    if (star.parentNode) star.parentNode.removeChild(star);
  }, 800);
}

function triggerSupernova() {
  if (!dom.supernova) return;
  dom.supernova.classList.remove('active');
  // force reflow to restart animation
  void dom.supernova.offsetWidth;
  dom.supernova.classList.add('active');
}

/* ── Match Detection ── */
function findMatches() {
  var matched = new Set();
  var r, c, run, idx, prev;

  for (r = 0; r < GRID_SIZE; r++) {
    run = [toIndex(r, 0)];
    for (c = 1; c < GRID_SIZE; c++) {
      idx  = toIndex(r, c);
      prev = toIndex(r, c - 1);
      if (state.board[idx].cls === state.board[prev].cls) {
        run.push(idx);
      } else {
        if (run.length >= MATCH_MIN) run.forEach(function (x) { matched.add(x); });
        run = [idx];
      }
    }
    if (run.length >= MATCH_MIN) run.forEach(function (x) { matched.add(x); });
  }

  for (c = 0; c < GRID_SIZE; c++) {
    run = [toIndex(0, c)];
    for (r = 1; r < GRID_SIZE; r++) {
      idx  = toIndex(r, c);
      prev = toIndex(r - 1, c);
      if (state.board[idx].cls === state.board[prev].cls) {
        run.push(idx);
      } else {
        if (run.length >= MATCH_MIN) run.forEach(function (x) { matched.add(x); });
        run = [idx];
      }
    }
    if (run.length >= MATCH_MIN) run.forEach(function (x) { matched.add(x); });
  }

  return matched;
}

/* ── Board Collapse & Refill ── */
function clearAndRefill(matched) {
  if (!dom.board) return Promise.resolve();
  var cells = dom.board.querySelectorAll('.square');
  matched.forEach(function (idx) { cells[idx].classList.add('match-explode'); });

  return new Promise(function (resolve) {
    setTimeout(function () {
      var c, col, r, idx2;
      for (c = 0; c < GRID_SIZE; c++) {
        col = [];
        for (r = GRID_SIZE - 1; r >= 0; r--) {
          idx2 = toIndex(r, c);
          if (!matched.has(idx2)) col.push(state.board[idx2]);
        }
        while (col.length < GRID_SIZE) col.push(randomType());
        col.reverse();
        for (r = 0; r < GRID_SIZE; r++) {
          state.board[toIndex(r, c)] = col[r];
        }
      }
      renderBoard();
      updateHUD();
      resolve();
    }, 400);
  });
}

/* ── Cascade Loop ── */
function processCascades(initialMatched) {
  state.locked = true;
  var matched = initialMatched || findMatches();

  function loop() {
    if (matched.size === 0) {
      maybeLevelUp();
      checkWin();
      state.locked = false;
      return;
    }

    matched.forEach(function (idx) { launchShootingStar(idx); });
    applyFusionProgress(matched);
    state.score += matched.size * SCORE_PER;
    if (state.streak > 0 && state.streak % 5 === 0) triggerSupernova();
    updateHUD();

    clearAndRefill(matched).then(function () {
      matched = findMatches();
      loop();
    });
  }

  loop();
}

function applyFusionProgress(matched) {
  matched.forEach(function (idx) {
    var star = state.board[idx];
    if (!star) return;
    if (star.id === 'yellow') state.fusion.yellow++;
    if (star.id === 'blue') state.fusion.blue++;
  });

  if (!state.fusion.ready &&
      state.fusion.yellow >= FUSION_GOAL &&
      state.fusion.blue   >= FUSION_GOAL) {
    state.fusion.ready = true;
    showMessage('Fusion unlocked — Green Star added to the grid.');
    spawnFusionStar();
    triggerSupernova();
  }
}

function spawnFusionStar() {
  var open = [];
  for (var i = 0; i < state.board.length; i++) {
    if (state.board[i] && !state.board[i].locked) open.push(i);
  }
  if (!open.length) return;
  var idx = open[Math.floor(Math.random() * open.length)];
  state.board[idx] = STAR_LIBRARY.green;
  renderBoard();
}

function maybeLevelUp() {
  while (state.level < LEVEL_THRESHOLDS.length - 1 &&
         state.score >= LEVEL_THRESHOLDS[state.level]) {
    levelUp();
  }
}

function levelUp() {
  if (state.level >= LEVELS.length) return;
  state.level++;
  showMessage('Level ' + state.level + ' — harder tiles unlocked.');
  triggerSupernova();
  var lockedIdx = state.board.findIndex(function (s) { return s && s.locked; });
  if (lockedIdx >= 0) {
    state.board[lockedIdx] = randomType({ allowLocked: false });
    renderBoard();
  }
}

/* ── Swap Logic ── */
function swapCells(a, b) {
  var tmp = state.board[a];
  state.board[a] = state.board[b];
  state.board[b] = tmp;
}

function attemptSwap(a, b) {
  if (state.locked || !state.running) return;
  if (state.board[a].locked || state.board[b].locked) {
    showMessage('Black Hole tile — level up or clear around it.');
    return;
  }

  swapCells(a, b);
  state.moves = Math.max(0, state.moves - 1);
  state.lastMoveAt = Date.now();
  renderBoard(); // show the attempted swap

  var matched = findMatches();
  if (matched.size > 0) {
    state.streak++;
    processCascades(matched);
  } else {
    swapCells(a, b);
    state.streak = 0;
    renderBoard(); // revert visually immediately
    showMessage('No match - try again');
    setTimeout(function () { showMessage(''); }, 1200);
  }
  if (state.moves <= 0 && state.running) {
    state.running = false;
    showMessage('No moves left — start a new run.');
  }
  updateHUD();
}

/* ── Input Handlers ── */
function onCellClick(index) {
  if (state.locked || !state.running) return;

  var cells = dom.board.querySelectorAll('.square');
  if (state.board[index] && state.board[index].locked) {
    showMessage('Locked tile — clear matches nearby or level up.');
    return;
  }
  if (state.selected === null) {
    state.selected = index;
    cells[index].classList.add('selected');
  } else if (state.selected === index) {
    cells[index].classList.remove('selected');
    state.selected = null;
  } else if (areNeighbors(state.selected, index)) {
    cells[state.selected].classList.remove('selected');
    var prev = state.selected;
    state.selected = null;
    attemptSwap(prev, index);
  } else {
    cells[state.selected].classList.remove('selected');
    state.selected = index;
    cells[index].classList.add('selected');
  }
}

function onCellKey(e, index) {
  var pos = toRowCol(index);
  var target = -1;

  switch (e.key) {
    case 'ArrowUp':    if (pos.row > 0) target = toIndex(pos.row - 1, pos.col); break;
    case 'ArrowDown':  if (pos.row < GRID_SIZE - 1) target = toIndex(pos.row + 1, pos.col); break;
    case 'ArrowLeft':  if (pos.col > 0) target = toIndex(pos.row, pos.col - 1); break;
    case 'ArrowRight': if (pos.col < GRID_SIZE - 1) target = toIndex(pos.row, pos.col + 1); break;
    case 'Enter':
    case ' ':
      onCellClick(index);
      e.preventDefault();
      return;
    default: return;
  }

  if (target >= 0) {
    e.preventDefault();
    state.focusIndex = target;
    dom.board.querySelectorAll('.square')[target].focus();
  }
}

function findHintMove() {
  for (var i = 0; i < CELL_COUNT; i++) {
    var neighbors = [];
    var pos = toRowCol(i);
    if (pos.col < GRID_SIZE - 1) neighbors.push(i + 1);
    if (pos.row < GRID_SIZE - 1) neighbors.push(i + GRID_SIZE);

    for (var n = 0; n < neighbors.length; n++) {
      var j = neighbors[n];
      if (state.board[i].locked || state.board[j].locked) continue;
      swapCells(i, j);
      var match = findMatches();
      swapCells(i, j);
      if (match.size > 0) return { a: i, b: j };
    }
  }
  return null;
}

function clearHint() {
  var hints = dom.board ? dom.board.querySelectorAll('.square.hint') : [];
  hints.forEach(function (c) { c.classList.remove('hint'); });
}

function showHint() {
  if (!dom.board || !state.running || state.locked) return;
  clearHint();
  var move = findHintMove();
  if (!move) {
    showMessage('No moves detected — refresh the grid.');
    if (dom.guideText) dom.guideText.textContent = 'No moves left; start a new run.';
    return;
  }
  var cells = dom.board.querySelectorAll('.square');
  if (cells[move.a]) cells[move.a].classList.add('hint');
  if (cells[move.b]) cells[move.b].classList.add('hint');
  showMessage('Angel Guide: swap the glowing tiles.');
  if (dom.guideText) dom.guideText.textContent = 'I’ve scanned the data-stream... try swapping the highlighted pair.';
  setTimeout(clearHint, 2500);
}

/* ── Win Condition ── */
function checkWin() {
  if (state.score >= WIN_SCORE) {
    state.running = false;
    showMessage('SEVEN STARS ALIGNED — GREEN ZONE UNLOCKED');
    if (dom.board) dom.board.classList.add('board-complete');
  }
}

/* ── Seed Board (no starting matches) ── */
function wouldMatchOnPlace(index, star) {
  var pos = toRowCol(index);
  if (pos.col >= 2) {
    var a = toIndex(pos.row, pos.col - 1);
    var b = toIndex(pos.row, pos.col - 2);
    if (state.board[a] && state.board[b] &&
        state.board[a].cls === star.cls &&
        state.board[b].cls === star.cls) return true;
  }
  if (pos.row >= 2) {
    var c = toIndex(pos.row - 1, pos.col);
    var d = toIndex(pos.row - 2, pos.col);
    if (state.board[c] && state.board[d] &&
        state.board[c].cls === star.cls &&
        state.board[d].cls === star.cls) return true;
  }
  return false;
}

function seedBoard() {
  state.board = [];
  for (var i = 0; i < CELL_COUNT; i++) {
    var star;
    do { star = randomType({ allowLocked: false }); } while (wouldMatchOnPlace(i, star));
    state.board.push(star);
  }
}

/* ── New Game ── */
function startGame() {
  state.score      = 0;
  state.moves      = 30;
  state.level      = 1;
  state.streak     = 0;
  state.fusion     = { yellow: 0, blue: 0, ready: false };
  state.selected   = null;
  state.locked     = false;
  state.running    = true;
  state.focusIndex = 0;
  state.lastMoveAt = Date.now();
  seedBoard();
  renderBoard();
  updateHUD();
  showMessage('Match the Seven Stars');
  if (dom.board) dom.board.classList.remove('board-complete');
}

/* ── Bootstrap ── */
function init() {
  cacheDom();
  if (dom.newGame) dom.newGame.addEventListener('click', startGame);
  if (dom.hint) dom.hint.addEventListener('click', showHint);
  setInterval(function () {
    if (!state.running) return;
    if (Date.now() - state.lastMoveAt > 12000) showHint();
  }, 12000);
  startGame();
}

window.addEventListener('DOMContentLoaded', init);
