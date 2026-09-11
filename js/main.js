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
          document.getElementById('menu').classList.remove('show');
          game.hideGameOver();
          game.startMatch();
        });
        document.getElementById('rematchBtn').addEventListener('click', function () {
          game.hideGameOver();
          game.startMatch();
        });

        // tutorial modal
        var slides = [
          { t: '1/4 \u2014 DRAG', d: 'Drag left & right anywhere to aim the falling brainrot over the green platform.' },
          { t: '2/4 \u2014 ROTATE', d: 'Tap the brainrot (or press \u27F3) to rotate it 45\u00B0 and find the best landing angle.' },
          { t: '3/4 \u2014 DROP', d: 'Hit the red DROP button to release it. Then physics takes over!' },
          { t: '4/4 \u2014 SURVIVE', d: 'Players alternate turns and the board flips to face each player. If ANY brainrot falls past the red line on your turn, you LOSE.' }
        ];
        var si = 0;
        var tut = document.getElementById('tutorial');
        function renderSlide() {
          document.getElementById('tutStep').textContent = slides[si].t;
          document.getElementById('tutText').textContent = slides[si].d;
          document.getElementById('tutPrev').disabled = (si === 0);
          document.getElementById('tutNext').textContent = (si === slides.length - 1) ? 'DONE' : 'NEXT';
        }
        document.getElementById('rulesBtn').addEventListener('click', function () { si = 0; renderSlide(); tut.classList.add('show'); });
        document.getElementById('tutPrev').addEventListener('click', function () { if (si > 0) { si--; renderSlide(); } });
        document.getElementById('tutNext').addEventListener('click', function () {
          if (si < slides.length - 1) { si++; renderSlide(); } else tut.classList.remove('show');
        });
        document.getElementById('tutClose').addEventListener('click', function () { tut.classList.remove('show'); });

        game.setState('MENU');
        document.getElementById('menu').classList.add('show');
        game.run();
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
