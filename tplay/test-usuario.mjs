import { firefox } from 'playwright-core';

const browser = await firefox.launch();
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto('file:///home/octa/Descargas/tplay/deco_v2.html');
await page.waitForTimeout(300);

const state = () => page.evaluate(() => ({
  classes: document.querySelector('.decoder').className,
  activeSub: document.querySelector('.subnav-item.active')?.textContent || null,
  subScroll: Math.round(document.getElementById('settingsNav').scrollLeft),
  activeOpt: document.querySelector('.settings-option.active')?.textContent || null,
  optScroll: Math.round(document.getElementById('userNav').scrollLeft),
  activeGen: document.querySelector('.general-option.active')?.textContent || null,
  genScroll: Math.round(document.getElementById('generalNav').scrollLeft),
}));

async function press(key) {
  await page.keyboard.press(key);
  await page.waitForTimeout(450);
}

// HOME -> AJUSTES -> enter
for (let i = 0; i < 6; i++) await press('ArrowRight');
await press('Enter');
console.log('1 settings:', await state());

// enter "Ajustes usuario" (already active) -> usuario options
await press('Enter');
console.log('2 usuario entered:', await state());

// move to last option "Grupo de canales"
for (let i = 0; i < 3; i++) await press('ArrowRight');
console.log('3 on last option:', await state());

// enter "General"? we are on Grupo de canales, back first via ATRAS button
// move back to General and enter
for (let i = 0; i < 3; i++) await press('ArrowLeft');
await press('Enter'); // enter general options
console.log('4 general entered:', await state());

// move right in general options
await press('ArrowRight');
await press('ArrowRight');
console.log('5 on general option:', await state());

// BACK from general -> should center FIRST user option
await page.click('[data-remote="back"]');
await page.waitForTimeout(600);
console.log('6 BACK general->userOptions (button):', await state());

// BACK from user options -> should center FIRST subnav
await page.click('[data-remote="back"]');
await page.waitForTimeout(600);
console.log('7 BACK userOptions->subnav (button):', await state());

// BACK from subnav -> main menu
await page.click('[data-remote="back"]');
await page.waitForTimeout(600);
console.log('8 BACK subnav->main (button):', await state());

await browser.close();
