/* Brainrot Stack - Sound module ( window.BrainrotAudio )
   100% procedural Web Audio: no audio files needed, works offline on file://.
   - Calming ambient bed: flowing water ("shor shor") + bubbles ("ghol ghol") + soft air
   - drop()   : wobbly "ghelgheli" tumble
   - rotate() : short "ghizh" squeak
   - thud(v)  : soft landing knock scaled by impact
   - win()    : bright hooray fanfare + crowd-cheer swell
   - lose()   : gentle sad slide */
(function () {
  'use strict';

  var ctx = null;
  var master = null;
  var muted = false;
  var ambientOn = false;
  var ambientNodes = [];
  var bubbleTimer = null;

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noiseBuffer(seconds) {
    var c = ac();
    var len = Math.floor(c.sampleRate * (seconds || 2));
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      last = (last + 0.03 * w) / 1.03; // pinkish
      d[i] = (last * 3.2 + w * 0.25) * 0.6;
    }
    return buf;
  }

  function startAmbient() {
    var c = ac();
    if (!c || ambientOn) return;
    ambientOn = true;
    try {
      // --- flowing water "shor shor": looped noise -> wandering lowpass ---
      var src = c.createBufferSource();
      src.buffer = noiseBuffer(3);
      src.loop = true;
      var lp = c.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.6;
      var wg = c.createGain(); wg.gain.value = 0.075;
      // slow wave LFO on loudness + brightness
      var lfo = c.createOscillator(); lfo.frequency.value = 0.13;
      var lfoG = c.createGain(); lfoG.gain.value = 0.028;
      lfo.connect(lfoG); lfoG.connect(wg.gain);
      var lfo2 = c.createOscillator(); lfo2.frequency.value = 0.09;
      var lfo2G = c.createGain(); lfo2G.gain.value = 190;
      lfo2.connect(lfo2G); lfo2G.connect(lp.frequency);
      src.connect(lp); lp.connect(wg); wg.connect(master);
      src.start(); lfo.start(); lfo2.start();
      ambientNodes.push(src, lfo, lfo2);

      // --- soft air / flight breeze: airy bandpassed noise ---
      var air = c.createBufferSource();
      air.buffer = noiseBuffer(4);
      air.loop = true; air.playbackRate.value = 0.5;
      var bp = c.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.5;
      var ag = c.createGain(); ag.gain.value = 0.016;
      var lfo3 = c.createOscillator(); lfo3.frequency.value = 0.07;
      var lfo3G = c.createGain(); lfo3G.gain.value = 0.010;
      lfo3.connect(lfo3G); lfo3G.connect(ag.gain);
      air.connect(bp); bp.connect(ag); ag.connect(master);
      air.start(); lfo3.start();
      ambientNodes.push(air, lfo3);

      scheduleBubble();
    } catch (e) { ambientOn = false; }
  }

  // random "ghol ghol" water bubbles while ambient is on
  function scheduleBubble() {
    if (!ambientOn) return;
    bubbleTimer = setTimeout(function () {
      try {
        if (!muted && ambientOn) {
          bubble(280 + Math.random() * 320);
          if (Math.random() < 0.45) setTimeout(function () { if (!muted) bubble(350 + Math.random() * 350); }, 140);
        }
      } catch (e) {}
      scheduleBubble();
    }, 1600 + Math.random() * 2600);
  }

  function bubble(freq) {
    var c = ac(); if (!c) return;
    var t = c.currentTime;
    var o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 2.2, t + 0.13);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.22);
  }

  function blip(freqA, freqB, dur, type, vol, when) {
    var c = ac(); if (!c) return;
    var t = c.currentTime + (when || 0);
    var o = c.createOscillator(); o.type = type || 'sine';
    o.frequency.setValueAtTime(freqA, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, freqB), t + dur);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // "ghelgheli" rolling drop: descending wobble + two bounce blips
  function drop() {
    if (!ac() || muted) return;
    try {
      var c = ctx, t = c.currentTime;
      var o = c.createOscillator(); o.type = 'triangle';
      o.frequency.setValueAtTime(520, t);
      o.frequency.exponentialRampToValueAtTime(140, t + 0.38);
      var vib = c.createOscillator(); vib.frequency.value = 26;
      var vibG = c.createGain(); vibG.gain.value = 40;
      vib.connect(vibG); vibG.connect(o.frequency);
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.5); vib.start(t); vib.stop(t + 0.5);
      blip(700, 900, 0.09, 'sine', 0.10, 0.36);
      blip(600, 800, 0.08, 'sine', 0.07, 0.47);
    } catch (e) {}
  }

  // "ghizh" squeak for rotation: fast upward chirp
  function rotate() {
    if (!ac() || muted) return;
    try { blip(1100, 2100, 0.11, 'square', 0.045); } catch (e) {}
  }

  // soft landing knock, v = impact 0..1
  function thud(v) {
    if (!ac() || muted) return;
    try {
      var c = ctx, t = c.currentTime;
      var vol = Math.min(0.25, 0.05 + v * 0.2);
      var o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(110, t);
      o.frequency.exponentialRampToValueAtTime(55, t + 0.12);
      var g = c.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.18);
    } catch (e) {}
  }

  // hooray: bright rising arpeggio + crowd-cheer noise swell
  function win() {
    if (!ac() || muted) return;
    try {
      var notes = [523, 659, 784, 1047, 784, 1047, 1319];
      for (var i = 0; i < notes.length; i++) {
        blip(notes[i], notes[i], 0.22, 'triangle', 0.16, i * 0.11);
        blip(notes[i] * 2, notes[i] * 2, 0.18, 'sine', 0.05, i * 0.11);
      }
      // cheer swell: bandpassed noise "aaah"
      var c = ctx, t = c.currentTime + 0.1;
      var n = c.createBufferSource(); n.buffer = noiseBuffer(1.5);
      var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 0.7;
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.10, t + 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
      n.connect(f); f.connect(g); g.connect(master);
      n.start(t); n.stop(t + 1.4);
    } catch (e) {}
  }

  function lose() {
    if (!ac() || muted) return;
    try {
      blip(320, 130, 0.5, 'triangle', 0.14, 0);
      blip(210, 90, 0.5, 'sine', 0.10, 0.12);
    } catch (e) {}
  }

  window.BrainrotAudio = {
    init: function () { try { ac(); } catch (e) {} },
    startAmbient: startAmbient,
    drop: drop,
    rotate: rotate,
    thud: thud,
    win: win,
    lose: lose,
    toggle: function () {
      muted = !muted;
      try { if (master) master.gain.value = muted ? 0 : 1; } catch (e) {}
      return muted;
    },
    isMuted: function () { return muted; }
  };
})();
