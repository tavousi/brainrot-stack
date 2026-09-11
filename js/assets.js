/* Brainrot Stack - Asset Loader ( window.BrainrotAssets )
   Loads character sprites from ./characters/ with graceful fallback.
   Also provides alpha-mask silhouette sampling for snug collision bounds. */
(function () {
  'use strict';

  var CANDIDATES = [
    'characters/char1.png',
    'characters/char2.png',
    'characters/char3.png',
    'characters/char4.png',
    'characters/char5.png',
    'characters/char6.png',
    'characters/char7.png',
    'characters/char8.png',
    'characters/char9.png',
    'characters/char10.png'
  ];

  var NAMES = [
    'Rostam Ragno', 'Simorgh Pizzaino', 'Ghelyoon Pipino', 'Kebab Toros',
    'Bozbashini', 'Farshini', 'Pesteeno', 'Takhti Bot', 'Peykanini', 'Chai Barista'
  ];

  function loadImage(url, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var done = false;
      var img = new Image();
      var timer = setTimeout(function () {
        if (!done) { done = true; img.src = ''; reject(new Error('timeout:' + url)); }
      }, timeoutMs || 9000);
      img.onload = function () {
        if (!done) { done = true; clearTimeout(timer); resolve(img); }
      };
      img.onerror = function () {
        if (!done) { done = true; clearTimeout(timer); reject(new Error('load-fail:' + url)); }
      };
      img.src = url;
    });
  }

  // Procedural fallback sprites (always available, even offline / no PNGs).
  // Draws 10 cute meme blobs on offscreen canvases so the game is 100% playable.
  function generateFallbackSprites() {
    var palette = [
      ['#ffb703', '#fb8500'], ['#80ed99', '#22577a'], ['#ffafcc', '#cdb4db'],
      ['#fdffb6', '#ff677d'], ['#a0e7e5', '#588157'], ['#ffd6a5', '#ca6702'],
      ['#bde0fe', '#3a86ff'], ['#e4c1f9', '#7b2cbf'], ['#d8f3dc', '#2d6a4f'],
      ['#fec89a', '#e76f51']
    ];
    var faces = ['\u{1F60E}', '\u{1F60B}', '\u{1F92A}', '\u{1F47E}', '\u{1F355}',
                 '\u{1F363}', '\u{1F42E}', '\u{1F991}', '\u{1F375}', '\u{1F47B}'];
    var out = [];
    for (var i = 0; i < 10; i++) {
      var c = document.createElement('canvas');
      c.width = 160; c.height = 160;
      var g = c.getContext('2d');
      var grad = g.createLinearGradient(0, 0, 0, 160);
      grad.addColorStop(0, palette[i][0]);
      grad.addColorStop(1, palette[i][1]);
      g.fillStyle = grad;
      g.beginPath();
      var wob = (i % 3) * 6;
      g.ellipse(80, 84, 62 - wob * 0.4, 58 + wob * 0.4, 0, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 6; g.strokeStyle = '#222'; g.stroke();
      g.fillStyle = '#fff';
      g.beginPath(); g.arc(58, 66, 16, 0, Math.PI * 2); g.arc(102, 66, 16, 0, Math.PI * 2); g.fill();
      g.lineWidth = 4; g.stroke();
      g.fillStyle = '#111';
      g.beginPath(); g.arc(58 + (i % 3) * 2, 68, 6, 0, Math.PI * 2); g.arc(102 - (i % 3) * 2, 68, 6, 0, Math.PI * 2); g.fill();
      g.font = '44px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(faces[i], 80, 120);
      out.push({ img: c, name: NAMES[i] + ' (fallback)', url: 'fallback:' + i, fallback: true, scale: 1 });
    }
    return out;
  }

  // Per-character display scale: bigger fighters hit harder (and wobble more).
  var SCALE = {
    'characters/char2.png': 1.5,
    'characters/char4.png': 1.5,
    'characters/char9.png': 1.5,
    'characters/char10.png': 0.85
  };

  function loadAll() {
    var jobs = CANDIDATES.map(function (url, i) {
      return loadImage(url).then(function (img) {
        return { img: img, name: NAMES[i] || ('Brainrot ' + (i + 1)), url: url, fallback: false, scale: SCALE[url] || 1 };
      }).catch(function () { return null; });
    });
    return Promise.all(jobs).then(function (results) {
      var ok = results.filter(function (r) { return r !== null; });
      if (ok.length === 0) return generateFallbackSprites();
      return ok;
    });
  }

  // Sample alpha channel on a small grid and return opaque horizontal bands
  // in normalized 0..1 coordinates: [{y0,y1,x0,x1}]. Used for snug compound bodies.
  function opaqueBands(img, sliceCount) {
    var S = 56;
    var slices = sliceCount || 8;
    try {
      var c = document.createElement('canvas');
      c.width = S; c.height = S;
      var g = c.getContext('2d', { willReadFrequently: true });
      g.clearRect(0, 0, S, S);
      // contain-fit draw
      var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      if (!iw || !ih) return fullBands(slices);
      var s = Math.min(S / iw, S / ih);
      var dw = Math.max(1, Math.floor(iw * s)), dh = Math.max(1, Math.floor(ih * s));
      g.drawImage(img, Math.floor((S - dw) / 2), Math.floor((S - dh) / 2), dw, dh);
      var data = g.getImageData(0, 0, S, S).data;
      // global opaque bbox
      var minX = S, maxX = -1, minY = S, maxY = -1;
      for (var y = 0; y < S; y++) {
        for (var x = 0; x < S; x++) {
          if (data[(y * S + x) * 4 + 3] > 24) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < 0) return fullBands(slices);
      var bands = [];
      var totalH = maxY - minY + 1;
      for (var b = 0; b < slices; b++) {
        var y0 = minY + Math.floor((totalH * b) / slices);
        var y1 = minY + Math.floor((totalH * (b + 1)) / slices) - 1;
        var bx0 = S, bx1 = -1;
        for (var yy = y0; yy <= y1; yy++) {
          for (var xx = minX; xx <= maxX; xx++) {
            if (data[(yy * S + xx) * 4 + 3] > 24) {
              if (xx < bx0) bx0 = xx;
              if (xx > bx1) bx1 = xx;
            }
          }
        }
        if (bx1 < 0) { bx0 = minX; bx1 = maxX; } // keep solid if slice empty
        bands.push({ y0: y0 / S, y1: (y1 + 1) / S, x0: bx0 / S, x1: (bx1 + 1) / S });
      }
      return bands;
    } catch (e) {
      return fullBands(slices);
    }
  }

  function fullBands(slices) {
    var bands = [];
    for (var b = 0; b < slices; b++) {
      bands.push({ y0: b / slices, y1: (b + 1) / slices, x0: 0.08, x1: 0.92 });
    }
    return bands;
  }

  window.BrainrotAssets = {
    loadAll: loadAll,
    opaqueBands: opaqueBands,
    generateFallbackSprites: generateFallbackSprites
  };
})();
