# Paise — Money Manager

An aesthetic, offline-first money tracker built as a Progressive Web App (PWA). Track income from freelancing, painting, commissions, websites, shop sales, design agency work and more. Set monthly targets, spending budgets, percentage-of-income limits, and watch animated charts of your hustle.

Built in vanilla HTML/CSS/JS — no build step, no backend, no tracking. Your data lives on your phone.

## Features

- **Dashboard** with monthly net balance, animated goal ring, spending limit bar
- **Income tracking** by category — Freelancing, Painting, Commissions, Websites, Shops, Design Agency, plus custom categories you can add
- **Expense tracking** with budget categories and per-category percentage limits
- **Monthly target** and **monthly budget** you can edit any time
- **Percentage spend-limit alert** (e.g. "warn me when expenses cross 60% of income")
- **6-month bar chart** of income vs expenses + animated donut breakdowns by category
- **Insights** that highlight trends, top earners and top spenders
- **Profile** with lifetime stats and editable name
- **Settings** — Light / Dark / Auto theme + 5 accent colors + haptics toggle
- **Export / Import** your data as a JSON backup
- **Offline-capable** via service worker — works without internet after first load
- **Installable** on iOS and Android as a standalone app

## Install on your phone

1. **Host the folder.** Easiest way: drop the whole `money-manager/` folder into any free static host:
   - **GitHub Pages** (push to a repo and enable Pages — already pushed if you got this from Claude Code on the web)
   - **Netlify Drop** — drag-and-drop at https://app.netlify.com/drop
   - **Vercel** / **Cloudflare Pages** / **Surge** — any static host works
   - Or run locally on your laptop and visit from your phone on the same Wi‑Fi:
     ```bash
     cd money-manager
     python3 -m http.server 8000
     # then on your phone visit http://<your-laptop-ip>:8000
     ```

2. **Open the URL on your phone in a real browser** (Safari on iOS, Chrome on Android — not in-app browsers like Instagram's).

3. **Add to Home Screen.**
   - **iOS / Safari:** tap the Share icon → *Add to Home Screen* → *Add*
   - **Android / Chrome:** tap the ⋮ menu → *Install app* (or *Add to Home Screen*)

It will install as a standalone app with its own icon. Open it like any native app — it'll work offline.

## Tech notes

- 100% client-side. State persisted in `localStorage` under `paise.v1`.
- Single SVG/PNG icon set in `icons/`. Manifest at `manifest.webmanifest`. Service worker at `sw.js`.
- All charts are hand-rendered SVG with native animation — no Chart.js dependency.
- iOS-design-language inspired: SF system font, glass-blur header & tab bar, rounded cards, segmented controls, sheet drag-to-dismiss, haptics on supported devices.

## Customizing

Edit `js/app.js` to tweak the default categories at the top of the file (`DEFAULT_INCOME_CATS`, `DEFAULT_EXPENSE_CATS`). Edit `css/styles.css` to change tokens — colors, blur, shadows, radii.

## Data ownership

Your data never leaves your device. Export a JSON backup any time from **Settings → Data → Export**. Reset wipes everything irreversibly.
