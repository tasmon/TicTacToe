/*
 * ai.js - TicTacToe rules + CPU opponent logic, generalized for 3x3/4x4/5x5.
 *
 * Win length scales with board size (classic 3-in-a-row on 3x3, 4-in-a-row
 * on 4x4/5x5 - otherwise a 5x5 board would take forever to fill for a win).
 *
 * Difficulty modes:
 *   easy   - mostly random moves, occasionally a positionally sound one
 *   medium - always takes a winning move / blocks an opponent's winning
 *            move, otherwise picks the best immediate (1-ply) position
 *   hard   - depth-limited alpha-beta search with a heuristic evaluator.
 *            On 3x3 the depth limit covers the whole game tree, so Hard
 *            is exact/unbeatable there. On 4x4/5x5 an exhaustive search
 *            is not computationally feasible, so Hard there is a strong
 *            lookahead AI rather than a mathematically perfect one.
 */
(function (global) {
  'use strict';

  // Win condition is always classic 3-in-a-row, regardless of board size.
  var SEARCH_DEPTH_BY_SIZE = { 3: 9, 4: 4, 5: 3 };

  function getWinLength(size) {
    return 3;
  }

  // ---- Win line generation (rows, columns, both diagonals), cached per size ----
  var linesCache = {};
  function getLines(size) {
    var winLength = getWinLength(size);
    var key = size + '_' + winLength;
    if (linesCache[key]) return linesCache[key];

    var lines = [];
    var r, c, k, line;

    // horizontal
    for (r = 0; r < size; r++) {
      for (c = 0; c <= size - winLength; c++) {
        line = [];
        for (k = 0; k < winLength; k++) line.push(r * size + (c + k));
        lines.push(line);
      }
    }
    // vertical
    for (c = 0; c < size; c++) {
      for (r = 0; r <= size - winLength; r++) {
        line = [];
        for (k = 0; k < winLength; k++) line.push((r + k) * size + c);
        lines.push(line);
      }
    }
    // diagonal down-right (\)
    for (r = 0; r <= size - winLength; r++) {
      for (c = 0; c <= size - winLength; c++) {
        line = [];
        for (k = 0; k < winLength; k++) line.push((r + k) * size + (c + k));
        lines.push(line);
      }
    }
    // diagonal down-left (/)
    for (r = 0; r <= size - winLength; r++) {
      for (c = winLength - 1; c < size; c++) {
        line = [];
        for (k = 0; k < winLength; k++) line.push((r + k) * size + (c - k));
        lines.push(line);
      }
    }

    linesCache[key] = lines;
    return lines;
  }

  function checkWinner(board, size) {
    size = size || Math.round(Math.sqrt(board.length));
    var lines = getLines(size);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var first = board[line[0]];
      if (!first) continue;
      var allMatch = true;
      for (var k = 1; k < line.length; k++) {
        if (board[line[k]] !== first) { allMatch = false; break; }
      }
      if (allMatch) return { winner: first, line: line };
    }
    var full = true;
    for (var j = 0; j < board.length; j++) { if (!board[j]) { full = false; break; } }
    if (full) return { winner: 'draw', line: null };
    return null;
  }

  function emptyIndices(board) {
    var out = [];
    for (var i = 0; i < board.length; i++) { if (!board[i]) out.push(i); }
    return out;
  }

  function randomMove(board) {
    var options = emptyIndices(board);
    return options[Math.floor(Math.random() * options.length)];
  }

  function findWinningMove(board, size, mark) {
    var options = emptyIndices(board);
    for (var i = 0; i < options.length; i++) {
      var idx = options[i];
      board[idx] = mark;
      var result = checkWinner(board, size);
      board[idx] = null;
      if (result && result.winner === mark) return idx;
    }
    return null;
  }

  // ---- Heuristic evaluation for depth-limited search & "medium" moves ----
  function evaluate(board, size, mark, opponent) {
    var lines = getLines(size);
    var score = 0;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var markCount = 0, oppCount = 0;
      for (var k = 0; k < line.length; k++) {
        var cell = board[line[k]];
        if (cell === mark) markCount++;
        else if (cell === opponent) oppCount++;
      }
      if (markCount > 0 && oppCount > 0) continue; // dead line, no potential
      if (markCount > 0) score += Math.pow(10, markCount);
      else if (oppCount > 0) score -= Math.pow(10, oppCount);
    }
    // small center-affinity bonus so ties break toward the middle
    var mid = (size - 1) / 2;
    for (var idx = 0; idx < board.length; idx++) {
      if (board[idx] === mark) {
        var r = Math.floor(idx / size), c = idx % size;
        score += (size - (Math.abs(r - mid) + Math.abs(c - mid))) * 0.1;
      }
    }
    return score;
  }

  function alphaBeta(board, size, mark, opponent, depth, maxDepth, alpha, beta, maximizing) {
    var result = checkWinner(board, size);
    if (result) {
      if (result.winner === mark) return 100000 - depth;
      if (result.winner === opponent) return depth - 100000;
      return 0;
    }
    if (depth >= maxDepth) return evaluate(board, size, mark, opponent);

    var options = emptyIndices(board);
    if (maximizing) {
      var value = -Infinity;
      for (var i = 0; i < options.length; i++) {
        var idx = options[i];
        board[idx] = mark;
        value = Math.max(value, alphaBeta(board, size, mark, opponent, depth + 1, maxDepth, alpha, beta, false));
        board[idx] = null;
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break;
      }
      return value;
    } else {
      var value2 = Infinity;
      for (var j = 0; j < options.length; j++) {
        var idx2 = options[j];
        board[idx2] = opponent;
        value2 = Math.min(value2, alphaBeta(board, size, mark, opponent, depth + 1, maxDepth, alpha, beta, true));
        board[idx2] = null;
        beta = Math.min(beta, value2);
        if (beta <= alpha) break;
      }
      return value2;
    }
  }

  function bestMoveSearch(board, size, mark, opponent) {
    // Immediate tactical shortcuts keep play sound even at shallow depth.
    var shortcut = findWinningMove(board, size, mark);
    if (shortcut !== null) return shortcut;
    shortcut = findWinningMove(board, size, opponent);
    if (shortcut !== null) return shortcut;

    var maxDepth = SEARCH_DEPTH_BY_SIZE[size] || 3;
    var options = emptyIndices(board);
    var best = -Infinity;
    var move = options[0];
    for (var i = 0; i < options.length; i++) {
      var idx = options[i];
      board[idx] = mark;
      var score = alphaBeta(board, size, mark, opponent, 1, maxDepth, -Infinity, Infinity, false);
      board[idx] = null;
      if (score > best) {
        best = score;
        move = idx;
      }
    }
    return move;
  }

  // Single-ply "place and evaluate" choice, used by medium/easy fallbacks.
  function bestImmediateMove(board, size, mark, opponent) {
    var options = emptyIndices(board);
    var scored = options.map(function (idx) {
      board[idx] = mark;
      var s = evaluate(board, size, mark, opponent);
      board[idx] = null;
      return { idx: idx, score: s };
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    // small randomness among near-best moves so medium isn't fully deterministic
    var top = scored.filter(function (s) { return s.score >= scored[0].score - 5; });
    return top[Math.floor(Math.random() * top.length)].idx;
  }

  function getCpuMove(board, cpuMark, playerMark, difficulty, size) {
    size = size || Math.round(Math.sqrt(board.length));
    var options = emptyIndices(board);
    if (options.length === 0) return null;

    if (difficulty === 'easy') {
      if (Math.random() < 0.8) return randomMove(board);
      return bestImmediateMove(board, size, cpuMark, playerMark);
    }

    if (difficulty === 'medium') {
      var winMove = findWinningMove(board, size, cpuMark);
      if (winMove !== null) return winMove;
      var blockMove = findWinningMove(board, size, playerMark);
      if (blockMove !== null) return blockMove;
      return bestImmediateMove(board, size, cpuMark, playerMark);
    }

    // hard
    return bestMoveSearch(board, size, cpuMark, playerMark);
  }

  global.TicTacToeAI = {
    getWinLength: getWinLength,
    getLines: getLines,
    checkWinner: checkWinner,
    emptyIndices: emptyIndices,
    getCpuMove: getCpuMove
  };
})(window);
