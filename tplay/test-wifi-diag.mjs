import { firefox } from 'playwright-core';

const browser = await firefox.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto('file:///home/octa/Descargas/tplay/deco_v2.html');
await page.waitForTimeout(500);

async function press(key, n = 1, delay = 450) {
  for (let i = 0; i < n; i++) {
    await page.keyboard.press(key);
    await page.waitForTimeout(delay);
  }
}

await press('ArrowRight', 6);
await press('Enter');
await press('ArrowRight', 4);
await press('Enter');
await press('ArrowRight');
await press('Enter');
await press('ArrowRight');
await press('Enter');

await page.waitForTimeout(500);

const diag = await page.evaluate(() => {
  const dec = document.querySelector('.decoder');
  const screen = document.getElementById('wifiScreen');
  const con = document.getElementById('conexionNav');
  const sis = document.getElementById('sistemaNav');
  return {
    decoderClasses: dec ? dec.className : null,
    screenDisplay: screen ? getComputedStyle(screen).display : null,
    conDisplay: con ? getComputedStyle(con).display : null,
    sisDisplay: sis ? getComputedStyle(sis).display : null,
    url: window.location.href,
  };
});
console.log('Diagnóstico:', JSON.stringify(diag, null, 2));

await page.screenshot({ path: 'shot-wifi-diag.png', fullPage: true });
console.log('Screenshot: shot-wifi-diag.png');

await browser.close();
