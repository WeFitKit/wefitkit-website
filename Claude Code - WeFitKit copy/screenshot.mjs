import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotsDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

const existing = fs.readdirSync(screenshotsDir).filter(f => f.startsWith('screenshot-') && f.endsWith('.png'));
const nums = existing.map(f => {
  const m = f.match(/screenshot-(\d+)/);
  return m ? parseInt(m[1]) : 0;
});
const n = nums.length > 0 ? Math.max(...nums) + 1 : 1;
const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const outputPath = path.join(screenshotsDir, filename);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
const previewUrl = url.includes('?') ? url + '&preview' : url + '?preview';
await page.goto(previewUrl, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Saved: ${outputPath}`);
