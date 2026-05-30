import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

const existing = fs.readdirSync(screenshotsDir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'));
const nums = existing.map(f => { const m = f.match(/screenshot-(\d+)/); return m ? parseInt(m[1]) : 0; });
let n = nums.length > 0 ? Math.max(...nums) + 1 : 1;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000?preview', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 500));

const sections = [
  { label: 'hero', y: 0 },
  { label: 'about', y: 992 },
  { label: 'benefits', y: 2200 },
  { label: 'who', y: 3500 },
  { label: 'why', y: 4650 },
  { label: 'community', y: 5950 },
  { label: 'faq', y: 7100 },
  { label: 'cta', y: 7950 },
];

for (const { label, y } of sections) {
  await page.evaluate((scrollY) => window.scrollTo({ top: scrollY, behavior: 'instant' }), y);
  await new Promise(r => setTimeout(r, 250));
  const outPath = path.join(screenshotsDir, `screenshot-${n++}-${label}.png`);
  await page.screenshot({ path: outPath });
  console.log(`Saved: ${outPath}`);
}

await browser.close();
