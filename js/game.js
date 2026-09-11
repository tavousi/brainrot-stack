/* Brainrot Stack - Game state machine + renderer ( window.BrainrotGame )
   States: MENU, AIMING, FALLING, SETTLING, GAMEOVER */
(function () {
  'use strict';

  var W = 480, H = 720;
  var PLATFORM_Y = 545, PLATFORM_W = 300, KILL_Y = 668;
  var PREVIEW_Y = 132;
  var ROT_STEP = Math.PI / 4; // 45 deg
  var REST_NEED = 50;         // frames below threshold
  var SETTLE_TIMEOUT = 11000; // ms fallback
  var MAX_STACK = 5;          // tower collapses if more brainrots stay stacked

  function Game(canvas, sprites) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sprites = sprites;
    this.physics = new window.BrainrotPhysics.PhysicsWorld({ width: W, height: H, platformY: PLATFORM_Y, platformW: PLATFORM_W });
    this.state = 'MENU';
    this.turn = 'blue'; // 'blue' | 'red'
    this.round = 1;
    this.preview = null;
    this.lastIndex = -1;
    this.restFrames = 0;
    this.dropTime = 0;
    this.winner = null; this.loser = null;
    this.overReason = 'fell';
    this.wobTick = 0;
    this.acc = 0; this.lastTs = 0;
    this.fitCanvas();
    window.addEventListener('resize', this.fitCanvas.bind(this));
    // landing knocks scaled by impact
    try {
      var self = this;
      window.Matter.Events.on(this.physics.engine, 'collisionStart', function (ev) {
        if (!window.BrainrotAudio) return;
        for (var i = 0; i < ev.pairs.length; i++) {
          var p = ev.pairs[i];
          if (p.bodyA.label !== 'piece' && p.bodyB.label !== 'piece') continue;
          var rv = Math.hypot(
            p.bodyA.velocity.x - p.bodyB.velocity.x,
            p.bodyA.velocity.y - p.bodyB.velocity.y
          );
          if (rv > 2.2) window.BrainrotAudio.thud(Math.min(1, rv / 10));
        }
      });
    } catch (e) {}
  }

  Game.prototype.fitCanvas = function () {
    var dpr = Math.min(2.5, window.devicePixelRatio || 1);
    this.canvas._logicalW = W; this.canvas._logicalH = H;
    this.canvas.width = Math.floor(W * dpr);
    this.canvas.height = Math.floor(H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  Game.prototype.pickSprite = function () {
    if (!this.sprites.length) return null;
    var i = Math.floor(Math.random() * this.sprites.length);
    if (this.sprites.length > 1) {
      var guard = 0;
      while (i === this.lastIndex && guard++ < 8) i = Math.floor(Math.random() * this.sprites.length);
    }
    this.lastIndex = i;
    return this.sprites[i];
  };

  Game.prototype.startMatch = function () {
    this.physics.reset();
    this.turn = 'blue';
    this.round = 1;
    this.winner = null; this.loser = null;
    this.overReason = 'fell';
    this.wobTick = 0;
    this.spawnPreview();
    this.setState('AIMING');
    this.updateHud();
  };

  Game.prototype.spawnPreview = function () {
    var sprite = this.pickSprite();
    var sc = (sprite && sprite.scale) || 1;
    var size = (70 + Math.random() * 16) * sc;
    this.preview = { sprite: sprite, x: W / 2, y: PREVIEW_Y, angle: 0, size: size, bornAt: performance.now() };
    this.restFrames = 0;
  };

  Game.prototype.setState = function (s) {
    this.state = s;
    document.body.setAttribute('data-state', s.toLowerCase());
    var dropBtn = document.getElementById('dropBtn');
    if (dropBtn) dropBtn.disabled = (s !== 'AIMING');
    this.updateHud();
  };

  Game.prototype.isAiming = function () { return this.state === 'AIMING'; };

  Game.prototype.movePreview = function (x) {
    if (!this.isAiming() || !this.preview) return;
    var m = this.preview.size / 2 + 8;
    this.preview.x = Math.max(m, Math.min(W - m, x));
  };

  Game.prototype.rotatePreview = function () {
    if (!this.isAiming() || !this.preview) return;
    this.preview.angle += ROT_STEP;
    if (window.BrainrotAudio) window.BrainrotAudio.rotate();
  };

  Game.prototype.tryTapRotate = function (x, y) {
    if (!this.isAiming() || !this.preview) return;
    var dx = x - this.preview.x, dy = y - this.preview.y;
    var r = this.preview.size * 0.75;
    if (dx * dx + dy * dy <= r * r) this.rotatePreview();
  };

  Game.prototype.drop = function () {
    if (!this.isAiming() || !this.preview) return;
    var p = this.preview;
    this.physics.createPiece(p.x, p.y, p.angle, p.sprite, p.size);
    this.preview = null;
    this.dropTime = performance.now();
    this.restFrames = 0;
    if (window.BrainrotAudio) window.BrainrotAudio.drop();
    this.setState('FALLING');
  };

  Game.prototype.nextTurn = function () {
    this.turn = (this.turn === 'blue') ? 'red' : 'blue';
    this.round++;
    this.spawnPreview();
    this.setState('AIMING');
  };

  Game.prototype.endGame = function (killedBody, reason) {
    void killedBody;
    this.loser = this.turn;
    this.winner = (this.turn === 'blue') ? 'red' : 'blue';
    this.overReason = reason || 'fell';
    if (window.BrainrotAudio) { window.BrainrotAudio.lose(); window.BrainrotAudio.win(); }
    this.setState('GAMEOVER');
    this.showGameOver();
  };

  // brainrots still on the platform (not past the kill line)
  Game.prototype.aliveCount = function () {
    var n = 0;
    for (var i = 0; i < this.physics.pieces.length; i++) {
      if (this.physics.pieces[i].position.y - 20 <= KILL_Y) n++;
    }
    return n;
  };

  Game.prototype.updateHud = function () {
    var L = window.BrainrotLang;
    var t = function (k, a) { return L ? L.t(k, a) : k; };
    var pill = document.getElementById('turnPill');
    if (pill) {
      pill.className = 'turn-pill ' + this.turn;
      pill.textContent = this.state === 'GAMEOVER' ? t('gameOver')
        : this.state === 'MENU' ? t('ready')
        : (this.turn === 'blue' ? t('blueTurn') : t('redTurn'));
    }
    var round = document.getElementById('roundLabel');
    if (round) round.textContent = t('round', this.round);
    var dropBtn = document.getElementById('dropBtn');
    if (dropBtn) {
      dropBtn.disabled = (this.state !== 'AIMING');
      dropBtn.classList.toggle('blue', this.turn === 'blue');
      dropBtn.textContent = t('drop');
    }
    var tw = document.getElementById('towerLabel');
    if (tw) this.refreshTower();
  };

  // live tower counter (throttled: only touches the DOM when the count changes)
  Game.prototype.refreshTower = function () {
    var tw = document.getElementById('towerLabel');
    if (!tw) return;
    var n = this.aliveCount();
    if (n === this._lastTowerN && this.state === this._lastTowerS) return;
    this._lastTowerN = n; this._lastTowerS = this.state;
    var L = window.BrainrotLang;
    tw.textContent = L ? L.t('tower', { n: n, m: MAX_STACK }) : ('TOWER ' + n + '/' + MAX_STACK);
    tw.classList.toggle('warn', n >= MAX_STACK && this.state !== 'GAMEOVER');
  };

  // Pass-and-play: flip the board so each player faces it from their own side.
  // RED plays at the bottom (normal), BLUE plays at the top (rotated 180).
  Game.prototype.applyOrientation = function () {
    var flipped = (this.turn === 'blue');
    var wrap = document.getElementById('stageWrap');
    if (wrap) wrap.classList.toggle('flipped', flipped);
    this.canvas._flipped = flipped;
  };

  Game.prototype.showGameOver = function () {
    var L = window.BrainrotLang;
    var t = function (k, a) { return L ? L.t(k, a) : k; };
    var ov = document.getElementById('gameover');
    var wTop = document.getElementById('winnerTop');
    var wBot = document.getElementById('winnerBottom');
    var wt = this.winner === 'blue' ? t('winBlue') : t('winRed');
    var lt = this.loser === 'blue' ? t('nameBlue') : t('nameRed');
    if (wTop) { wTop.className = 'go-half go-winner ' + this.winner; wTop.querySelector('.go-rank').textContent = t('rank1'); wTop.querySelector('.go-name').textContent = wt; }
    if (wBot) { wBot.className = 'go-half go-loser ' + this.loser; wBot.querySelector('.go-rank').textContent = t('rank2'); wBot.querySelector('.go-name').textContent = lt; }
    var rm = document.getElementById('rematchBtn');
    if (rm) rm.textContent = t('rematch');
    var gr = document.getElementById('goReason');
    if (gr) gr.textContent = t(this.overReason === 'overload' ? 'reasonOverload' : 'reasonFell');
    if (ov) ov.classList.add('show');
    this.updateHud();
  };

  Game.prototype.hideGameOver = function () {
    var ov = document.getElementById('gameover');
    if (ov) ov.classList.remove('show');
  };

  // ---- main loop ----
  Game.prototype.frame = function (ts) {
    if (!this.lastTs) this.lastTs = ts;
    var dt = Math.min(50, ts - this.lastTs);
    this.lastTs = ts;
    if (this.state === 'FALLING' || this.state === 'SETTLING') {
      this.acc += dt;
      var steps = 0;
      while (this.acc >= 1000 / 60 && steps < 3) {
        this.physics.step(1000 / 60);
        this.acc -= 1000 / 60;
        steps++;
        var killed = this.physics.firstKilled(KILL_Y);
        if (killed) { this.endGame(killed); break; }
      }
      if (this.state === 'FALLING' || this.state === 'SETTLING') {
        // overloaded tower wobbles: random nudges while 5+ are stacked
        if (this.aliveCount() >= MAX_STACK) {
          this.wobTick++;
          if (this.wobTick % 25 === 0 && this.physics.pieces.length) {
            var target = this.physics.pieces[Math.floor(Math.random() * this.physics.pieces.length)];
            try {
              window.Matter.Body.applyForce(target, target.position, {
                x: (Math.random() - 0.5) * 0.003 * target.mass,
                y: -0.0006 * target.mass
              });
            } catch (e) {}
          }
        }
        if (this.physics.allAtRest()) {
          this.restFrames++;
          if (this.state === 'FALLING' && this.restFrames > 10) this.setState('SETTLING');
          if (this.restFrames >= REST_NEED) {
            if (this.aliveCount() > MAX_STACK) this.endGame(null, 'overload');
            else this.nextTurn();
          }
        } else {
          this.restFrames = 0;
          if (this.state === 'FALLING') this.setState('SETTLING');
        }
        if (performance.now() - this.dropTime > SETTLE_TIMEOUT) {
          var k2 = this.physics.firstKilled(KILL_Y);
          if (k2) this.endGame(k2);
          else if (this.aliveCount() > MAX_STACK) this.endGame(null, 'overload');
          else this.nextTurn();
        }
        this.refreshTower();
      }
    }
    this.render();
    requestAnimationFrame(this.frame.bind(this));
  };

  Game.prototype.run = function () {
    requestAnimationFrame(this.frame.bind(this));
  };

  // ---- rendering ----
  Game.prototype.render = function () {
    var g = this.ctx;
    // pastel backdrop
    var bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#fdf6ec'); bg.addColorStop(0.55, '#fde9ef'); bg.addColorStop(1, '#e3f2fd');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    // faint dots
    g.fillStyle = 'rgba(0,0,0,0.04)';
    for (var dx = 20; dx < W; dx += 44) for (var dy = 20; dy < H; dy += 44) { g.beginPath(); g.arc(dx, dy, 2, 0, 7); g.fill(); }
    // platform: green bar, black outline
    g.save();
    g.fillStyle = '#39d353';
    g.strokeStyle = '#111'; g.lineWidth = 4;
    var pw = PLATFORM_W, px = W / 2 - pw / 2, py = PLATFORM_Y - 11;
    g.beginPath();
    if (g.roundRect) g.roundRect(px, py, pw, 22, 8); else g.rect(px, py, pw, 22);
    g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.fillRect(px + 10, py + 3, pw - 20, 5);
    g.restore();
    // kill line (subtle red dashes)
    g.save();
    g.strokeStyle = 'rgba(230,30,60,0.55)'; g.lineWidth = 3; g.setLineDash([12, 10]);
    g.beginPath(); g.moveTo(10, KILL_Y); g.lineTo(W - 10, KILL_Y); g.stroke();
    g.setLineDash([]);
    g.fillStyle = 'rgba(230,30,60,0.7)';
    g.font = 'bold 11px system-ui, Tahoma, sans-serif'; g.textAlign = 'center';
    g.fillText(window.BrainrotLang ? window.BrainrotLang.t('killLine') : 'DROP = LOSE', W / 2, KILL_Y + 16);
    g.restore();
    // stacked bodies
    var pieces = this.physics.pieces;
    for (var i = 0; i < pieces.length; i++) this.drawBody(pieces[i]);
    // preview ghost
    if (this.preview && (this.state === 'AIMING')) {
      g.save();
      g.globalAlpha = 0.92;
      g.translate(this.preview.x, this.preview.y);
      g.rotate(this.preview.angle);
      var s = this.preview.size;
      try {
        g.drawImage(this.preview.sprite.img, -s / 2, -s / 2, s, s);
      } catch (e) {}
      g.restore();
      // character name: blink briefly below the preview, then hide
      var now = performance.now();
      if (this.preview.bornAt && (now - this.preview.bornAt) < 2600 && this.preview.sprite) {
        var on = Math.floor(now / 280) % 2 === 0;
        g.save();
        g.globalAlpha = on ? 0.95 : 0.12;
        g.font = '900 16px system-ui, sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        var label = String(this.preview.sprite.name || '').toUpperCase();
        var tw = g.measureText(label).width;
        var lx = this.preview.x, ly = this.preview.y + s / 2 + 22;
        g.fillStyle = '#111';
        g.beginPath();
        if (g.roundRect) g.roundRect(lx - tw / 2 - 10, ly - 13, tw + 20, 26, 13);
        else g.rect(lx - tw / 2 - 10, ly - 13, tw + 20, 26);
        g.fill();
        g.fillStyle = '#ffd23f';
        g.fillText(label, lx, ly + 1);
        g.restore();
      }
    }
  };

  Game.prototype.drawBody = function (body) {
    var g = this.ctx;
    var spr = body.plugin && body.plugin.sprite;
    g.save();
    g.translate(body.position.x, body.position.y);
    g.rotate(body.angle);
    if (spr) {
      // estimate draw size from compound bounds
      var w = body.bounds.max.x - body.bounds.min.x;
      var h = body.bounds.max.y - body.bounds.min.y;
      var s = Math.max(w, h) * 1.06;
      try { g.drawImage(spr.img, -s / 2, -s / 2, s, s); }
      catch (e) {
        g.fillStyle = '#ffb703';
        g.fillRect(-s / 2, -s / 2, s, s);
      }
    } else {
      g.fillStyle = '#999';
      var verts = body.vertices;
      g.beginPath();
      g.moveTo(verts[0].x - body.position.x, verts[0].y - body.position.y);
      for (var i = 1; i < verts.length; i++) g.lineTo(verts[i].x - body.position.x, verts[i].y - body.position.y);
      g.closePath(); g.fill();
    }
    g.restore();
  };

  window.BrainrotGame = { Game: Game, W: W, H: H };
})();
