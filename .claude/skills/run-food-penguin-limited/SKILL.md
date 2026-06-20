---
name: run-food-penguin-limited
description: Build, launch, and drive the Food Penguin Limited sushi-ops dashboard (React + Vite + Express). Use to run/start the app, screenshot a dashboard tab, smoke-test that every page fits one viewport with no scrollbar, or hit the Gemini backend API.
---

# Run: Food Penguin Limited (sushi-ops dashboard)

A single-page React dashboard (Tailwind + Recharts) served by an Express
backend (`server.ts`) that also exposes 5 Gemini AI routes. In dev, Express
mounts Vite as middleware and serves the SPA on **http://localhost:3000**.

The app is driven by **`.claude/skills/run-food-penguin-limited/driver.mjs`** —
it launches a real Chromium (via `playwright-core`), clicks each sidebar tab,
screenshots it to `shots/`, and asserts the page fits the viewport with no
scrollbar (the dashboard is built to fit one screen per tab). All paths below
are relative to the repo root.

Verified on **Windows 11 / PowerShell** (this repo's host). Node was not on
PATH initially; the first Prerequisites step fixes that.

## Prerequisites

```bash
# Node 18+ (this session used v24.17.0, installed via winget):
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --silent
```

PowerShell sessions started before the install won't see Node — prepend it for
the current shell (every command block below assumes Node is on PATH):

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

A Chromium binary is required for the driver. `playwright-core` does **not**
download one; the driver auto-detects a browser in the Playwright cache
(`%USERPROFILE%\AppData\Local\ms-playwright\chromium-*`). If none exists, set
`CHROME_PATH` to any Chrome/Chromium executable (see Gotchas).

## Build / setup

```bash
npm install        # installs deps incl. playwright-core (driver dependency)
npm run lint       # tsc --noEmit — type-checks; expect no output on success
```

## Run (agent path) — drive the running app

Two steps: start the server, then run the driver.

1. Start the dev server **in the background** (it blocks while running). Setting
   `DISABLE_HMR=true` avoids file-watch churn during automated runs:

   ```powershell
   $env:DISABLE_HMR='true'; npm run dev      # serves http://localhost:3000
   ```

   Wait until it answers (Git Bash is available on this host — prints
   `server up (HTTP 200) after Ns`):

   ```bash
   for i in $(seq 1 15); do
     [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)" = "200" ] \
       && { echo "server up (HTTP 200) after ${i}s"; break; }; sleep 1
   done
   ```

2. Run the driver (from repo root):

   ```bash
   node .claude/skills/run-food-penguin-limited/driver.mjs              # all 8 tabs
   node .claude/skills/run-food-penguin-limited/driver.mjs Sell Waste   # specific tabs
   ```

   Output: one line per tab with `pageOverflow=<px>` and the screenshot path,
   then `PASS (n/n tabs fit, no page scrollbar)`. Screenshots land in
   `.claude/skills/run-food-penguin-limited/shots/` (gitignored). Exit code is
   0 only if every requested tab has 0px page overflow — use it as a smoke test.

   Tab names: `Overview Sell Target Production Waste Hours Planning Real-time`
   (`Overview` is labeled "Dashboard" in the sidebar; the driver maps it).

   Env overrides: `BASE_URL`, `VW`/`VH` (viewport), `CHROME_PATH`. Example:

   ```powershell
   $env:CHROME_PATH = "C:\Users\beern\AppData\Local\ms-playwright\chromium-1228\chrome-win64\chrome.exe"
   node .claude/skills/run-food-penguin-limited/driver.mjs Overview
   ```

### Smoke-test the backend API

The 5 Gemini routes run in **simulation mode** when `GEMINI_API_KEY` is unset
(no key needed to verify the server). Example:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/gemini/low-latency-cmd `
  -Method Post -ContentType 'application/json' `
  -Body '{"command":"prep status for the tuna freezer"}'
```

Returns a `⚡ [Lite Simulation Mode] ...` sushi response. Other routes:
`/api/gemini/strategic-advisor` (`{prompt}`), `/generate-marketing-image`
(`{prompt,aspectRatio}`), `/analyze-dish-photo` (`{imageBase64,mimeType}`),
`/search-trends` (`{query}`).

## Run (human path)

```powershell
$env:DISABLE_HMR='true'; npm run dev   # then open http://localhost:3000 in a browser
```

Useless headless — there's no window to look at; use the driver instead.
Production build is `npm run build` (Vite + esbuild bundle) then `npm run start`.

## Gotchas

- **The server must be running before the driver.** The driver only drives the
  browser; it does not start the app. Start `npm run dev` first and wait for
  HTTP 200.
- **`playwright-core` ships no browser.** It's intentionally lean. This host
  already had a Chromium in the Playwright cache (`chromium-1228`), which the
  driver auto-detects. On a clean machine with no cache, point `CHROME_PATH` at
  any Chrome/Chromium binary, or install the full `playwright` package and run
  its `install chromium` step.
- **Node may be missing from PATH** even after install — winget doesn't refresh
  an already-open shell. Prepend `C:\Program Files\nodejs` (see Prerequisites).
- **AI buttons "fail" without a key, by design.** Routes return simulation JSON
  when `GEMINI_API_KEY` is unset, so the UI works fully offline; real AI needs a
  key in `.env` (`GEMINI_API_KEY=...`).
- **Dashboard fits one viewport on purpose.** Each tab is locked to the screen
  with internal hidden-scrollbar regions; `pageOverflow > 1px` from the driver
  means a layout regression, not "expected scrolling."
- **Stop the background server when done:** find the listener and kill it —
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000 -State Listen).OwningProcess -Force
  ```

## Troubleshooting

- `'npm' is not recognized` / `node` not found → Node isn't on PATH; run the
  PowerShell PATH line in Prerequisites (or open a fresh shell after install).
- Driver: `No Chromium found` → no browser in the Playwright cache; set
  `CHROME_PATH` to a Chrome/Chromium executable.
- Driver hangs on `page.goto` / connection refused → the dev server isn't up
  yet; re-run the HTTP-200 wait loop before the driver.
- `EADDRINUSE :3000` → a previous `npm run dev` is still listening; kill it with
  the Stop-Process line above, then restart.
