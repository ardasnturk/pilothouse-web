# Pilothouse website

Landing page and downloads for **Pilothouse**, which drives Claude Code, Codex
and Gemini on your Mac from your iPhone or iPad. English and Turkish.

Live at **https://pilot.ardasnturk.com**

Plain HTML, CSS and a little vanilla JS: no build step, no cookies, no
analytics, system fonts only. The QR code library (`vendor/qrcode.min.js`,
[qrcodejs](https://github.com/davidshimjs/qrcodejs) 1.0.0, MIT) is vendored, so
the only third-party request is the GitHub Releases API call that finds the
latest DMG.

| File | |
|---|---|
| `index.html` | Page and English copy |
| `i18n.js` | Turkish copy (keys match `data-i18n` in `index.html`) |
| `main.js` | Language and theme switch, latest DMG, TestFlight QR, copy buttons |
| `styles.css` | Styles, light and dark |
| `assets/` | Icons, generated from the app repository |

The page accepts `?lang=en` or `?lang=tr`; without it the saved choice, then
the browser language is used.

## Settings

Both live at the top of `main.js`:

* `REPO` — this repository (`ardasnturk/pilothouse-web`), which also holds the
  Mac release DMGs. The download button resolves the newest `.dmg` asset
  through the GitHub Releases API and falls back to
  `https://github.com/<REPO>/releases/latest`. The Homebrew command shown on the
  page is built from it too.
* `TESTFLIGHT_URL` — the public TestFlight link; the page draws its QR code.
  `assets/testflight-qr.png` is the same code as an image for sharing.
* `TESTFLIGHT_READY` — `false` hides the QR code and says the iPhone app is
  coming instead.

## Development

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

The icons come from the app repository (`docs/icon.png`) — never edit them here:

```bash
scripts/sync-from-app.sh   # expects the app at ../pilot-house, or PILOTHOUSE_APP=/path/to/pilot-house
```

## Publishing with GitHub Pages

1. Push this repository to `ardasnturk/pilothouse-web` (public).
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from
   a branch**, branch **main**, folder **/ (root)** → **Save**.
3. Custom domain: **pilot.ardasnturk.com** (Pages → Custom domain; the `CNAME`
   file in this repo). Keep **Enforce HTTPS** on.

`.nojekyll` makes Pages serve the files as they are.
