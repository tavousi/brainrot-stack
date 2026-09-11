/* Brainrot Stack - bootstrap (plain script, file:// safe) */
(function () {
  'use strict';

  function ensureMatter(done) {
    if (window.Matter) return done();
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js';
    s.onload = function () { done(); };
    s.onerror = function () {
      document.getElementById('loadError').style.display = 'block';
      document.getElementById('loadError').textContent =
        'Could not load the physics engine (vendor/matter.min.js missing and CDN unreachable). Check your connection and reload.';
    };
    document.head.appendChild(s);
  }

  function boot() {
    var canvas = document.getElementById('stage');
    var loading = document.getElementById('loading');
    ensureMatter(function () {
      window.BrainrotAssets.loadAll().then(function (sprites) {
        if (loading) loading.style.display = 'none';
        var game = new window.BrainrotGame.Game(canvas, sprites);
        window.__game = game;

        // input: drag to move, tap piece to rotate
        new window.BrainrotInput.InputController(canvas, {
          isAiming: function () { return game.isAiming() && game.state !== 'MENU'; },
          onDrag: function (x) { game.movePreview(x); },
          onTap: function (x, y) { game.tryTapRotate(x, y); }
        });

        document.getElementById('dropBtn').addEventListener('click', function () { game.drop(); });
        document.getElementById('rotateBtn').addEventListener('click', function () { game.rotatePreview(); });

        // menu
        document.getElementById('playBtn').addEventListener('click', function () {
          if (window.BrainrotAudio) {
            window.BrainrotAudio.init();
            window.BrainrotAudio.startAmbient();
          }
          document.getElementById('menu').classList.remove('show');
          game.hideGameOver();
          game.startMatch();
        });
        document.getElementById('rematchBtn').addEventListener('click', function () {
          game.hideGameOver();
          game.startMatch();
        });

        // tutorial modal (slides come from the active language)
        var si = 0;
        var tut = document.getElementById('tutorial');
        function slides() { return window.BrainrotLang.slides(); }
        function renderSlide() {
          var list = slides();
          if (si >= list.length) si = list.length - 1;
          document.getElementById('tutStep').textContent = list[si].t;
          document.getElementById('tutText').textContent = list[si].d;
          document.getElementById('tutPrev').disabled = (si === 0);
          document.getElementById('tutNext').textContent = (si === list.length - 1) ? window.BrainrotLang.t('done') : window.BrainrotLang.t('next');
        }
        document.getElementById('rulesBtn').addEventListener('click', function () { si = 0; renderSlide(); tut.classList.add('show'); });
        document.getElementById('tutPrev').addEventListener('click', function () { if (si > 0) { si--; renderSlide(); } });
        document.getElementById('tutNext').addEventListener('click', function () {
          if (si < slides().length - 1) { si++; renderSlide(); } else tut.classList.remove('show');
        });
        document.getElementById('tutClose').addEventListener('click', function () { tut.classList.remove('show'); });

        // sound mute toggle (works before and during the match)
        var muteBtn = document.getElementById('muteBtn');
        if (muteBtn) muteBtn.addEventListener('click', function () {
          if (!window.BrainrotAudio) return;
          window.BrainrotAudio.init();
          var m = window.BrainrotAudio.toggle();
          muteBtn.innerHTML = m ? '&#128263;' : '&#128266;';
        });

        // language toggle EN <-> FA (+ RTL layout + live UI refresh)
        // NOTE: the start menu is always bilingual (EN + FA shown together).
        function applyLangUI() {
          var L = window.BrainrotLang;
          document.getElementById('howtoTitle').textContent = L.t('howto');
          document.getElementById('tutPrev').textContent = L.t('back');
          document.getElementById('tutClose').textContent = L.t('close');
          document.getElementById('loading').innerHTML = L.t('loading');
          document.getElementById('rulesBtn').title = L.t('rules');
          document.getElementById('muteBtn').title = L.t('sound');
          document.getElementById('rotateBtn').title = L.t('rotate');
          var lbl = (L.get() === 'en') ? 'فارسی' : 'EN';
          var lb = document.getElementById('langBtn');
          if (lb) lb.textContent = lbl;
          renderSlide();
          game.updateHud();
          if (game.state === 'GAMEOVER') game.showGameOver();
        }
        function toggleLang() {
          window.BrainrotLang.toggle();
          applyLangUI();
        }
        document.getElementById('langBtn').addEventListener('click', toggleLang);
        var lbm = document.getElementById('langBtnMenu');
        if (lbm) lbm.addEventListener('click', toggleLang);

        game.setState('MENU');
        applyLangUI();
        document.getElementById('menu').classList.add('show');
        game.run();
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
