/* Brainrot Stack - Physics module ( window.BrainrotPhysics )
   Wraps Matter.js: world setup, silhouette-compound bodies, rest detection. */
(function () {
  'use strict';

  function PhysicsWorld(opts) {
    this.W = opts.width || 480;
    this.H = opts.height || 720;
    this.platformY = opts.platformY || 540;
    this.platformW = opts.platformW || 300;
    this.engine = Matter.Engine.create({ enableSleeping: false });
    this.engine.gravity.y = 1;
    this.engine.positionIterations = 8;
    this.engine.velocityIterations = 6;
    this.world = this.engine.world;
    this.platform = null;
    this.pieces = [];
    this.reset();
  }

  PhysicsWorld.prototype.reset = function () {
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
    this.pieces = [];
    this.platform = Matter.Bodies.rectangle(this.W / 2, this.platformY, this.platformW, 22, {
      isStatic: true,
      friction: 0.9,
      frictionStatic: 1.0,
      restitution: 0.05,
      label: 'platform'
    });
    Matter.World.add(this.world, this.platform);
  };

  // Build a snug compound body from the sprite's alpha silhouette.
  PhysicsWorld.prototype.createPiece = function (x, y, angleRad, spriteEntry, displaySize) {
    var size = displaySize || 76;
    var bands = window.BrainrotAssets.opaqueBands(spriteEntry.img, 8);
    var parts = [];
    for (var i = 0; i < bands.length; i++) {
      var b = bands[i];
      var bw = Math.max(8, (b.x1 - b.x0) * size);
      var bh = Math.max(6, (b.y1 - b.y0) * size);
      var cx = (x - size / 2) + ((b.x0 + b.x1) / 2) * size;
      var cy = (y - size / 2) + ((b.y0 + b.y1) / 2) * size;
      parts.push(Matter.Bodies.rectangle(cx, cy, bw, bh, { chamfer: { radius: 3 } }));
    }
    var body = Matter.Body.create({
      parts: parts,
      friction: 0.55,
      frictionStatic: 0.8,
      frictionAir: 0.008,
      restitution: 0.08,
      density: 0.0012,
      label: 'piece'
    });
    Matter.Body.setAngle(body, angleRad || 0);
    Matter.Body.setPosition(body, { x: x, y: y });
    body.plugin = body.plugin || {};
    body.plugin.sprite = spriteEntry;
    body.plugin.spawnAt = Date.now();
    Matter.World.add(this.world, body);
    this.pieces.push(body);
    return body;
  };

  PhysicsWorld.prototype.step = function (dtMs) {
    Matter.Engine.update(this.engine, dtMs);
  };

  PhysicsWorld.prototype.removeFarBodies = function () {
    // Bodies far below are kept for kill detection by the game; nothing removed here.
  };

  // True when every dynamic piece is below velocity thresholds.
  PhysicsWorld.prototype.allAtRest = function () {
    for (var i = 0; i < this.pieces.length; i++) {
      var b = this.pieces[i];
      if (b.speed > 0.22) return false;
      if (Math.abs(b.angularVelocity) > 0.0025) return false;
    }
    return true;
  };

  // Returns the first piece crossing the kill plane, or null.
  PhysicsWorld.prototype.firstKilled = function (killY) {
    for (var i = 0; i < this.pieces.length; i++) {
      var b = this.pieces[i];
      if (b.position.y - 20 > killY) return b;
      if ((b.position.x < -90 || b.position.x > this.W + 90) && b.position.y > this.platformY + 40) return b;
    }
    return null;
  };

  window.BrainrotPhysics = { PhysicsWorld: PhysicsWorld };
})();
