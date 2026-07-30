/*
 * ai.js - TicTacToe rules + CPU opponent logic
 * Difficulty modes:
 *   easy   - mostly random moves, occasionally smart
 *   medium - takes winning moves, blocks opponent, prefers center/corners
 *   hard   - unbeatable minimax with alpha-beta style scoring
 */
(function (global) {
  'use strict';

  var WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  function checkWinner(board) {
    for (var i = 0; i < WIN_LINES.length; i++) {
      var line = WIN_LINES[i];
      var a = line[0], b = line[1], c = line[2];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: line };
      }
    }
    var full = true;
    for (var j = 0; j < 9; j++) { if (!board[j]) { full = false; break; } }
    if (full) return { winner: 'draw', line: null };
    return null;
  }

  function emptyIndices(board) {
    var out = [];
    for (var i = 0; i < 9; i++) { if (!board[i]) out.push(i); }
    return out;
  }

  function randomMove(board) {
    var options = emptyIndices(board);
    return options[Math.floor(Math.random() * options.length)];
  }

  function findWinningMove(board, mark) {
    var options = emptyIndices(board);
    for (var i = 0; i < options.length; i++) {
      var idx = options[i];
      var copy = board.slice();
      copy[idx] = mark;
      var result = checkWinner(copy);
      if (result && result.winner === mark) return idx;
    }
    return null;
  }

  function minimax(board, mark, opponent, depth, isMaximizing) {
    var result = checkWinner(board);
    if (result) {
      if (result.winner === mark) return 10 - depth;
      if (result.winner === opponent) return depth - 10;
      return 0;
    }
    var options = emptyIndices(board);
    var scores = [];
    for (var i = 0; i < options.length; i++) {
      var idx = options[i];
      var copy = board.slice();
      copy[idx] = isMaximizing ? mark : opponent;
      scores.push(minimax(copy, mark, opponent, depth + 1, !isMaximizing));
    }
    if (isMaximizing) return Math.max.apply(null, scores);
    return Math.min.apply(null, scores);
  }

  function bestMove(board, mark, opponent) {
    var options = emptyIndices(board);
    var best = -Infinity;
    var move = options[0];
    for (var i = 0; i < options.length; i++) {
      var idx = options[i];
      var copy = board.slice();
      copy[idx] = mark;
      var score = minimax(copy, mark, opponent, 0, false);
      if (score > best) {
        best = score;
        move = idx;
      }
    }
    return move;
  }

  function getCpuMove(board, cpuMark, playerMark, difficulty) {
    var options = emptyIndices(board);
    if (options.length === 0) return null;

    if (difficulty === 'easy') {
      if (Math.random() < 0.8) return randomMove(board);
      return bestMove(board, cpuMark, playerMark);
    }

    if (difficulty === 'medium') {
      var winMove = findWinningMove(board, cpuMark);
      if (winMove !== null) return winMove;
      var blockMove = findWinningMove(board, playerMark);
      if (blockMove !== null) return blockMove;
      if (!board[4]) return 4;
      var corners = [0, 2, 6, 8].filter(function (i) { return !board[i]; });
      if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
      return randomMove(board);
    }

    // hard
    return bestMove(board, cpuMark, playerMark);
  }

  global.TicTacToeAI = {
    WIN_LINES: WIN_LINES,
    checkWinner: checkWinner,
    emptyIndices: emptyIndices,
    getCpuMove: getCpuMove
  };
})(window);
