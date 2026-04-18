/**
 * The Mystery of the Seven Stars - Game Engine
 * Modular match-3 arcade with state management, accessibility, and HUD integration.
 * (c) 2026 NicholaiMadias - MIT License
 */

/* ── Constants ── */
const GRID_SIZE   = 6;
const CELL_COUNT  = GRID_SIZE * GRID_SIZE;
const MATCH_MIN   = 3;
const SCORE_PER   = 250;
const WIN_SCORE   = 5000;
const STAR_TYPES  = [
  { cls: 'star-gold',   label: 'Gold Star'   },
  { cls: 'star-blue',   label: 'Blue Star'   },
  { cls: 'star-purple', label: 'Purple Star' },
  { cls: 'star-red',    label: 'Red Star'    },
  { cls: 'star-green',  label: 'Green Star'  },
  { cls: 'star-silver', label: 'Silver Star' },
  { cls: 'star-cosmic', label: 'Cosmic Star' }
];

/* ── Game State ── */
const state = {
  board      : [],
  score      : 0,
  moves      : 0,
  selected   : null,
  locked     : false,
  running    : false,
  focusIndex : 0
};

/* ── DOM References ── */
const dom = {};

function cacheDom() {
  dom.board   = document.getElementById('match-board');
  dom.score   = document.getElementById('score');
  dom.moves   = document.getElementById('moves');
  dom.msg     = document.getElementById('msg');
  dom.newGame = document.getElementById('new-game-btn');
}

/* ── Utilities ── */
function randomType() {
  return STAR_TYPES[Math.floor(Math.random() * STAR_TYPES.length)];
}

function toRowCol(index) {
  return { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE };
}

function toIndex(row, col) {
  return row * GRID_SIZE + col;
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
    cell.className     = 'square ' + star.cls;
    cell.dataset.index = i;
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', star.label + ', position ' + (i + 1));
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
}

function showMessage(text) {
  if (dom.msg) {
    dom.msg.textContent = text;
    dom.msg.setAttribute('aria-live', 'polite');
  }
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
function processCascades() {
  state.locked = true;
  var matched = findMatches();

  function loop() {
    if (matched.size === 0) {
      checkWin();
      state.locked = false;
      return;
    }
    state.score += matched.size * SCORE_PER;
    updateHUD();
    clearAndRefill(matched).then(function () {
      matched = findMatches();
      loop();
    });
  }

  loop();
}

/* ── Swap Logic ── */
function swapCells(a, b) {
  var tmp = state.board[a];
  state.board[a] = state.board[b];
  state.board[b] = tmp;
}

function attemptSwap(a, b) {
  if (state.locked) return;

  swapCells(a, b);
  state.moves++;
  updateHUD();
  renderBoard(); // show the attempted swap

  var matched = findMatches();
  if (matched.size > 0) {
    processCascades();
  } else {
    swapCells(a, b);
    renderBoard(); // revert visually immediately
    showMessage('No match - try again');
    setTimeout(function () { showMessage(''); }, 1200);
  }
}

/* ── Input Handlers ── */
function onCellClick(index) {
  if (state.locked || !state.running) return;

  var cells = dom.board.querySelectorAll('.square');
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

/* ── Win Condition ── */
function checkWin() {
  if (state.score >= WIN_SCORE) {
    state.running = false;
    showMessage('SEVEN STARS ALIGNED — MYSTERY SOLVED');
    dom.board.classList.add('board-complete');
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
    do { star = randomType(); } while (wouldMatchOnPlace(i, star));
    state.board.push(star);
  }
}

/* ── New Game ── */
function startGame() {
  state.score      = 0;
  state.moves      = 0;
  state.selected   = null;
  state.locked     = false;
  state.running    = true;
  state.focusIndex = 0;
  seedBoard();
  renderBoard();
  updateHUD();
  showMessage('Match the Seven Stars');
  dom.board.classList.remove('board-complete');
}

/* ── Bootstrap ── */
function init() {
  cacheDom();
  if (dom.newGame) dom.newGame.addEventListener('click', startGame);
  startGame();
}

window.addEventListener('DOMContentLoaded', init);
