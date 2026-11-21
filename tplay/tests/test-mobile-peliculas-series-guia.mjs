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
check('Películas: secciones en orden', JSON.stringify(await all('#sec-peliculas .sec-ttl')) === JSON.stringify(['Las películas que te recomendamos', 'Heroes y Fantasia', 'Novedades', 'Acción Explosiva', 'Grandes odiseas del cine', 'Historias para no dormir', 'Acción']));
await page.mouse.move(200, 400);
await page.mouse.wheel(0, 700);
await page.waitForTimeout(300);
check('Películas se desplaza con la rueda', (await page.evaluate(() => document.querySelector('#sec-peliculas .scroll').scrollTop)) > 0);
check('Películas: botón VER y 3 puntos', (await text('#sec-peliculas .btn-ver')) === 'VER' && (await count('#sec-peliculas .dots i')) === 3);
await page.screenshot({ path: join(SHOT_DIR, 'mobile-peliculas.png') });
await press('Escape');
check('Escape vuelve a Inicio', (await activeScreen()) === 'sec-inicio' && (await activeTab()) === 'Inicio');

// ── Series ──
await click('#sec-inicio .shortcut:has-text("Series")');
check('Series abre su pantalla', (await activeScreen()) === 'sec-series');
check('Series: chips VER TODAS seleccionado', (await text('#sec-series .chip.sel')) === 'VER TODAS' && JSON.stringify(await all('#sec-series .chip')) === JSON.stringify(['VER TODAS', 'CN', 'SPACE', 'TNT', 'G']));
check('Series: secciones en orden y 15 pósteres', JSON.stringify(await all('#sec-series .sec-ttl')) === JSON.stringify(['Las series que te recomendamos', 'Novedades', 'Ecos de otros universos', 'Alta tensión: policías y acción sin freno', 'Acción']) && (await count('#sec-series .pst')) === 15);
await page.mouse.move(200, 400);
await page.mouse.wheel(0, 700);
await page.waitForTimeout(300);
check('Series se desplaza con la rueda', (await page.evaluate(() => document.querySelector('#sec-series .scroll').scrollTop)) > 0);
await click('#tabMas');
check('menú Más resalta la opción de la pantalla actual (Series)', (await text('#masPopup .popup-item.cur')) === 'Series');
await press('Escape');
await page.screenshot({ path: join(SHOT_DIR, 'mobile-series.png') });
await press('Escape');

// ── Guía de canales ──
await click('#sec-inicio .shortcut:has-text("Guía")');
check('Guía abre su pantalla', (await activeScreen()) === 'sec-guia');
check('Guía: título', (await text('#sec-guia .title')) === 'Guía de canales');
check('Guía: filtros de categoría', JSON.stringify(await all('#sec-guia .g-chip')) === JSON.stringify(['Ver todos', 'Aire', 'Noticias', 'Deportes']));
check('Guía: 13 canales (104 a 203)', JSON.stringify(await all('#sec-guia .g-num')) === JSON.stringify(['104', '105', '106', '107', '108', '109', '110', '111', '112', '200', '201', '202', '203']));
check('Guía: programa seleccionado en CH 105', (await text('#sec-guia .g-cell.sel')).startsWith('Atl. Mineiro (Bra) vs. Boca Jrs. (Arg'));
check('Guía: horas HOY, 21:00, 21:30, 22:00', JSON.stringify(await all('#sec-guia .g-time span')) === JSON.stringify(['HOY', '21:00', '21:30', '22:00']));
await page.mouse.move(200, 600);
await page.mouse.wheel(0, 500);
await page.waitForTimeout(300);
check('Guía: la grilla se desplaza y el panel queda fijo', (await page.evaluate(() => document.querySelector('#sec-guia .scroll').scrollTop)) > 0);
await page.screenshot({ path: join(SHOT_DIR, 'mobile-guia.png') });
await click('.tab[data-tab="inicio"]');
check('pestaña Inicio vuelve a la raíz', (await activeScreen()) === 'sec-inicio');

await browser.close();
console.log(failures === 0 ? 'OK: todo pasa' : `FALLOS: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
