// Simulador mobile: accesos de Inicio a Películas, Series y Guía de canales.
// Fuente: capturas del teléfono. En esas pantallas la pestaña Más queda marcada; back vuelve a Inicio.
// Capturas opcionales: SHOT_DIR=/ruta node tests/test-mobile-peliculas-series-guia.mjs
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
const all = sel => page.evaluate(s => [...document.querySelectorAll(s)].map(e => e.textContent.trim()), sel);
const count = sel => page.evaluate(s => document.querySelectorAll(s).length, sel);
const activeScreen = () => page.evaluate(() => document.querySelector('.screen.is-active')?.id);
const activeTab = () => page.evaluate(() => document.querySelector('.tab.is-active')?.textContent.trim());
const click = async sel => { await page.locator(sel).first().click(); await page.waitForTimeout(80); };
const press = async key => { await page.keyboard.press(key); await page.waitForTimeout(80); };

// ── Películas ──
await click('#sec-inicio .shortcut:has-text("Películas")');
check('Películas abre su pantalla', (await activeScreen()) === 'sec-peliculas');
check('Películas: título', (await text('#sec-peliculas .title')) === 'Películas');
check('Películas: pestaña Más marcada', (await activeTab()) === 'Más');
check('Películas: 5 chips de canales', JSON.stringify(await all('#sec-peliculas .chip')) === JSON.stringify(['VER TODAS', 'SPACE', 'TNT', 'film&arts', 'AMC']));
check('Películas: secciones', JSON.stringify(await all('#sec-peliculas .sec-ttl')) === JSON.stringify(['Las películas que te recomendamos', 'Heroes y Fantasia']));
check('Películas: botón VER y 3 puntos', (await text('#sec-peliculas .btn-ver')) === 'VER' && (await count('#sec-peliculas .dots i')) === 3);
await page.screenshot({ path: join(SHOT_DIR, 'mobile-peliculas.png') });
await press('Escape');
check('Escape vuelve a Inicio', (await activeScreen()) === 'sec-inicio' && (await activeTab()) === 'Inicio');

// ── Series ──
await click('#sec-inicio .shortcut:has-text("Series")');
check('Series abre su pantalla', (await activeScreen()) === 'sec-series');
check('Series: chips con SPACE seleccionado', (await text('#sec-series .chip.sel')) === 'SPACE' && (await count('#sec-series .chip')) === 5);
check('Series: sección Especiales con 1 póster', (await text('#sec-series .sec-ttl')) === 'Especiales' && (await count('#sec-series .pst')) === 1);
await page.screenshot({ path: join(SHOT_DIR, 'mobile-series.png') });
await press('Escape');

// ── Guía de canales ──
await click('#sec-inicio .shortcut:has-text("Guía")');
check('Guía abre su pantalla', (await activeScreen()) === 'sec-guia');
check('Guía: título', (await text('#sec-guia .title')) === 'Guía de canales');
check('Guía: filtros de categoría', JSON.stringify(await all('#sec-guia .g-chip')) === JSON.stringify(['Ver todos', 'Aire', 'Noticias', 'Deportes']));
check('Guía: 6 canales (104 a 109)', JSON.stringify(await all('#sec-guia .g-num')) === JSON.stringify(['104', '105', '106', '107', '108', '109']));
check('Guía: programa seleccionado en CH 105', (await text('#sec-guia .g-cell.sel')).startsWith('Atl. Mineiro (Bra) vs. Boca Jrs. (Arg)'));
check('Guía: horas HOY, 20:30, 21:00, 21:30', JSON.stringify(await all('#sec-guia .g-time span')) === JSON.stringify(['HOY', '20:30', '21:00', '21:30']));
await page.screenshot({ path: join(SHOT_DIR, 'mobile-guia.png') });
await click('.tab[data-tab="inicio"]');
check('pestaña Inicio vuelve a la raíz', (await activeScreen()) === 'sec-inicio');

await browser.close();
console.log(failures === 0 ? 'OK: todo pasa' : `FALLOS: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
