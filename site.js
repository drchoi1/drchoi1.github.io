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
  var compactName = document.querySelector('.site-name');
  var profileScrollRange = 180;
  var profileFramePending = false;

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
      profile.removeAttribute('inert');
      profile.removeAttribute('aria-hidden');
    }
  }

  function updateCompactProfile() {
    if (!header || !mobileProfile.matches)
      return;

    var progress = Math.min(1, Math.max(0, window.scrollY / profileScrollRange));
    var expandedHeight = profile ? profile.scrollHeight : 0;
    var nameWidth = compactName ? compactName.scrollWidth : 0;

    header.style.setProperty('--profile-max-height', (expandedHeight * (1 - progress)) + 'px');
    header.style.setProperty('--profile-opacity', String(1 - progress));
    header.style.setProperty('--compact-name-opacity', String(progress));
    header.style.setProperty('--compact-name-width', (nameWidth * progress) + 'px');
    header.classList.toggle('is-compact', progress >= 0.995);
    profile.toggleAttribute('inert', progress >= 0.995);
    profile.setAttribute('aria-hidden', progress >= 0.995 ? 'true' : 'false');
  }

  function requestCompactProfileUpdate() {
    if (profileFramePending)
      return;

    profileFramePending = true;
    window.requestAnimationFrame(function () {
      updateCompactProfile();
      profileFramePending = false;
    });
  }

  window.addEventListener('scroll', requestCompactProfileUpdate, { passive: true });
  window.addEventListener('resize', function () {
    updateProfilePosition();
    updateCompactProfile();
  });

  updateProfilePosition();
  updateCompactProfile();
  renderTheme();
}());
