# 🧠 BRAINROT STACK — برین‌رات استک

**Take turns dropping brainrots. First player to knock one off the platform loses!**
**نوبتی برین‌رات بنداز! اولین نفری که برین‌رتی از سکو بیفته می‌بازه!**

🎮 **Play now / همین حالا بازی کن:** https://tavousi.github.io/brainrot-stack/

> **English** below • **فارسی** در ادامه ⬇️

---

## 🇬🇧 English

A 2-player, pass-and-play physics stacking game for mobile and desktop — starring 10 original **Iranian Brainrot** characters (a heroic spider-Rostam, a kebab bull, a pistachio ninja, a teapot barista… and friends). No installs, no build step, works fully offline: just open it and play. The start menu is bilingual (EN + FA), and a 🌐 button switches the whole game between English and Persian (RTL).

### 🕹️ How to play

1. Press **PLAY / بازی** — Player 1 (**Blue 🔵**) starts.
2. A random brainrot appears above the stage, floating and waiting. Its name flashes under it for a moment — then hides!
3. Aim your drop:
   - **Drag** 👈👉 anywhere to slide it left & right
   - **Tap the brainrot** (or press ⟳) to rotate it 45° and find the perfect landing angle
4. Hit the big **DROP** button (red on Red's turn, blue on Blue's turn) — gravity takes over!
5. Wait for the stack to settle, then pass the phone — it's the other player's turn. **The board flips 180°** so each player always faces it from their own side.
6. 🗼 **The tower holds max 5!** The counter (`TOWER n/5`) tracks it — at 5/5 it blinks red and the tower starts wobbling. Stack a 6th brainrot and it collapses: you LOSE.
7. 💀 **If ANY brainrot falls past the red line on your turn — even one your opponent stacked — you LOSE** and the other player wins.

**Controls**

| Action | Mouse / Touch |
|---|---|
| Aim left & right | Drag anywhere |
| Rotate 45° | Tap the brainrot, or ⟳ button |
| Drop | DROP button (bottom-right, colored by turn) |
| Sound on/off | 🔊 button in the top bar |
| Language EN/FA | 🌐 button (menu + top bar) |

### ✨ Features

- 🎲 **True 2-player pass-and-play** — Blue vs Red, auto-rotating board for table play
- 🗼 **Max-5 tower rule** — live counter, red warning blink, wobble physics on overload, collapse = loss
- 🧱 **Real physics** — Matter.js rigid bodies with silhouette-snug collision shapes sampled from each sprite's alpha channel, so characters stack and tumble like their actual shapes
- 🎨 **10 original Iranian Brainrot characters** in `characters/` — some fighters are bigger: `char2/char4/char9` drop at 1.5× size (heavier and wobblier!), `char10` is slightly smaller
- 🌍 **Bilingual EN/FA** — bilingual start menu + one-tap full-game language switch with RTL layout
- 🔊 **Procedural Web Audio soundscape** — calming water/bubble ambience, wobbly drop, squeaky rotate, landing thuds, hooray fanfare. Zero audio files!
- 📴 **Fully offline** — physics engine vendored in `vendor/`, procedural fallback sprites if images ever fail to load
- 📱 **Mobile-first** — PointerEvents (touch + mouse), responsive canvas, 180° flip view

### 📁 Project structure

```
brainrot-stack/
├── index.html          # screens (menu, tutorial, HUD, game-over) + canvas
├── style.css           # pastel UI, turn pills, DROP button, overlays
├── favicon.svg         # stacking-brainrots icon
├── README.md           # this file (bilingual)
├── characters/         # 10 playable PNG sprites (char1–char10.png)
├── vendor/
│   └── matter.min.js   # physics engine (offline copy, CDN fallback in code)
└── js/
    ├── assets.js       # sprite loader (per-character scale) + alpha-mask silhouettes
    ├── lang.js         # EN/FA dictionary + RTL switching
    ├── audio.js        # procedural sounds (ambient, drop, rotate, win…)
    ├── physics.js      # PhysicsWorld: bodies, rest & kill-plane detection
    ├── input.js        # drag / tap-to-rotate (flip-aware coordinates)
    ├── game.js         # state machine + tower cap + overload wobble
    └── main.js         # boot, menu/tutorial/language wiring
```

**Game states:** `MENU` · `AIMING` (gravity off, preview follows your finger) · `FALLING`/`SETTLING` (physics runs until everything rests ~1s, then tower-cap check) · `GAMEOVER` (split winner/loser banner + reason + Rematch).

**Lose reasons:** `fell` (a brainrot crossed the red line) · `overload` (6+ brainrots stayed stacked).

### ▶️ Run locally

No build tools needed — it's vanilla HTML/JS:

- **Easiest:** double-click `index.html`
- **Or serve it:** `npx serve .` (or `python -m http.server`) and open the shown URL

### 🚀 Publish to GitHub Pages

This folder **is** the site root — push its *contents* to your repo:

```bash
cd brainrot-stack
git init
git add .
git commit -m "Brainrot Stack 🧠"
git branch -M main
git remote add origin https://github.com/tavousi/brainrot-stack.git
git push -u origin main
```

Then in GitHub: **Settings → Pages → Deploy from branch → `main` / `/ (root)`**. Your game goes live at `https://tavousi.github.io/brainrot-stack/` 🎉

### 🤝 Contributing

Found a wobbly bug? Have a new brainrot idea? PRs and new `characters/*.png` sprites are welcome — square PNGs with transparent backgrounds stack best!

Made with 💚 + Matter.js. Have fun stacking — and try not to drop one. 😬

---

## 🇮🇷 فارسی

<div dir="rtl">

بازی فیزیکیِ چیدن برین‌رات برای **۲ نفر** (نوبتی با یک گوشی) روی موبایل و کامپیوتر — با ۱۰ کاراکتر اورجینال **ایرانین برین‌رات** (رستم عنکبوتی، گاو کبابی، نینجای پسته‌ای، چایچی باریستا… و رفقا). بدون نصب و بدون بیلد، کاملاً آفلاین: فقط بازش کن و بازی کن. منوی اول همیشه دوزبانه است و با دکمه 🌐 کل بازی بین انگلیسی و فارسی (راست‌چین) جابه‌جا می‌شود.

### 🕹️ نحوه بازی

1. دکمه **PLAY / بازی** را بزن — بازیکن ۱ (**آبی 🔵**) شروع می‌کند.
2. یک برین‌رات تصادفی بالای صحنه ظاهر می‌شود. اسمش یک لحظه زیر عکس چشمک می‌زند — بعد مخفی می‌شود!
3. aim کن:
   - **کشیدن** 👈👉 هر جای صفحه برای حرکت چپ و راست
   - **ضربه روی برین‌رات** (یا دکمه ⟳) برای چرخش ۴۵ درجه و پیدا کردن بهترین زاویه فرود
4. دکمه بزرگ **بنداز** را بزن (در نوبت قرمز قرمز است، در نوبت آبی آبی!) — بعدش فیزیک کار را می‌کند!
5. صبر کن برج آرام بگیرد، بعد گوشی را بده به حریف — نوبت اوست. **صفحه ۱۸۰ درجه می‌چرخد** تا هر بازیکن از سمت خودش به بازی نگاه کند.
6. 🗼 **برج فقط ۵ تا نگه می‌دارد!** شمارنده (`برج n/5`) آن را نشان می‌دهد — روی ۵/۵ قرمز چشمک می‌زند و برج شروع به لرزیدن می‌کند. ششمی را بچینی فرو می‌ریزد: می‌بازی!
7. 💀 **اگر در نوبت تو هر برین‌رتی از خط قرمز رد شود — حتی چیزی که حریف چیده — می‌بازی** و بازیکن دیگر می‌برد.

**کنترل‌ها**

| کار | موس / لمس |
|---|---|
| aim چپ و راست | کشیدن هر جای صفحه |
| چرخش ۴۵ درجه | ضربه روی برین‌رات یا دکمه ⟳ |
| انداختن | دکمه بنداز (پایین-راست، هم‌رنگ نوبت) |
| قطع/وصل صدا | دکمه 🔊 در نوار بالا |
| زبان EN/FA | دکمه 🌐 (منو + نوار بالا) |

### ✨ ویژگی‌ها

- 🎲 **۲ نفره واقعی با یک گوشی** — آبی در برابر قرمز، با چرخش خودکار صفحه برای بازی دور میز
- 🗼 **قانون سقف ۵تایی** — شمارنده زنده، هشدار قرمز چشمک‌زن، لرزش فیزیکی هنگام اضافه‌بار، فروپاشی = باخت
- 🧱 **فیزیک واقعی** — بدنه‌های Matter.js با کالبد دقیقِ شبح هر کاراکتر، پس مثل شکل واقعی‌شان روی هم می‌مانند و می‌غلتند
- 🎨 **۱۰ کاراکتر اورجینال** در `characters/` — بعضی‌ها درشت‌ترند: `char2/char4/char9` با سایز ۱.۵ برابر می‌افتند (سنگین‌تر و لق‌تر!) و `char10` کمی کوچک‌تر است
- 🌍 **دوزبانه EN/FA** — منوی اول همیشه دوزبانه + تغییر زبان کل بازی با یک ضربه و چیدمان راست‌چین
- 🔊 **صدای procedural** — امبینت آرام آب و حباب، قلقلی انداختن، قیژ چرخش، تقّه فرود، هورای برد. بدون حتی یک فایل صوتی!
- 📴 **کاملاً آفلاین** — موتور فیزیک داخل `vendor/`، و اگر عکسی لود نشود کاراکتر جایگزین خودکار ساخته می‌شود
- 📱 **اول موبایل** — لمس + موس، canvas واکنش‌گرا، نمای ۱۸۰ درجه

### 🤝 مشارکت

باگ لق پیدا کردی؟ ایده برین‌رات جدید داری؟ پول‌ریکوئست و اسپرایت جدید برای `characters/*.png` همیشه خوش‌آمد است — PNG مربعی با پس‌زمینه شفاف بهترین چیدمان را دارد!

با 💚 و Matter.js ساخته شد. خوش بگذره — و سعی کن چیزی نیفته! 😬

</div>
