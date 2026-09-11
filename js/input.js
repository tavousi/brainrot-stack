/* Brainrot Stack - Input module ( window.BrainrotInput )
   PointerEvents-based drag + tap-to-rotate, works for mouse and touch. */
(function () {
  'use strict';

  function InputController(canvas, handlers) {
    this.canvas = canvas;
    this.handlers = handlers || {};
    this.down = false;
    this.startX = 0; this.startY = 0; this.startT = 0;
    this.moved = 0;
    this.activeId = null;
    this.attach();
  }

  InputController.prototype.toLogicalX = function (clientX) {
    var r = this.canvas.getBoundingClientRect();
    var scale = this.canvas._logicalW / r.width;
    var x = (clientX - r.left) * scale;
    if (this.canvas._flipped) x = this.canvas._logicalW - x;
    return x;
  };

  InputController.prototype.toLogicalY = function (clientY) {
    var r = this.canvas.getBoundingClientRect();
    var scale = this.canvas._logicalH / r.height;
    var y = (clientY - r.top) * scale;
    if (this.canvas._flipped) y = this.canvas._logicalH - y;
    return y;
  };

  InputController.prototype.attach = function () {
    var self = this;
    var el = this.canvas;
    el.style.touchAction = 'none';

    el.addEventListener('pointerdown', function (ev) {
      if (self.handlers.isAiming && !self.handlers.isAiming()) return;
      self.down = true;
      self.activeId = ev.pointerId;
      self.startX = self.toLogicalX(ev.clientX);
      self.startY = self.toLogicalY(ev.clientY);
      self.startT = performance.now();
      self.moved = 0;
      try { el.setPointerCapture(ev.pointerId); } catch (e) {}
      ev.preventDefault();
    });

    el.addEventListener('pointermove', function (ev) {
      if (!self.down || ev.pointerId !== self.activeId) return;
      if (self.handlers.isAiming && !self.handlers.isAiming()) return;
      var x = self.toLogicalX(ev.clientX);
      var y = self.toLogicalY(ev.clientY);
      self.moved = Math.max(self.moved, Math.abs(x - self.startX) + Math.abs(y - self.startY));
      if (self.handlers.onDrag) self.handlers.onDrag(x);
      ev.preventDefault();
    });

    function end(ev) {
      if (!self.down || ev.pointerId !== self.activeId) return;
      self.down = false;
      var dt = performance.now() - self.startT;
      var x = self.toLogicalX(ev.clientX);
      var y = self.toLogicalY(ev.clientY);
      var isTap = self.moved < 12 && dt < 400;
      if (isTap && self.handlers.onTap) self.handlers.onTap(x, y);
      self.activeId = null;
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', function (ev) { self.down = false; self.activeId = null; });
  };

  window.BrainrotInput = { InputController: InputController };
})();
