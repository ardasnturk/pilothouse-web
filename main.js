// Pilothouse website — language, theme, latest DMG, TestFlight QR, copy buttons.
(function () {
  'use strict';

  // ---- Configuration -------------------------------------------------------
  // Public repository that hosts this site and the release DMGs.
  var REPO = 'ardasnturk/pilothouse-web';
  // Public TestFlight link. Replace the placeholder once the beta group is live.
  var TESTFLIGHT_URL = 'https://testflight.apple.com/join/XXXXXXXX';
  // --------------------------------------------------------------------------

  var TESTFLIGHT_READY = !/X{8}$/.test(TESTFLIGHT_URL);
  var RELEASES_URL = 'https://github.com/' + REPO + '/releases';

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // ---- Language ------------------------------------------------------------
  var dynamicEn = { 'dl.mac.version': 'Latest: {v}', 'copied': 'Copied' };
  var en = {};
  var lang = 'en';

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    en[el.getAttribute('data-i18n')] = el.innerHTML;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
    el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
      var p = pair.split(':');
      en[p[1]] = el.getAttribute(p[0]);
    });
  });
  en['meta.title'] = document.title;
  en['meta.description'] = document.querySelector('meta[name="description"]').content;
  Object.keys(dynamicEn).forEach(function (k) { en[k] = dynamicEn[k]; });

  function t(key) {
    var dict = lang === 'en' ? en : (window.PH_STRINGS[lang] || {});
    return dict[key] != null ? dict[key] : en[key];
  }

  function applyLang(next) {
    lang = window.PH_STRINGS[next] || next === 'en' ? next : 'en';
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        el.setAttribute(p[0], t(p[1]));
      });
    });
    document.title = t('meta.title');
    document.querySelector('meta[name="description"]').content = t('meta.description');
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
    renderVersion();
  }

  function initialLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'tr') return q;
    var saved = store.get('ph-lang');
    if (saved === 'en' || saved === 'tr') return saved;
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    return /^tr\b/i.test(nav) ? 'tr' : 'en';
  }

  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = b.getAttribute('data-lang');
      store.set('ph-lang', l);
      // Keep a ?lang= in the address bar in step, so reloads and shared links match.
      var url = new URL(location.href);
      if (url.searchParams.has('lang')) { url.searchParams.set('lang', l); history.replaceState(null, '', url); }
      applyLang(l);
    });
  });

  // ---- Theme ---------------------------------------------------------------
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  function effectiveTheme() { return root.dataset.theme || (media.matches ? 'dark' : 'light'); }
  document.getElementById('theme-toggle').addEventListener('click', function () {
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    // Going back to what the system prefers clears the override.
    if ((next === 'dark') === media.matches) { delete root.dataset.theme; store.set('ph-theme', ''); }
    else { root.dataset.theme = next; store.set('ph-theme', next); }
  });

  // ---- Repository links & Homebrew ----------------------------------------
  document.getElementById('releases-link').href = RELEASES_URL;
  document.getElementById('issues-link').href = 'https://github.com/' + REPO + '/issues';
  document.getElementById('brew-cmd').textContent =
    'brew tap ' + REPO.split('/')[0] + '/pilothouse https://github.com/' + REPO + '\n' +
    'brew install --cask pilothouse';

  // ---- Latest DMG ----------------------------------------------------------
  var dmgLink = document.getElementById('dmg-link');
  var heroMac = document.querySelector('.hero .btn-primary');
  var latestVersion = null;
  dmgLink.href = RELEASES_URL + '/latest';

  function renderVersion() {
    var el = document.getElementById('dmg-version');
    el.textContent = latestVersion ? t('dl.mac.version').replace('{v}', latestVersion) : '';
  }

  if (window.fetch) {
    fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rel) {
        var dmg = (rel.assets || []).filter(function (a) { return /\.dmg$/i.test(a.name); })[0];
        if (!dmg) return;
        dmgLink.href = dmg.browser_download_url;
        heroMac.href = dmg.browser_download_url;
        latestVersion = (rel.tag_name || '').replace(/^v/, '');
        renderVersion();
      })
      .catch(function () { /* keep the releases-page fallback */ });
  }

  // ---- TestFlight ----------------------------------------------------------
  var tfLink = document.getElementById('tf-link');
  var qrBox = document.getElementById('tf-qr');
  if (TESTFLIGHT_READY) {
    tfLink.href = TESTFLIGHT_URL;
  } else {
    tfLink.hidden = true;
    document.getElementById('tf-soon').hidden = false;
    qrBox.classList.add('is-placeholder');
  }
  if (window.QRCode) {
    new window.QRCode(qrBox, {
      text: TESTFLIGHT_URL, width: 256, height: 256,
      colorDark: '#0d1b1e', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M
    });
    // The library adds a title tooltip; the container already has an aria-label.
    qrBox.removeAttribute('title');
    var img = qrBox.querySelector('img');
    if (img) img.alt = '';
  }

  // ---- Copy buttons --------------------------------------------------------
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = document.getElementById(btn.getAttribute('data-copy')).textContent;
      var done = function () {
        btn.textContent = t('copied');
        setTimeout(function () { btn.textContent = t('copy'); }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });

  applyLang(initialLang());
})();
