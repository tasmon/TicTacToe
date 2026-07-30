/*
 * settings.js - Settings secondary page logic.
 * RSK (SoftRight/F2/Backspace/Escape) always returns to index.html here,
 * per the CloudPhone secondary-page navigation rule.
 */
(function () {
  'use strict';

  var CP = window.CloudPhone;
  CP.initSecondaryPageRSK('index.html');

  var settings = CP.loadSettings();
  CP.applyTheme(settings.theme);

  var items = ['theme', 'difficulty', 'sound', 'reset'];
  var focusedIndex = 0;
  var confirmOpen = false;
  var confirmIndex = 0;

  var menuEl = document.getElementById('settings-menu');
  var menuItems = Array.prototype.slice.call(menuEl.children);
  var overlayConfirm = document.getElementById('overlay-confirm');
  var confirmMenu = document.getElementById('confirm-menu');
  var confirmItems = Array.prototype.slice.call(confirmMenu.children);

  var valueTheme = document.getElementById('value-theme');
  var valueDifficulty = document.getElementById('value-difficulty');
  var valueSound = document.getElementById('value-sound');
  var valueStats = document.getElementById('value-stats');

  function refreshValues() {
    valueTheme.textContent = CP.THEME_LABELS[settings.theme];
    valueDifficulty.textContent = CP.DIFFICULTY_LABELS[settings.difficulty];
    valueSound.textContent = settings.sound ? 'On' : 'Off';
    var stats = CP.loadStats();
    valueStats.textContent = 'W' + stats.wins + '/L' + stats.losses + '/D' + stats.draws;
  }

  function renderFocus() {
    menuItems.forEach(function (li, idx) {
      li.classList.toggle('focused', idx === focusedIndex && !confirmOpen);
    });
  }

  function renderConfirmFocus() {
    confirmItems.forEach(function (li, idx) {
      li.classList.toggle('focused', idx === confirmIndex);
    });
  }

  function cycleValue(list, current) {
    var idx = list.indexOf(current);
    return list[(idx + 1) % list.length];
  }

  function activate(key) {
    if (key === 'theme') {
      settings.theme = cycleValue(CP.THEMES, settings.theme);
      CP.saveSetting('theme', settings.theme);
      CP.applyTheme(settings.theme);
    } else if (key === 'difficulty') {
      settings.difficulty = cycleValue(CP.DIFFICULTIES, settings.difficulty);
      CP.saveSetting('difficulty', settings.difficulty);
    } else if (key === 'sound') {
      settings.sound = !settings.sound;
      CP.saveSetting('sound', settings.sound);
      if (settings.sound) CP.beep(660, 90, 'square');
    } else if (key === 'reset') {
      confirmOpen = true;
      confirmIndex = 1; // default focus on Cancel to avoid accidental resets
      overlayConfirm.hidden = false;
      renderConfirmFocus();
      renderFocus();
      return;
    }
    refreshValues();
  }

  menuItems.forEach(function (li, idx) {
    li.addEventListener('click', function () { focusedIndex = idx; renderFocus(); activate(items[idx]); });
  });
  confirmItems.forEach(function (li, idx) {
    li.addEventListener('click', function () { onConfirmSelect(idx === 0 ? 'yes' : 'no'); });
  });

  function onConfirmSelect(action) {
    if (action === 'yes') {
      CP.resetStats();
      refreshValues();
    }
    confirmOpen = false;
    overlayConfirm.hidden = true;
    renderFocus();
  }

  window.addEventListener('keydown', function (e) {
    if (CP.isLSK(e)) { e.preventDefault(); return; } // blank on this page

    var UP = e.key === '2' || e.key === 'ArrowUp';
    var DOWN = e.key === '8' || e.key === 'ArrowDown';
    var SELECT = e.key === '5' || e.key === 'Enter';

    if (confirmOpen) {
      if (UP || DOWN) {
        e.preventDefault();
        confirmIndex = (confirmIndex + 1) % confirmItems.length;
        renderConfirmFocus();
      } else if (SELECT) {
        e.preventDefault();
        onConfirmSelect(confirmIndex === 0 ? 'yes' : 'no');
      }
      return;
    }

    if (UP) { e.preventDefault(); focusedIndex = (focusedIndex - 1 + items.length) % items.length; renderFocus(); }
    else if (DOWN) { e.preventDefault(); focusedIndex = (focusedIndex + 1) % items.length; renderFocus(); }
    else if (SELECT) { e.preventDefault(); activate(items[focusedIndex]); }
  });

  refreshValues();
  renderFocus();
})();
