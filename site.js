(function () {
  'use strict';

  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');
  var label = document.querySelector('.theme-label');
  var themes = ['system', 'light', 'dark'];

  function renderTheme() {
    var theme = root.dataset.theme || 'system';
    label.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
  }

  toggle.addEventListener('click', function () {
    var current = themes.indexOf(root.dataset.theme || 'system');
    var next = themes[(current + 1) % themes.length];
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
    renderTheme();
  });

  document.querySelectorAll('[data-year]').forEach(function (year) {
    year.textContent = new Date().getFullYear();
  });

  renderTheme();
}());
