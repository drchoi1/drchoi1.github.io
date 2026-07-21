(function () {
  'use strict';

  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');
  var label = document.querySelector('.theme-label');
  var themes = ['system', 'light', 'dark'];
  var header = document.querySelector('.site-header');
  var nav = document.querySelector('.nav');
  var frame = document.querySelector('.site-frame');
  var profile = document.querySelector('.profile-bar');
  var main = frame && frame.querySelector('main');
  var mobileProfile = window.matchMedia('(max-width: 900px)');

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

  function updateProfilePosition() {
    if (!profile || !header || !frame || !main)
      return;

    if (mobileProfile.matches) {
      if (profile.parentNode !== header)
        header.insertBefore(profile, nav);
    } else {
      if (profile.parentNode !== frame)
        frame.insertBefore(profile, main);

      header.classList.remove('is-compact');
    }
  }

  function updateCompactProfile() {
    if (!header || !mobileProfile.matches)
      return;

    header.classList.toggle('is-compact', window.scrollY > 80);
  }

  window.addEventListener('scroll', updateCompactProfile, { passive: true });
  window.addEventListener('resize', function () {
    updateProfilePosition();
    updateCompactProfile();
  });

  updateProfilePosition();
  updateCompactProfile();
  renderTheme();
}());
