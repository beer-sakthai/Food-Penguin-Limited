#!/usr/bin/env node
// Driver for the Food Penguin Limited sushi-ops dashboard (React + Vite + Express).
//
// Drives the *running* app in a real browser: navigates the dashboard, clicks
// each sidebar tab, screenshots it, and reports whether the page overflows the
// viewport (the dashboard is designed to fit one screen with no page scrollbar,
// so overflow > 1px is a regression).
//
// Prereq: the dev server must already be running (see SKILL.md):
//   npm run dev          # serves the SPA on http://localhost:3000
//
// Usage (from repo root):
//   node .claude/skills/run-food-penguin-limited/driver.mjs                # all tabs
//   node .claude/skills/run-food-penguin-limited/driver.mjs Sell Waste     # specific tabs
//   BASE_URL=http://localhost:3000 VW=1536 VH=864 node .../driver.mjs
//
// Env:
//   BASE_URL    app URL                 (default http://localhost:3000)
//   VW, VH      viewport w/h in px      (default 1536 x 864)
//   CHROME_PATH explicit chromium exe   (default: auto-detect Playwright cache)
//
// Exit code: 0 if every requested tab fits with no page overflow, else 1.

import { chromium } from 'playwright-core';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Sidebar nav labels. "Overview" renders as "Dashboard" in the nav.
const ALL_TABS = ['Overview', 'Sell', 'Target', 'Production', 'Waste', 'Hours', 'Planning', 'Real-time'];
const navLabel = (t) => (t === 'Overview' ? 'Dashboard' : t);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const VW = parseInt(process.env.VW || '1536', 10);
const VH = parseInt(process.env.VH || '864', 10);
const SHOT_DIR = join(dirname(fileURLToPath(import.meta.url)), 'shots');

function resolveChromium() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  // Default Playwright browser cache locations.
  const roots = [
    join(homedir(), 'AppData', 'Local', 'ms-playwright'), // Windows
    join(homedir(), '.cache', 'ms-playwright'),           // Linux
    join(homedir(), 'Library', 'Caches', 'ms-playwright'),// macOS
  ].filter(existsSync);
  for (const root of roots) {
    for (const dir of readdirSync(root)) {
      if (!dir.startsWith('chromium-') || dir.includes('headless')) continue;
      for (const exe of [
        join(root, dir, 'chrome-win64', 'chrome.exe'),
        join(root, dir, 'chrome-linux', 'chrome'),
        join(root, dir, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
      ]) {
        if (existsSync(exe)) return exe;
      }
    }
  }
  throw new Error(
    'No Chromium found. Set CHROME_PATH to a chrome/chromium binary, or run "npx playwright install chromium".'
  );
}

const tabs = process.argv.slice(2).length ? process.argv.slice(2) : ALL_TABS;
mkdirSync(SHOT_DIR, { recursive: true });

const exe = resolveChromium();
console.log(`browser : ${exe}`);
console.log(`target  : ${BASE_URL}  viewport ${VW}x${VH}\n`);

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: VW, height: VH } });
await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

let failed = 0;
for (const tab of tabs) {
  await page.click(`nav button:has-text("${navLabel(tab)}")`).catch(() => { });
  await page.waitForTimeout(350);

  let contentCheckOk = true;
  let contentCheckMsg = '';

  // Special test case for the Real-time AI Copilot tab
  if (tab === 'Real-time') {
    try {
      await page.fill('input[placeholder="Ask the AI Copilot..."]', 'What is the freshness status of our tuna?');
      await page.click('button:has-text("Ask")');
      // Wait for the response container to appear and have some text content
      const responseLocator = page.locator('#copilot-response');
      await responseLocator.waitFor({ state: 'visible', timeout: 15000 });
      const responseText = await responseLocator.innerText();

      contentCheckOk = responseText.length > 10 && !responseText.toLowerCase().includes('error');
      contentCheckMsg = contentCheckOk ? `(AI response OK)` : `(AI response check FAILED: "${responseText.substring(0, 50)}...")`;
    } catch (e) {
      contentCheckOk = false;
      contentCheckMsg = `(AI response check FAILED: ${e.message})`;
    }
  }

  // Special test case for the Kitchen Quality Dish Auditor on the Production tab
  if (tab === 'Production') {
    try {
      // A 1x1 red pixel PNG to use for the upload test
      const redPixelPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');

      // Find the file input and set its value to our virtual PNG
      const fileInput = page.locator('#dish-audit-input');
      await fileInput.setInputFiles({
        name: 'test-dish.png',
        mimeType: 'image/png',
        buffer: redPixelPng,
      });

      const responseLocator = page.locator('#dish-audit-response');
      await responseLocator.waitFor({ state: 'visible', timeout: 20000 }); // Longer timeout for vision model
      const responseText = await responseLocator.innerText();
      contentCheckOk = responseText.length > 10 && !responseText.toLowerCase().includes('error');
      contentCheckMsg = contentCheckOk ? `(Dish audit OK)` : `(Dish audit FAILED: "${responseText.substring(0, 50)}...")`;
    } catch (e) {
      contentCheckOk = false;
      contentCheckMsg = `(Dish audit FAILED: ${e.message})`;
    }
  }

  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    return Math.max(de.scrollHeight - de.clientHeight, document.body.scrollHeight - document.body.clientHeight, 0);
  });
  const file = join(SHOT_DIR, `${tab.replace('/', '')}.png`);
  await page.screenshot({ path: file });
  const layoutOk = overflow <= 1;
  if (!layoutOk || !contentCheckOk) failed++;
  console.log(`${(layoutOk && contentCheckOk) ? 'OK ' : 'XX '} ${tab.padEnd(11)} pageOverflow=${overflow}px ${contentCheckMsg} -> ${file}`);
}

await browser.close();
console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'} (${tabs.length - failed}/${tabs.length} tabs fit, no page scrollbar)`);
process.exit(failed === 0 ? 1 - 1 : 1);
