// Simulador mobile: reproductor de TV en vivo (menú de controles), abierto al tocar un canal.
// Fuente: imágenes de referencia de la tienda; el video es simulado.
// Capturas opcionales: SHOT_DIR=/ruta node tests/test-mobile-reproductor.mjs
import { firefox } from 'playwright-core';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SHOT_DIR = process.env.SHOT_DIR || tmpdir();
const browser = await firefox.launch();
const page = await browser.newPage({ viewport: { width: 820, height: 820 } });
let failures = 0;
page.on('pageerror', e => { console.log('PAGEERROR:', e.message); failures++; });
await page.goto(new URL('../Simulador-TPlay-mobile.html', import.meta.url).href);
await page.waitForTimeout(300);

const check = (name, ok, extra = '') => {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (ok ? '' : ' ' + extra));
  if (!ok) failures++;
};
const text = sel => page.evaluate(s => document.querySelector(s)?.textContent.trim(), sel);
const has = (sel, cls) => page.evaluate(([s, c]) => document.querySelector(s).classList.contains(c), [sel, cls]);
const activeScreen = () => page.evaluate(() => document.querySelector('.screen.is-active')?.id);
const click = async sel => { await page.locator(sel).first().click(); await page.waitForTimeout(80); };
const press = async key => { await page.keyboard.press(key); await page.waitForTimeout(80); };

await click('.tab[data-tab="tv"]');
await click('#sec-tv-en-vivo .tv-grupo .card >> nth=2');
check('tocar un canal abre el reproductor', (await activeScreen()) === 'sec-reproductor');
check('muestra canal y programa de la tarjeta', (await text('#plCh')) === 'CH 13' && (await text('#plNm')) === 'Fin de semana');
check('barra inferior oculta', await page.evaluate(() => getComputedStyle(document.getElementById('tabbar')).display === 'none'));
check('pastillas superiores', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.pl-pill')].map(e => e.textContent.trim()))) === JSON.stringify(['Audio / Subtítulos', 'Ver desde el inicio', 'Volver al vivo']));
await page.screenshot({ path: join(SHOT_DIR, 'mobile-reproductor.png') });
await click('#plPause');
check('pausar muestra el ícono play', await has('#plLand', 'is-paused'));
await click('#plPause');
check('reanudar quita la pausa', !(await has('#plLand', 'is-paused')));
await click('#plLive');
check('Volver al vivo restablece', !(await has('#plLand', 'is-delayed')));
await click('#plBack10');
check('Retroceder 10 pasa a diferido', await has('#plLand', 'is-delayed'));
await page.mouse.click(200, 300);
await page.waitForTimeout(80);
check('tocar el video oculta los controles', await has('#plLand', 'hide-ctl'));
await page.mouse.click(200, 300);
check('tocar de nuevo los muestra', !(await has('#plLand', 'hide-ctl')));
await click('.pl-back');
check('‹ vuelve a TV en vivo', (await activeScreen()) === 'sec-tv-en-vivo');
check('barra inferior de vuelta', await page.evaluate(() => getComputedStyle(document.getElementById('tabbar')).display !== 'none'));
await click('#sec-tv-en-vivo .seg[data-seg="listado"]');
await click('#sec-tv-en-vivo .tv-listado .card >> nth=0');
check('desde el listado también abre', (await activeScreen()) === 'sec-reproductor' && (await text('#plCh')) === 'CH 1');
await press('Escape');
check('Esc vuelve', (await activeScreen()) === 'sec-tv-en-vivo');

await click('#sec-tv-en-vivo .tv-listado .card >> nth=1');
await click('#plChUp');
check('CH ▲ pasa al canal siguiente', (await text('#plCh')) === 'CH 3' && (await text('#plNm')) === 'Sábado en TN');
await click('#plChDown'); await click('#plChDown'); await click('#plChDown');
check('CH ▼ da la vuelta al último canal', (await text('#plCh')) === 'CH 1071', await text('#plCh'));
await click('#plChUp');
check('CH ▲ da la vuelta al primero', (await text('#plCh')) === 'CH 1', await text('#plCh'));
await press('Escape');
await click('.tab[data-tab="inicio"]');
await click('#sec-inicio .card >> nth=0');
check('desde Inicio también abre', (await activeScreen()) === 'sec-reproductor' && (await text('#plCh')) === 'CH 105');
await press('Escape');
check('Esc vuelve a Inicio', (await activeScreen()) === 'sec-inicio');
await click('#tabMas');
await click('.popup-item[data-target="sec-guia"]');
await click('#sec-guia .g-row >> nth=1 >> .g-cell >> nth=0');
check('desde la Guía abre con su canal', (await activeScreen()) === 'sec-reproductor' && /^CH \d+$/.test(await text('#plCh')));

await browser.close();
console.log(failures ? failures + ' fallas' : 'OK');
process.exit(failures ? 1 : 0);
