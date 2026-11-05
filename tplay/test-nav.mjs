import { firefox } from 'playwright-core';

const browser = await firefox.launch();
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto('file:///home/octa/Descargas/tplay/deco_v2.html');
await page.waitForTimeout(300);

const activeNav = () => page.evaluate(() => document.querySelector('.nav-item.active')?.textContent);
const state = () => page.evaluate(() => ({
  classes: document.querySelector('.decoder').className,
  activeNav: document.querySelector('.nav-item.active')?.textContent,
  activeSub: document.querySelector('.subnav-item.active')?.textContent || null,
  subScroll: Math.round(document.getElementById('settingsNav').scrollLeft),
  firstSubOffset: document.querySelector('.subnav-item')?.offsetLeft ?? null,
  navScroll: Math.round(document.getElementById('navBar').scrollLeft),
}));

async function press(key) {
  await page.keyboard.press(key);
  await page.waitForTimeout(450);
}

// HOME -> AJUSTES (6 rights)
for (let i = 0; i < 6; i++) await press('ArrowRight');
console.log('1 nav:', await activeNav());

await press('Enter');
console.log('2 enter settings:', await state());

// go right to the LAST subnav item ("Sistema") to force scrolling
for (let i = 0; i < 4; i++) await press('ArrowRight');
const onSistema = await state();
console.log('3 on Sistema (scrolled?):', onSistema);

// Enter -> sistema options
await press('Enter');
console.log('4 enter sistema:', await page.evaluate(() => ({
  classes: document.querySelector('.decoder').className,
  sistemaScroll: Math.round(document.getElementById('sistemaNav').scrollLeft),
})));

// Back from sistema -> should center FIRST subnav item
await press('Escape');
await page.waitForTimeout(600);
console.log('5 BACK sistema->subnav:', await state());

// Enter sistema again, then right to Conexion, enter, back
await press('ArrowRight');
await press('Enter'); // enter sistema options again
await press('ArrowRight');
await press('Enter'); // enter conexion
console.log('6 in conexion:', await page.evaluate(() => document.querySelector('.decoder').className));
await press('Escape');
console.log('7 BACK conexion->sistema:', await page.evaluate(() => ({
  classes: document.querySelector('.decoder').className,
  sistemaScroll: Math.round(document.getElementById('sistemaNav').scrollLeft),
  firstOffset: document.querySelector('.sistema-option').offsetLeft,
})));

await browser.close();
