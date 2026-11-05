import { firefox } from 'playwright-core';

const browser = await firefox.launch();
const page = await browser.newPage();
page.on('console', m => console.log('PAGE:', m.text()));
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto('file:///home/octa/Descargas/tplay/deco_v2.html');
await page.waitForTimeout(300);

console.log('handleKeydown exists:', await page.evaluate(() => typeof window.handleKeydown));
console.log('active nav:', await page.evaluate(() => document.querySelector('.nav-item.active')?.textContent));

// check listeners: dispatch a keydown manually
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(300);
console.log('active nav after ArrowRight:', await page.evaluate(() => document.querySelector('.nav-item.active')?.textContent));

const info = await page.evaluate(() => {
  let fired = false;
  document.addEventListener('keydown', () => { fired = true; }, { once: true });
  return { fired };
});
await page.keyboard.press('ArrowLeft');
await page.waitForTimeout(100);
console.log('keydown reaches document:', info, await page.evaluate(() => true));

await browser.close();
