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
  var profilePhoto = profile && profile.querySelector('.profile-photo');
  var profileTitle = profile && profile.querySelector('.profile-title');
  var profileMeta = profile && profile.querySelector('.profile-meta');
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
      if (profileTitle)
        profileTitle.removeAttribute('inert');
      if (profileMeta)
        profileMeta.removeAttribute('inert');
    }
  }

  function updateCompactProfile() {
    if (!header || !mobileProfile.matches)
      return;

    var progress = Math.min(1, Math.max(0, window.scrollY / profileScrollRange));
    var remaining = 1 - progress;
    var titleHeight = profileTitle ? profileTitle.scrollHeight : 0;
    var metaHeight = profileMeta ? profileMeta.scrollHeight : 0;

    header.style.setProperty('--profile-photo-column', (5 * remaining) + 'rem');
    header.style.setProperty('--profile-photo-size', (5 * remaining) + 'rem');
    header.style.setProperty('--profile-card-gap', (1 * remaining) + 'rem');
    header.style.setProperty('--profile-detail-opacity', String(remaining));
    header.style.setProperty('--profile-title-height', (titleHeight * remaining) + 'px');
    header.style.setProperty('--profile-title-margin', (0.35 * remaining) + 'rem');
    header.style.setProperty('--profile-meta-height', (metaHeight * remaining) + 'px');
    header.style.setProperty('--profile-meta-margin', (0.8 * remaining) + 'rem');
    header.classList.toggle('is-compact', progress >= 0.995);
    if (profileTitle)
      profileTitle.toggleAttribute('inert', progress >= 0.995);
    if (profileMeta)
      profileMeta.toggleAttribute('inert', progress >= 0.995);
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
