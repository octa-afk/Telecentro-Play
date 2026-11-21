// Simulador mobile: pestaña Mi contenido (estado vacío) y su botón "Explorá el contenido de T-Play".
// Fuente: captura del teléfono (cuenta sin contenido). El botón lleva a Inicio.
// Capturas opcionales: SHOT_DIR=/ruta node tests/test-mobile-mi-contenido.mjs
import { firefox } from 'playwright-core';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SHOT_DIR = process.env.SHOT_DIR || tmpdir();
const browser = await firefox.launch();
const page = await browser.newPage({ viewport: { width: 400, height: 820 } });
let failures = 0;
page.on('pageerror', e => { console.log('PAGEERROR:', e.message); failures++; });
await page.goto(new URL('../../Simulador-TPlay-mobile.html', import.meta.url).href);
await page.waitForTimeout(300);

const check = (name, ok, extra = '') => {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (ok ? '' : ' ' + extra));
  if (!ok) failures++;
};
const text = sel => page.evaluate(s => document.querySelector(s)?.textContent.trim(), sel);
const activeScreen = () => page.evaluate(() => document.querySelector('.screen.is-active')?.id);
const activeTab = () => page.evaluate(() => document.querySelector('.tab.is-active')?.textContent.trim());
const click = async sel => { await page.locator(sel).first().click(); await page.waitForTimeout(80); };
const press = async key => { await page.keyboard.press(key); await page.waitForTimeout(80); };

// ── Entrada por la pestaña ──
await click('.tab[data-tab="micontenido"]');
check('Mi contenido abre su pantalla', (await activeScreen()) === 'sec-mi-contenido');
check('Mi contenido: pestaña activa', (await activeTab()) === 'Mi contenido');
check('Mi contenido: título', (await text('#sec-mi-contenido .title')) === 'Mi contenido');
check('Mi contenido: título del estado vacío', (await text('#sec-mi-contenido .empty-title')) === '¡Accedé a T-Play desde tus dispositivos!');
check('Mi contenido: texto con Continuar viendo, Grabaciones y Favoritos', await page.evaluate(() => {
  const t = document.querySelector('#sec-mi-contenido .empty-text');
  return ['Continuar viendo', 'Grabaciones', 'Favoritos'].every(w => t.textContent.includes(w));
}));
check('Mi contenido: ilustración presente', (await page.evaluate(() => !!document.querySelector('#sec-mi-contenido .empty-art circle'))));
check('Mi contenido: botón "Explorá el contenido de T-Play"', (await text('#sec-mi-contenido .btn-explore')) === 'Explorá el contenido de T-Play');
await page.screenshot({ path: join(SHOT_DIR, 'mobile-mi-contenido.png') });

// ── Engranaje y back ──
await click('#sec-mi-contenido .gear');
check('engranaje abre Configuración', (await activeScreen()) === 'sec-configuracion');
await press('Escape');
check('Escape vuelve a Mi contenido', (await activeScreen()) === 'sec-mi-contenido');

// ── Botón Explorá vuelve a Inicio ──
await click('#sec-mi-contenido .btn-explore');
check('Explorá lleva a Inicio', (await activeScreen()) === 'sec-inicio');
check('Explorá: pestaña Inicio activa', (await activeTab()) === 'Inicio');

await browser.close();
console.log(failures === 0 ? 'OK: todo pasa' : `FALLOS: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
