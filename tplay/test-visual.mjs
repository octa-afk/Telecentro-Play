import { firefox } from 'playwright-core';
import { writeFileSync } from 'fs';

const browser = await firefox.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('file:///home/octa/Descargas/tplay/deco_v2.html');
await page.waitForTimeout(300);

const state = () => page.evaluate(() => {
  const sub = document.getElementById('settingsNav');
  const first = document.querySelector('.subnav-item');
  const r = first.getBoundingClientRect();
  const sr = sub.getBoundingClientRect();
  return {
    classes: document.querySelector('.decoder').className,
    activeSub: document.querySelector('.subnav-item.active')?.textContent || null,
    subScroll: Math.round(sub.scrollLeft),
    firstItemCenterRel: Math.round((r.left + r.width / 2) - (sr.left + sr.width / 2)),
    visibleSubText: [...sub.querySelectorAll('.subnav-item')]
      .filter(i => { const ir = i.getBoundingClientRect(); return ir.left > sr.left && ir.right < sr.right; })
      .map(i => i.textContent).join(' | '),
  };
});

async function press(key) {
  await page.keyboard.press(key);
  await page.waitForTimeout(500);
}

// HOME -> AJUSTES
for (let i = 0; i < 6; i++) await press('ArrowRight');
await press('Enter'); // into settings
await press('ArrowRight'); // -> Video
await press('ArrowRight'); // -> Visita
await press('ArrowRight'); // -> Grabaciones
await press('ArrowRight'); // -> Sistema (scrolled)
console.log('A on Sistema:', await state());

await press('Escape'); // back to main menu
const s1 = await state();
console.log('B BACK to main:', s1);
await page.screenshot({ path: 'shot-B-back-main.png' });

// re-enter settings and go into Sistema options, then back
await press('Enter');
console.log('C re-enter settings:', await state());
await press('Enter'); // enter submenu level (Sistema active -> sistema options)
const s2 = await page.evaluate(() => ({
  classes: document.querySelector('.decoder').className,
  sistemaScroll: Math.round(document.getElementById('sistemaNav').scrollLeft),
}));
console.log('D in sistema options:', s2);

await press('Escape');
const s3 = await page.evaluate(() => {
  const nav = document.getElementById('settingsNav');
  const first = document.querySelector('.subnav-item');
  const r = first.getBoundingClientRect();
  const nr = nav.getBoundingClientRect();
  return {
    classes: document.querySelector('.decoder').className,
    activeSub: document.querySelector('.subnav-item.active')?.textContent || null,
    subScroll: Math.round(nav.scrollLeft),
    firstCenterRel: Math.round((r.left + r.width / 2) - (nr.left + nr.width / 2)),
  };
});
console.log('E BACK sistema->subnav:', s3);
await page.screenshot({ path: 'shot-E-back-subnav.png' });

console.log('errors:', errors);
writeFileSync('state-log.json', JSON.stringify({ s1, s2, s3 }, null, 2));
await browser.close();
