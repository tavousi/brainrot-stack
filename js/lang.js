/* Brainrot Stack - Bilingual strings ( window.BrainrotLang : 'en' | 'fa' ) */
(function () {
  'use strict';

  var STR = {
    en: {
      ready: 'READY?',
      blueTurn: 'BLUE TURN',
      redTurn: 'RED TURN',
      gameOver: 'GAME OVER',
      round: function (n) { return 'ROUND ' + n; },
      desc: 'Take turns dropping brainrots. First player to drop a brainrots off the platform loses, so take care to drag left & right, and tap to rotate before you drop.',
      play: 'PLAY',
      p1: 'PLAYER 1',
      p2: 'PLAYER 2',
      howto: 'HOW TO PLAY',
      back: 'BACK',
      next: 'NEXT',
      done: 'DONE',
      close: 'close',
      drop: 'DROP',
      loading: 'LOADING BRAINROTS\u2026',
      rank1: 'RANK 1 \u2022 WINNER',
      rank2: 'RANK 2',
      winBlue: 'BLUE WINS',
      winRed: 'RED WINS',
      nameBlue: 'BLUE',
      nameRed: 'RED',
      rematch: 'REMATCH / PLAY AGAIN',
      killLine: 'DROP = LOSE',
      tower: function (o) { return 'TOWER ' + o.n + '/' + o.m; },
      reasonFell: 'A brainrot fell off the platform!',
      reasonOverload: 'Tower overloaded — more than 5 brainrots cannot stack!',
      sound: 'Sound on/off',
      rules: 'Rules',
      rotate: 'Rotate',
      slides: [
        { t: '1/4 \u2014 DRAG', d: 'Drag left & right anywhere to aim the falling brainrot over the green platform.' },
        { t: '2/4 \u2014 ROTATE', d: 'Tap the brainrot (or press \u27F3) to rotate it 45\u00B0 and find the best landing angle.' },
        { t: '3/4 \u2014 DROP', d: 'Hit the red DROP button to release it. Then physics takes over!' },
        { t: '4/4 \u2014 SURVIVE', d: 'Players alternate turns and the board flips to face each player. If ANY brainrot falls past the red line on your turn, you LOSE. Tower holds max 5 — a 6th brainrot collapses it!' }
      ]
    },
    fa: {
      ready: '\u0622\u0645\u0627\u062f\u0647\u200C\u0627\u06CC\u061F',
      blueTurn: '\u0646\u0648\u0628\u062A \u0622\u0628\u06CC',
      redTurn: '\u0646\u0648\u0628\u062A \u0642\u0631\u0645\u0632',
      gameOver: '\u0628\u0627\u0632\u06CC \u062a\u0645\u0627\u0645 \u0634\u062F',
      round: function (n) { return '\u062F\u0648\u0631 ' + n; },
      desc: '\u0646\u0648\u0628\u062A\u06CC \u0628\u0631\u06CC\u0646\u200C\u0631\u0627\u062A \u0628\u0646\u062F\u0627\u0632. \u0627\u0648\u0644\u06CC\u0646 \u0628\u0627\u0632\u06CC\u06A9\u0646\u06CC \u06A9\u0647 \u0628\u0631\u06CC\u0646\u200C\u0631\u0627\u062A\u06CC \u0627\u0632 \u0633\u06A9\u0648 \u0628\u06CC\u0641\u062A\u062F \u0645\u06CC\u200C\u0628\u0627\u0632\u062F\u061B \u067E\u0633 \u0628\u0627 \u06A9\u0634\u06CC\u062F\u0646 \u0686\u067E \u0648 \u0631\u0627\u0633\u062A aim \u06A9\u0646 \u0648 \u0642\u0628\u0644 \u0627\u0632 \u0627\u0646\u062F\u0627\u062E\u062A\u0646 \u0628\u0627 \u0636\u0631\u0628\u0647 \u0628\u0686\u0631\u062E\u0627\u0646.',
      play: '\u0628\u0627\u0632\u06CC',
      p1: '\u0628\u0627\u0632\u06CC\u06A9\u0646 \u06F1',
      p2: '\u0628\u0627\u0632\u06CC\u06A9\u0646 \u06F2',
      howto: '\u0631\u0627\u0647\u0646\u0645\u0627',
      back: '\u0642\u0628\u0644\u06CC',
      next: '\u0628\u0639\u062F\u06CC',
      done: '\u062A\u0645\u0627\u0645',
      close: '\u0628\u0633\u062A\u0646',
      drop: '\u0628\u0646\u062F\u0627\u0632',
      loading: '\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0628\u0631\u06CC\u0646\u200C\u0631\u0627\u062A\u200C\u0647\u0627\u2026',
      rank1: '\u0631\u062A\u0628\u0647 \u06F1 \u2022 \u0628\u0631\u0646\u062F\u0647',
      rank2: '\u0631\u062A\u0628\u0647 \u06F2',
      winBlue: '\u0622\u0628\u06CC \u0628\u0631\u062F',
      winRed: '\u0642\u0631\u0645\u0632 \u0628\u0631\u062F',
      nameBlue: '\u0622\u0628\u06CC',
      nameRed: '\u0642\u0631\u0645\u0632',
      rematch: '\u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0627\u0632\u06CC',
      killLine: '\u0627\u0641\u062A\u0627\u062F\u0646 = \u0628\u0627\u062E\u062A',
      tower: function (o) { return '\u0628\u0631\u062C ' + o.n + '/' + o.m; },
      reasonFell: '\u06CC\u06A9 \u0628\u0631\u06CC\u0646\u200C\u0631\u0627\u062A \u0627\u0632 \u0633\u06A9\u0648 \u0627\u0641\u062A\u0627\u062F!',
      reasonOverload: '\u0628\u0631\u062C \u0641\u0631\u0648 \u0631\u06CC\u062E\u062A \u2014 \u0628\u06CC\u0634 \u0627\u0632 \u06F5 \u0628\u0631\u06CC\u0646\u200C\u0631\u0627\u062A \u0631\u0648\u06CC \u0647\u0645 \u0646\u0645\u06CC\u200C\u0645\u0627\u0646\u062F!',
      sound: '\u0631\u0648\u0634\u0646 / \u062E\u0627\u0645\u0648\u0634 \u06A9\u0631\u062F\u0646 \u0635\u062F\u0627',
      rules: '\u0631\u0627\u0647\u0646\u0645\u0627',
      rotate: '\u0686\u0631\u062E\u0634',
      slides: [
        { t: '\u06F1/\u06F4 \u2014 \u06A9\u0634\u06CC\u062F\u0646', d: '\u0628\u0631\u0627\u06CC aim \u06A9\u0631\u062F\u0646 \u0628\u0631\u06CC\u0646\u200C\u0631\u0627\u062A \u0628\u0627\u0644\u0627\u06CC \u0633\u06A9\u0648\u06CC \u0633\u0628\u0632\u060C \u0647\u0631 \u062C\u0627\u06CC \u0635\u0641\u062D\u0647 \u0631\u0627 \u0686\u067E \u0648 \u0631\u0627\u0633\u062A \u0628\u06A9\u0634.' },
        { t: '\u06F2/\u06F4 \u2014 \u0686\u0631\u062E\u0634', d: '\u0631\u0648\u06CC \u0628\u0631\u06CC\u0646\u200C\u0631\u0627\u062A \u0636\u0631\u0628\u0647 \u0628\u0632\u0646 (\u06CC\u0627 \u27F3) \u062A\u0627 \u06F4\u06F5 \u062F\u0631\u062C\u0647 \u0628\u0686\u0631\u062E\u062F \u0648 \u0628\u0647\u062A\u0631\u06CC\u0646 \u0632\u0627\u0648\u06CC\u0647 \u0641\u0631\u0648\u062F \u0631\u0627 \u067E\u06CC\u062F\u0627 \u06A9\u0646\u06CC.' },
        { t: '\u06F3/\u06F4 \u2014 \u0627\u0646\u062F\u0627\u062E\u062A\u0646', d: '\u062F\u06A9\u0645\u0647 \u0628\u0646\u062F\u0627\u0632 \u0631\u0627 \u0628\u0632\u0646 \u062A\u0627 \u0631\u0647\u0627\u06CC\u0634 \u06A9\u0646\u062F. \u0628\u0639\u062F\u0634 \u0641\u06CC\u0632\u06CC\u06A9 \u06A9\u0627\u0631 \u0631\u0627 \u0645\u06CC\u200C\u06A9\u0646\u062F!' },
        { t: '\u06F4/\u06F4 \u2014 \u0632\u0646\u062F\u0647 \u0628\u0645\u0627\u0646', d: '\u0628\u0627\u0632\u06CC\u06A9\u0646\u0627\u0646 \u0646\u0648\u0628\u062A\u06CC \u0628\u0627\u0632\u06CC \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F \u0648 \u0635\u0641\u062D\u0647 \u0631\u0648 \u0628\u0647 \u0647\u0631 \u0628\u0627\u0632\u06CC\u06A9\u0646 \u0645\u06CC\u200C\u0686\u0631\u062E\u062F. \u0627\u06AF\u0631 \u062F\u0631 \u0646\u0648\u0628\u062A \u062A\u0648 \u0647\u0631 \u0628\u0631\u06CC\u0646\u200C\u0631\u0627\u062A\u06CC \u0627\u0632 \u062E\u0637 \u0642\u0631\u0645\u0632 \u0631\u062F \u0634\u0648\u062F\u060C \u0645\u06CC\u200C\u0628\u0627\u0632\u06CC. \u0628\u0631\u062C \u0641\u0642\u0637 \u06F5 \u062A\u0627 \u0646\u06AF\u0647 \u0645\u06CC\u200C\u062F\u0627\u0631\u062F \u2014 \u0634\u0634\u0645\u06CC \u0622\u0646 \u0631\u0627 \u0641\u0631\u0648 \u0645\u06CC\u200C\u0631\u06CC\u0632\u062F!' }
      ]
    }
  };

  var cur = 'en';

  function t(key, arg) {
    var v = STR[cur][key];
    if (typeof v === 'function') return v(arg);
    return (v === undefined) ? key : v;
  }

  function set(lang) {
    if (!STR[lang]) return;
    cur = lang;
    try {
      document.documentElement.lang = (lang === 'fa') ? 'fa' : 'en';
      document.documentElement.dir = (lang === 'fa') ? 'rtl' : 'ltr';
    } catch (e) {}
  }

  window.BrainrotLang = {
    t: t,
    set: set,
    toggle: function () { set(cur === 'en' ? 'fa' : 'en'); return cur; },
    get: function () { return cur; },
    slides: function () { return STR[cur].slides; }
  };
})();
