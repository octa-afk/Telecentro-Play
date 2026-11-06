import { firefox } from 'playwright-core';

const browser = await firefox.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));

await page.goto(new URL('../../Simulador-TPlay.html', import.meta.url).href);
await page.waitForTimeout(300);

const snapshot = () => page.evaluate(() => {
  const sub = document.getElementById('settingsNav');
  const sis = document.getElementById('sistemaNav');
  const activeSub = document.querySelector('.subnav-item.active');
  const firstSis = document.querySelector('.sistema-option');
  const activeSis = document.querySelector('.sistema-option.active');
  const rel = (nav, el) => {
    if (!el) return null;
    const nr = nav.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return Math.round((er.left + er.width / 2) - (nr.left + nr.width / 2));
  };
  const visible = (nav) => {
    const nr = nav.getBoundingClientRect();
    return [...nav.children]
      .filter(i => { const r = i.getBoundingClientRect(); return r.left > nr.left - 5 && r.right < nr.right + 5; })
      .map(i => i.textContent.trim());
  };
  return {
    classes: document.querySelector('.decoder').className,
    subScroll: Math.round(sub.scrollLeft),
    subDisplay: getComputedStyle(sub).display,
    activeSub: activeSub ? activeSub.textContent.trim() : null,
    activeSubCenterRel: rel(sub, activeSub),
    subVisible: visible(sub),
    sisScroll: Math.round(sis.scrollLeft),
    sisDisplay: getComputedStyle(sis).display,
    activeSis: activeSis ? activeSis.textContent.trim() : null,
    firstSisCenterRel: rel(sis, firstSis),
    activeSisCenterRel: rel(sis, activeSis),
    sisVisible: visible(sis),
  };
});

async function press(key) {
  await page.keyboard.press(key);
  await page.waitForTimeout(450);
}

// HOME -> AJUSTES
for (let i = 0; i < 6; i++) await press('ArrowRight');
await press('Enter');
console.log('1 en Ajustes:', JSON.stringify(await snapshot(), null, 1));

// subnav: Ajustes usuario -> Sistema
for (let i = 0; i < 4; i++) await press('ArrowRight');
const base = await snapshot(); // estado objetivo: previsualización de Sistema
console.log('2 subnav en Sistema (baseline):', JSON.stringify(base, null, 1));

// entrar a opciones de Sistema
await press('Enter');
console.log('3 opciones Sistema:', JSON.stringify(await snapshot(), null, 1));

// moverse hasta Reset
for (let i = 0; i < 3; i++) await press('ArrowRight');
console.log('4 en Reset:', JSON.stringify(await snapshot(), null, 1));

// entrar a Reset
await press('Enter');
console.log('5 ingreso Reset:', JSON.stringify(await snapshot(), null, 1));

// volver: Reset ahora tiene su propio nivel (opciones), así que el Back
// jerárquico necesita dos pulsaciones: opciones de Reset -> Sistema -> Ajustes
await press('Escape');
await press('Escape');
const after = await snapshot();
console.log('6 vuelta de Reset:', JSON.stringify(after, null, 1));
await page.screenshot({ path: 'shot-reset-back.png' });

// chequeo de expectativas del usuario: volver de Reset debe restaurar el
// estado baseline (Sistema centrado arriba, primera opción centrada abajo)
const topOk = after.subDisplay === 'flex'
  && after.activeSub === 'Sistema'
  && Math.abs(after.subScroll - base.subScroll) <= 10;
const subOk = after.sisDisplay === 'flex'
  && after.activeSis === null
  && Math.abs(after.firstSisCenterRel - base.firstSisCenterRel) <= 10;
console.log('EXPECTATIVA top-menu-sin-resetear:', topOk ? 'OK' : 'FALLA');
console.log('EXPECTATIVA submenu-centrado-en-primera:', subOk ? 'OK' : 'FALLA');
if (!topOk || !subOk) process.exitCode = 1;

await browser.close();
