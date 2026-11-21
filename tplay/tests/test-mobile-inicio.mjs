// Simulador mobile: pantalla Inicio (fuente: captura SM-S711B, 1080×2340 a 3×).
// Capturas opcionales: SHOT_DIR=/ruta node tests/test-mobile-inicio.mjs
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

check('sección #sec-inicio activa', (await page.evaluate(() => document.querySelector('#sec-inicio').classList.contains('is-active'))));
check('título "Inicio"', (await text('.header .title')) === 'Inicio');
check('barra inferior: 5 pestañas', JSON.stringify(await all('.tab span')) === JSON.stringify(['Inicio', 'Buscar', 'TV en vivo', 'Mi contenido', 'Más']), JSON.stringify(await all('.tab span')));
check('pestaña activa es Inicio', (await text('.tab.is-active span')) === 'Inicio');
check('secciones visibles', JSON.stringify(await all('#sec-inicio .sec-ttl')) === JSON.stringify(['Lo más visto ahora', 'Ver últimas 24hs', 'Viví el mejor Deporte']));
check('accesos Películas · Series · Guía', JSON.stringify(await all('#sec-inicio .shortcut')) === JSON.stringify(['Películas', 'Series', 'Guía']));
check('banner con 5 puntos', (await page.evaluate(() => document.querySelectorAll('#sec-inicio .dots i').length)) === 5);
check('4 tarjetas de canal', (await page.evaluate(() => document.querySelectorAll('#sec-inicio .card').length)) === 4);
check('botón de Ajustes en el encabezado', (await page.evaluate(() => !!document.querySelector('.header .gear'))));
check('barra inferior dentro del marco del teléfono', (await page.evaluate(() => document.querySelector('.phone').contains(document.querySelector('.tabbar')))));
check('teléfono de 360×780',(await page.evaluate(() => { const r = document.querySelector('.phone').getBoundingClientRect(); return r.width === 360 && r.height === 780; })));

await page.screenshot({ path: join(SHOT_DIR, 'mobile-inicio.png'), clip: await page.evaluate(() => { const r = document.querySelector('.phone').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }) });

await browser.close();
console.log(failures === 0 ? 'OK: todo pasa' : `FALLOS: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
