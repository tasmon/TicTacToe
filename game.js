/*
 * game.js - TicTacToe main screen logic (index.html only)
 *
 * Navigation model (per CloudPhone RSK guidance):
 *   This is the "home" single-page app. RSK is left UNINTERCEPTED here -
 *   native back/close behavior is used, driven purely by the History API
 *   (history.pushState/replaceState + popstate). Every forward navigation
 *   pushes (or replaces) a history entry; RSK naturally pops it, and we
 *   just re-render whatever the popped state describes. Pause/Game-Over
 *   overlays are themselves history entries, so RSK on them elegantly
 *   resumes / closes them.
 */
(function () {
  'use strict';

  var CP = window.CloudPhone;
  var AI = window.TicTacToeAI;

  var state = {
    screen: 'title',       // 'title' | 'difficulty' | 'game'
    overlay: null,         // null | 'pause' | 'gameover'
    mode: null,            // 'pvp' | 'cpu'
    difficulty: 'medium',
    board: new Array(9).fill(null),
    current: 'X',
    playerMark: 'X',
    cpuMark: 'O',
    boardCursor: 4,
    titleIndex: 0,
    difficultyIndex: 0,
    pauseIndex: 0,
    gameoverIndex: 0,
    winLine: null
  };

  var settings = CP.loadSettings();
  CP.applyTheme(settings.theme);
  state.difficulty = settings.difficulty;

  var titleItems = ['pvp', 'cpu', 'settings', 'help', 'about'];
  var difficultyItems = ['easy', 'medium', 'hard'];
  var pauseItems = ['resume', 'restart', 'settings', 'help', 'about', 'menu'];
  var gameoverItems = ['again', 'menu'];

  var boardEl = document.getElementById('board');
  var turnEl = document.getElementById('turn-indicator');
  var statsLine = document.getElementById('stats-line');
  var titleMenu = document.getElementById('title-menu');
  var difficultyMenu = document.getElementById('difficulty-menu');
  var pauseMenu = document.getElementById('pause-menu');
  var gameoverMenu = document.getElementById('gameover-menu');
  var overlayPause = document.getElementById('overlay-pause');
  var overlayGameover = document.getElementById('overlay-gameover');
  var gameoverTitle = document.getElementById('gameover-title');
  var gameoverMessage = document.getElementById('gameover-message');
  var screenTitle = document.getElementById('screen-title');
  var screenDifficulty = document.getElementById('screen-difficulty');
  var screenGame = document.getElementById('screen-game');

  // ---- Build the 9 board cells once ----
  for (var i = 0; i < 9; i++) {
    (function (idx) {
      var cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = idx;
      cell.addEventListener('click', function () { onCellActivate(idx); });
      boardEl.appendChild(cell);
    })(i);
  }
  var cellEls = Array.prototype.slice.call(boardEl.children);

  function bindMenuClicks(menuEl, items, handler) {
    Array.prototype.slice.call(menuEl.children).forEach(function (li, idx) {
      li.addEventListener('click', function () { handler(items[idx]); });
    });
  }
  bindMenuClicks(titleMenu, titleItems, onTitleSelect);
  bindMenuClicks(difficultyMenu, difficultyItems, onDifficultySelect);
  bindMenuClicks(pauseMenu, pauseItems, onPauseSelect);
  bindMenuClicks(gameoverMenu, gameoverItems, onGameoverSelect);

  // ---------------- Navigation / History plumbing ----------------
  history.replaceState({ screen: 'title' }, '', location.pathname + location.search);

  function pushScreen(screen) {
    history.pushState({ screen: screen }, '', '#' + screen);
    setScreen(screen);
  }
  function replaceScreen(screen) {
    history.replaceState({ screen: screen }, '', '#' + screen);
    setScreen(screen);
  }
  function pushOverlay(name) {
    history.pushState({ screen: 'game', overlay: name }, '', '#' + name);
    setOverlay(name);
  }

  window.addEventListener('popstate', function (e) {
    var st = e.state || { screen: 'title' };
    setScreen(st.screen || 'title');
    setOverlay(st.overlay || null);
  });

  function setScreen(screen) {
    state.screen = screen;
    state.overlay = null;
    screenTitle.classList.toggle('active', screen === 'title');
    screenDifficulty.classList.toggle('active', screen === 'difficulty');
    screenGame.classList.toggle('active', screen === 'game');
    overlayPause.hidden = true;
    overlayGameover.hidden = true;

    if (screen === 'title') {
      state.titleIndex = 0;
      renderTitleMenu();
      updateStatsLine();
      CP.setSoftkeyLabels('', '', '');
    } else if (screen === 'difficulty') {
      state.difficultyIndex = 0;
      renderDifficultyMenu();
      CP.setSoftkeyLabels('', 'Select', 'Back');
    } else if (screen === 'game') {
      renderBoard();
      CP.setSoftkeyLabels('Menu', 'Place', 'Back');
    }
  }

  function setOverlay(overlay) {
    state.overlay = overlay || null;
    overlayPause.hidden = overlay !== 'pause';
    overlayGameover.hidden = overlay !== 'gameover';

    if (overlay === 'pause') {
      state.pauseIndex = 0;
      renderPauseMenu();
      CP.setSoftkeyLabels('', 'Select', 'Resume');
    } else if (overlay === 'gameover') {
      state.gameoverIndex = 0;
      renderGameoverMenu();
      CP.setSoftkeyLabels('', 'Select', 'Close');
    } else if (state.screen === 'game') {
      CP.setSoftkeyLabels('Menu', 'Place', 'Back');
      renderBoard();
    }
  }

  // ---------------- Title screen ----------------
  function renderTitleMenu() {
    Array.prototype.slice.call(titleMenu.children).forEach(function (li, idx) {
      li.classList.toggle('focused', idx === state.titleIndex);
    });
  }
  function updateStatsLine() {
    var stats = CP.loadStats();
    statsLine.textContent = 'W:' + stats.wins + '  L:' + stats.losses + '  D:' + stats.draws;
  }
  function onTitleSelect(action) {
    if (action === 'pvp') {
      startGame('pvp', null);
      pushScreen('game');
    } else if (action === 'cpu') {
      pushScreen('difficulty');
    } else if (action === 'settings') {
      window.location.href = 'settings.html';
    } else if (action === 'help') {
      window.location.href = 'help.html';
    } else if (action === 'about') {
      window.location.href = 'about.html';
    }
  }

  // ---------------- Difficulty screen ----------------
  function renderDifficultyMenu() {
    Array.prototype.slice.call(difficultyMenu.children).forEach(function (li, idx) {
      li.classList.toggle('focused', idx === state.difficultyIndex);
    });
  }
  function onDifficultySelect(diff) {
    startGame('cpu', diff);
    replaceScreen('game');
  }

  // ---------------- Core game logic ----------------
  function startGame(mode, difficulty) {
    state.mode = mode;
    if (difficulty) {
      state.difficulty = difficulty;
      CP.saveSetting('difficulty', difficulty);
    }
    state.board = new Array(9).fill(null);
    state.current = 'X';
    state.playerMark = 'X';
    state.cpuMark = 'O';
    state.boardCursor = 4;
    state.winLine = null;
  }

  function renderBoard() {
    cellEls.forEach(function (cell, idx) {
      cell.textContent = state.board[idx] || '';
      cell.className = 'cell';
      if (state.board[idx]) cell.classList.add('mark-' + state.board[idx].toLowerCase());
      if (idx === state.boardCursor && !state.overlay && !state.winLine) cell.classList.add('cursor');
      if (state.winLine && state.winLine.indexOf(idx) !== -1) cell.classList.add('win');
    });
    if (!turnEl) return;
    if (state.mode === 'pvp') {
      turnEl.textContent = 'Turn: ' + state.current;
    } else if (state.mode === 'cpu') {
      turnEl.textContent = (state.current === state.playerMark) ? 'Your Turn' : 'CPU Thinking\u2026';
    }
  }

  function onCellActivate(idx) {
    if (state.screen !== 'game' || state.overlay) return;
    if (state.mode === 'cpu' && state.current !== state.playerMark) return;
    placeMark(idx);
  }

  function placeMark(idx) {
    if (state.board[idx]) return;
    state.board[idx] = state.current;
    CP.beep(state.current === 'X' ? 660 : 440, 80, 'square');
    var result = AI.checkWinner(state.board);
    if (result) {
      finishGame(result);
      return;
    }
    state.current = (state.current === 'X') ? 'O' : 'X';
    renderBoard();
    if (state.mode === 'cpu' && state.current === state.cpuMark) {
      renderBoard();
      window.setTimeout(cpuMove, 450);
    }
  }

  function cpuMove() {
    if (state.screen !== 'game' || state.overlay) return;
    var move = AI.getCpuMove(state.board, state.cpuMark, state.playerMark, state.difficulty);
    if (move === null || move === undefined) return;
    state.boardCursor = move;
    placeMark(move);
  }

  function finishGame(result) {
    state.winLine = result.line;
    renderBoard();
    var stats = CP.loadStats();
    if (result.winner === 'draw') {
      gameoverTitle.textContent = 'Draw!';
      gameoverMessage.textContent = "It's a tie game.";
      stats.draws++;
      CP.beep(300, 200, 'sine');
    } else if (state.mode === 'cpu') {
      if (result.winner === state.playerMark) {
        gameoverTitle.textContent = 'You Win!';
        gameoverMessage.textContent = 'Great job beating the CPU.';
        stats.wins++;
        CP.beep(880, 250, 'sine');
      } else {
        gameoverTitle.textContent = 'CPU Wins';
        gameoverMessage.textContent = 'Better luck next time.';
        stats.losses++;
        CP.beep(200, 300, 'sawtooth');
      }
    } else {
      gameoverTitle.textContent = result.winner + ' Wins!';
      gameoverMessage.textContent = 'Player ' + result.winner + ' takes the round.';
      stats.pvp = (stats.pvp || 0) + 1;
      CP.beep(880, 250, 'sine');
    }
    CP.saveStats(stats);
    window.setTimeout(function () { pushOverlay('gameover'); }, 550);
  }

  // ---------------- Pause overlay ----------------
  function renderPauseMenu() {
    Array.prototype.slice.call(pauseMenu.children).forEach(function (li, idx) {
      li.classList.toggle('focused', idx === state.pauseIndex);
    });
  }
  function onPauseSelect(action) {
    if (action === 'resume') {
      history.back();
    } else if (action === 'restart') {
      startGame(state.mode, state.difficulty);
      history.back();
    } else if (action === 'settings') {
      window.location.href = 'settings.html';
    } else if (action === 'help') {
      window.location.href = 'help.html';
    } else if (action === 'about') {
      window.location.href = 'about.html';
    } else if (action === 'menu') {
      window.location.href = 'index.html';
    }
  }

  // ---------------- Game over overlay ----------------
  function renderGameoverMenu() {
    Array.prototype.slice.call(gameoverMenu.children).forEach(function (li, idx) {
      li.classList.toggle('focused', idx === state.gameoverIndex);
    });
  }
  function onGameoverSelect(action) {
    if (action === 'again') {
      startGame(state.mode, state.difficulty);
      history.back();
    } else if (action === 'menu') {
      window.location.href = 'index.html';
    }
  }

  // ---------------- Input handling (T9 D-pad + arrows) ----------------
  var UP = ['2', 'ArrowUp'];
  var DOWN = ['8', 'ArrowDown'];
  var LEFT = ['4', 'ArrowLeft'];
  var RIGHT = ['6', 'ArrowRight'];
  var SELECT = ['5', 'Enter'];
  var PAUSE_KEY = ['0'];

  function cycle(current, delta, count) {
    return (current + delta + count) % count;
  }

  window.addEventListener('keydown', function (e) {
    if (CP.isLSK(e)) {
      e.preventDefault();
      handleLSK();
      return;
    }
    // RSK intentionally left unintercepted here (native back/close applies)

    if (UP.indexOf(e.key) !== -1) { e.preventDefault(); handleDirection('up'); return; }
    if (DOWN.indexOf(e.key) !== -1) { e.preventDefault(); handleDirection('down'); return; }
    if (LEFT.indexOf(e.key) !== -1) { e.preventDefault(); handleDirection('left'); return; }
    if (RIGHT.indexOf(e.key) !== -1) { e.preventDefault(); handleDirection('right'); return; }
    if (SELECT.indexOf(e.key) !== -1) { e.preventDefault(); handleSelect(); return; }
    if (PAUSE_KEY.indexOf(e.key) !== -1) {
      e.preventDefault();
      if (state.screen === 'game' && !state.overlay) pushOverlay('pause');
      return;
    }
  });

  function handleLSK() {
    if (state.overlay) return; // blank/no-op while an overlay is open
    if (state.screen === 'game') { pushOverlay('pause'); return; }
    // no-op on title/difficulty screens
  }

  function handleDirection(dir) {
    if (state.overlay === 'pause') {
      if (dir === 'up' || dir === 'left') { state.pauseIndex = cycle(state.pauseIndex, -1, pauseItems.length); renderPauseMenu(); }
      if (dir === 'down' || dir === 'right') { state.pauseIndex = cycle(state.pauseIndex, 1, pauseItems.length); renderPauseMenu(); }
      return;
    }
    if (state.overlay === 'gameover') {
      if (dir === 'up' || dir === 'left') { state.gameoverIndex = cycle(state.gameoverIndex, -1, gameoverItems.length); renderGameoverMenu(); }
      if (dir === 'down' || dir === 'right') { state.gameoverIndex = cycle(state.gameoverIndex, 1, gameoverItems.length); renderGameoverMenu(); }
      return;
    }
    if (state.screen === 'title') {
      if (dir === 'up' || dir === 'left') { state.titleIndex = cycle(state.titleIndex, -1, titleItems.length); renderTitleMenu(); }
      if (dir === 'down' || dir === 'right') { state.titleIndex = cycle(state.titleIndex, 1, titleItems.length); renderTitleMenu(); }
      return;
    }
    if (state.screen === 'difficulty') {
      if (dir === 'up' || dir === 'left') { state.difficultyIndex = cycle(state.difficultyIndex, -1, difficultyItems.length); renderDifficultyMenu(); }
      if (dir === 'down' || dir === 'right') { state.difficultyIndex = cycle(state.difficultyIndex, 1, difficultyItems.length); renderDifficultyMenu(); }
      return;
    }
    if (state.screen === 'game' && !state.overlay) {
      if (state.mode === 'cpu' && state.current !== state.playerMark) return;
      var c = state.boardCursor;
      var row = Math.floor(c / 3), col = c % 3;
      if (dir === 'up') c = ((row + 2) % 3) * 3 + col;
      if (dir === 'down') c = ((row + 1) % 3) * 3 + col;
      if (dir === 'left') c = row * 3 + ((col + 2) % 3);
      if (dir === 'right') c = row * 3 + ((col + 1) % 3);
      state.boardCursor = c;
      renderBoard();
    }
  }

  function handleSelect() {
    if (state.overlay === 'pause') { onPauseSelect(pauseItems[state.pauseIndex]); return; }
    if (state.overlay === 'gameover') { onGameoverSelect(gameoverItems[state.gameoverIndex]); return; }
    if (state.screen === 'title') { onTitleSelect(titleItems[state.titleIndex]); return; }
    if (state.screen === 'difficulty') { onDifficultySelect(difficultyItems[state.difficultyIndex]); return; }
    if (state.screen === 'game' && !state.overlay) { onCellActivate(state.boardCursor); return; }
  }

  // ---------------- Init ----------------
  setScreen('title');
})();
