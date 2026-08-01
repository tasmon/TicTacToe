/*
 * common.js - Shared CloudPhone platform helpers for TicTacToe
 * Used by: index.html, settings.html, help.html, about.html
 *
 * Key facts encoded here (per CloudPhone dev notes):
 *  - LSK (left softkey) fires as 'Escape' on real hardware. List 'Escape'
 *    first, keep 'SoftLeft' / 'MenuKey' / 'F1' as emulator fallbacks.
 *  - RSK (right softkey) is NOT a normal keyboard event on the home/main
 *    page - it must be left unintercepted there. On secondary pages
 *    (reached via a full navigation), RSK must be handled manually with a
 *    multi-alias check that redirects back to index.html.
 *  - alert()/confirm()/prompt() are unavailable - always use custom overlays.
 */
(function (global) {
  'use strict';

  var LSK_KEYS = ['Escape', 'SoftLeft', 'MenuKey', 'F1'];
  var RSK_KEYS = ['SoftRight', 'F2', 'Backspace', 'Escape'];

  function isLSK(e) { return LSK_KEYS.indexOf(e.key) !== -1; }
  function isRSK(e) { return RSK_KEYS.indexOf(e.key) !== -1; }

  var STORAGE_PREFIX = 'tictactoe_';
  var THEMES = ['classic', 'midnight', 'retro', 'ocean'];
  var THEME_LABELS = { classic: 'Classic', midnight: 'Midnight', retro: 'Retro', ocean: 'Ocean' };
  var DIFFICULTIES = ['easy', 'medium', 'hard'];
  var DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  var GRID_SIZES = [3, 4, 5];
  var GRID_SIZE_LABELS = { 3: '3x3', 4: '4x4', 5: '5x5' };

  function loadSettings() {
    var theme = localStorage.getItem(STORAGE_PREFIX + 'theme') || 'classic';
    var difficulty = localStorage.getItem(STORAGE_PREFIX + 'difficulty') || 'medium';
    var gridSize = parseInt(localStorage.getItem(STORAGE_PREFIX + 'gridSize'), 10);
    if (THEMES.indexOf(theme) === -1) theme = 'classic';
    if (DIFFICULTIES.indexOf(difficulty) === -1) difficulty = 'medium';
    if (GRID_SIZES.indexOf(gridSize) === -1) gridSize = 3;
    return { theme: theme, difficulty: difficulty, gridSize: gridSize };
  }

  function saveSetting(key, value) {
    var v = (typeof value === 'boolean') ? (value ? '1' : '0') : value;
    try { localStorage.setItem(STORAGE_PREFIX + key, v); } catch (e) { /* storage unavailable */ }
  }

  function loadStats() {
    try {
      var raw = localStorage.getItem(STORAGE_PREFIX + 'stats');
      var parsed = raw ? JSON.parse(raw) : null;
      if (!parsed) return { wins: 0, losses: 0, draws: 0, pvp: 0 };
      return {
        wins: parsed.wins || 0,
        losses: parsed.losses || 0,
        draws: parsed.draws || 0,
        pvp: parsed.pvp || 0
      };
    } catch (e) {
      return { wins: 0, losses: 0, draws: 0, pvp: 0 };
    }
  }

  function saveStats(stats) {
    try { localStorage.setItem(STORAGE_PREFIX + 'stats', JSON.stringify(stats)); } catch (e) { /* ignore */ }
  }

  function resetStats() {
    saveStats({ wins: 0, losses: 0, draws: 0, pvp: 0 });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // ---- Focus recovery: keep receiving key events after overlays/pickers ----
  function initFocusRecovery() {
    global.addEventListener('load', function () { global.focus(); });
    global.addEventListener('pageshow', function () { global.focus(); });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) global.focus();
    });
    document.body.addEventListener('click', function () { global.focus(); });
  }

  // ---- RSK handling for secondary (full-navigation) pages ----
  function initSecondaryPageRSK(targetUrl) {
    targetUrl = targetUrl || 'index.html';
    global.addEventListener('keydown', function (e) {
      if (isRSK(e)) {
        e.preventDefault();
        global.location.href = targetUrl;
      }
    });
    var rightKey = document.getElementById('softkey-right');
    if (rightKey) {
      rightKey.addEventListener('click', function () { global.location.href = targetUrl; });
    }
  }

  function setSoftkeyLabels(left, center, right) {
    var l = document.getElementById('softkey-left');
    var c = document.getElementById('softkey-center');
    var r = document.getElementById('softkey-right');
    if (l) l.textContent = left || '';
    if (c) c.textContent = center || '';
    if (r) r.textContent = right || '';
  }

  document.addEventListener('DOMContentLoaded', initFocusRecovery);

  global.CloudPhone = {
    isLSK: isLSK,
    isRSK: isRSK,
    THEMES: THEMES,
    THEME_LABELS: THEME_LABELS,
    DIFFICULTIES: DIFFICULTIES,
    DIFFICULTY_LABELS: DIFFICULTY_LABELS,
    GRID_SIZES: GRID_SIZES,
    GRID_SIZE_LABELS: GRID_SIZE_LABELS,
    loadSettings: loadSettings,
    saveSetting: saveSetting,
    loadStats: loadStats,
    saveStats: saveStats,
    resetStats: resetStats,
    applyTheme: applyTheme,
    initSecondaryPageRSK: initSecondaryPageRSK,
    setSoftkeyLabels: setSoftkeyLabels
  };
})(window);
