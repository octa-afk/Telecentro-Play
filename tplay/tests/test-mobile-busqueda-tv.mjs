// Simulador mobile: pestañas Buscar y TV en vivo (grupo y listado) y menú Más (flotante).
// Fuente: capturas del teléfono (Búsqueda, TV en vivo › Grupo de canales / Listado de canales, Más).
// Capturas opcionales: SHOT_DIR=/ruta node tests/test-mobile-busqueda-tv.mjs
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
const count = sel => page.evaluate(s => document.querySelectorAll(s).length, sel);
const visibleCount = sel => page.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.getClientRects().length > 0).length, sel);
const activeScreen = () => page.evaluate(() => document.querySelector('.screen.is-active')?.id);
const activeTab = () => page.evaluate(() => document.querySelector('.tab.is-active')?.textContent.trim());
const click = async sel => { await page.locator(sel).first().click(); await page.waitForTimeout(80); };
const press = async key => { await page.keyboard.press(key); await page.waitForTimeout(80); };
const popupOpen = () => page.evaluate(() => document.getElementById('masPopup').classList.contains('is-open'));

// ── Pestaña Buscar ──
await click('.tab[data-tab="buscar"]');
check('Buscar abre su pantalla', (await activeScreen()) === 'sec-busqueda');
check('Buscar: pestaña activa', (await activeTab()) === 'Buscar');
check('Buscar: título', (await text('#sec-busqueda .title')) === 'Búsqueda');
check('Buscar: campo con placeholder', (await text('#sec-busqueda .search')) === '¿Qué estás buscando?');
check('Buscar: 2 búsquedas recientes con ✕', (await count('#sec-busqueda .recent-row .x')) === 2);
await page.screenshot({ path: join(SHOT_DIR, 'mobile-busqueda.png') });
await click('#sec-busqueda .gear');
check('Buscar: engranaje abre Configuración', (await activeScreen()) === 'sec-configuracion');
await press('Escape');
check('Escape vuelve a Búsqueda', (await activeScreen()) === 'sec-busqueda');

// ── TV en vivo: grupo por defecto ──
await click('.tab[data-tab="tv"]');
check('TV en vivo abre su pantalla', (await activeScreen()) === 'sec-tv-en-vivo');
check('TV en vivo: pestaña activa', (await activeTab()) === 'TV en vivo');
check('TV en vivo: "Grupo de canales" activo por defecto', (await text('#sec-tv-en-vivo .seg.is-active')) === 'Grupo de canales');
check('Grupo: 11 grupos en orden', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#sec-tv-en-vivo .grp-title')].map(e => e.textContent.trim()))) === JSON.stringify(['Aire', 'Noticias', 'Deportes', 'Infantil', 'Películas', 'Series', 'Música', 'Pack fútbol', 'Documentales', 'Entretenimiento', 'Internacional']));
check('Grupo: 22 tarjetas y CH 105 seleccionado', (await visibleCount('#sec-tv-en-vivo .tv-grupo .card')) === 22 && (await text('#sec-tv-en-vivo .tv-grupo .card.is-sel .ch')) === 'CH 105');
await page.screenshot({ path: join(SHOT_DIR, 'mobile-tv-grupo.png') });

// ── TV en vivo: listado de canales ──
await click('#sec-tv-en-vivo .seg[data-seg="listado"]');
check('Listado: pestaña "Listado de canales" activa', (await text('#sec-tv-en-vivo .seg.is-active')) === 'Listado de canales');
check('Listado: 20 tarjetas (CH 1 a 20)', (await visibleCount('#sec-tv-en-vivo .tv-listado .card')) === 20);
check('Listado: empieza en CH 1', (await text('#sec-tv-en-vivo .tv-listado .card .ch')) === 'CH 1');
await page.mouse.move(200, 400);
await page.mouse.wheel(0, 500);
await page.waitForTimeout(300);
check('Listado se desplaza con la rueda', (await page.evaluate(() => document.querySelector('#sec-tv-en-vivo .tv-listado .scroll').scrollTop)) > 0);
check('Listado: sin títulos de grupo', (await visibleCount('#sec-tv-en-vivo .grp-title')) === 0);
await page.screenshot({ path: join(SHOT_DIR, 'mobile-tv-listado.png') });
await click('#sec-tv-en-vivo .seg[data-seg="grupo"]');
check('vuelve a Grupo de canales', (await visibleCount('#sec-tv-en-vivo .tv-grupo .card')) === 22);

// ── Menú Más (flotante, no navega) ──
await click('#tabMas');
check('Más abre el menú flotante', (await popupOpen()) === true);
check('Más: pestaña marcada mientras está abierto (y TV en vivo sigue activa)', await page.evaluate(() => document.getElementById('tabMas').classList.contains('is-active') && document.querySelector('.tab[data-tab="tv"]').classList.contains('is-active')));
check('Más: 3 opciones', (await count('#masPopup .popup-item')) === 3);
check('Más: Películas, Series, Guía', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#masPopup .popup-item')].map(e => e.textContent.trim()))) === JSON.stringify(['Películas', 'Series', 'Guía']));
check('Más: no cambia de pantalla', (await activeScreen()) === 'sec-tv-en-vivo');
await page.screenshot({ path: join(SHOT_DIR, 'mobile-mas-popup.png') });
await click('#masPopup .popup-item:has-text("Series")');
check('opción Series del menú Más abre Series y cierra el menú', (await activeScreen()) === 'sec-series' && (await popupOpen()) === false);
await press('Escape');
check('Escape vuelve a TV en vivo', (await activeScreen()) === 'sec-tv-en-vivo');
await click('#tabMas');
await press('Escape');
check('Escape cierra el menú Más', (await popupOpen()) === false);
check('Más: deja de estar marcada al cerrar', (await activeTab()) === 'TV en vivo');
await click('#tabMas');
await click('#masOverlay');
check('tocar fuera cierra el menú Más', (await popupOpen()) === false);

// ── Pestaña inerte y cambio de pestaña ──
await click('.tab:has-text("Mi contenido")');
check('Mi contenido abre su pantalla', (await activeScreen()) === 'sec-mi-contenido');
await click('.tab[data-tab="tv"]');
await click('.tab[data-tab="inicio"]');
check('Inicio vuelve a la raíz', (await activeScreen()) === 'sec-inicio' && (await activeTab()) === 'Inicio');

await browser.close();
console.log(failures === 0 ? 'OK: todo pasa' : `FALLOS: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
