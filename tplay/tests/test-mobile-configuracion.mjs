// Simulador mobile: flujo Configuración (menú y 6 subpantallas) y navegación con back.
// Fuente: capturas del teléfono (Configuración › Mis datos, Gestión de dispositivos,
// Mis canales, Notificaciones, Detalles técnicos, Ayuda y legales).
// Capturas opcionales: SHOT_DIR=/ruta node tests/test-mobile-configuracion.mjs
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

// ── Entrada: engranaje de Inicio ──
check('arranca en Inicio', (await activeScreen()) === 'sec-inicio');
await click('.gear');
check('engranaje abre Configuración', (await activeScreen()) === 'sec-configuracion');
check('Configuración: título', (await text('#sec-configuracion .title')) === 'Configuración');
check('Configuración: 7 ítems en orden', JSON.stringify(await all('#sec-configuracion .menu-item')) === JSON.stringify(
  ['Mis datos', 'Gestión de dispositivos', 'Mis canales', 'Notificaciones', 'Detalles técnicos', 'Ayuda y legales', 'Cerrar sesión']));
check('Configuración: ninguna pestaña activa', (await activeTab()) === undefined);
await page.screenshot({ path: join(SHOT_DIR, 'mobile-configuracion.png') });

// ── Mis datos + back con ‹ ──
await click('[data-target="sec-mis-datos"]');
check('Mis datos abre su pantalla', (await activeScreen()) === 'sec-mis-datos');
check('Mis datos: botón de almacenamiento', (await text('#sec-mis-datos .btn-light')) === 'Gestión de almacenamiento');
await page.screenshot({ path: join(SHOT_DIR, 'mobile-mis-datos.png') });
await click('#sec-mis-datos .back');
check('‹ vuelve a Configuración', (await activeScreen()) === 'sec-configuracion');

// ── Gestión de dispositivos: acciones destructivas NO operan ──
await click('[data-target="sec-gestion-dispositivos"]');
check('Gestión abre su pantalla', (await activeScreen()) === 'sec-gestion-dispositivos');
check('Gestión: 4 filas con ❌ (este + 3 otros)', (await count('#sec-gestion-dispositivos .dev-x')) === 4);
check('Gestión: "Otros dispositivos activos (3)"', (await page.evaluate(() => document.querySelector('#sec-gestion-dispositivos').textContent.includes('Otros dispositivos activos (3)'))));
await click('#sec-gestion-dispositivos .btn-outline');
check('"Cerrar todas las sesiones" no navega ni cambia nada', (await activeScreen()) === 'sec-gestion-dispositivos');
await click('#sec-gestion-dispositivos .dev-x');
check('❌ no navega ni cambia nada', (await activeScreen()) === 'sec-gestion-dispositivos');
await page.screenshot({ path: join(SHOT_DIR, 'mobile-gestion-dispositivos.png') });
await press('Escape');
check('Escape (back) vuelve a Configuración', (await activeScreen()) === 'sec-configuracion');

// ── Mis canales ──
await click('[data-target="sec-mis-canales"]');
check('Mis canales: 2 toggles', (await count('#sec-mis-canales .toggle')) === 2);
check('Mis canales: texto de los toggles', (await all('#sec-mis-canales .at')).some(t => t.includes('Mostrar mis canales más vistos')));
await page.screenshot({ path: join(SHOT_DIR, 'mobile-mis-canales.png') });
await click('#sec-mis-canales .back');

// ── Notificaciones ──
await click('[data-target="sec-notificaciones"]');
check('Notificaciones: toggle push', (await text('#sec-notificaciones .at')) === 'Notificaciones push');
check('Notificaciones: texto de estado', (await all('#sec-notificaciones .txt')).includes('Las notificaciones están activadas.'));
await click('#sec-notificaciones .back');

// ── Detalles técnicos ──
await click('[data-target="sec-detalles-tecnicos"]');
const det = await page.evaluate(() => document.querySelector('#sec-detalles-tecnicos').textContent);
const D = await page.evaluate(() => window.DEMO);
check('Detalles: versión', det.includes(D.appVersion));
check('Detalles: dispositivo y sistema', det.includes(D.appModelo) && det.includes(D.appSistema));
check('datos genéricos: sin datos reales en pantalla', !/SM-S711B|ANDROID-TV|Android 16|2021033555/.test(await page.evaluate(() => document.querySelector('.phone').textContent)));
await click('#sec-detalles-tecnicos .back');

// ── Ayuda y legales (links no navegan) ──
await click('[data-target="sec-ayuda-legales"]');
const ayuda = await page.evaluate(() => document.querySelector('#sec-ayuda-legales').textContent);
check('Ayuda: 4 bloques', ['Ayuda', 'Política de privacidad', 'Términos y condiciones', 'Licencia de terceros'].every(t => ayuda.includes(t)));
await click('#sec-ayuda-legales .back');

// ── Cerrar sesión: no opera ──
await click('#sec-configuracion .menu-item:has-text("Cerrar sesión")');
check('"Cerrar sesión" no cambia de pantalla', (await activeScreen()) === 'sec-configuracion');

// ── Pestaña Inicio vuelve a la raíz ──
check('barra inferior: 5 pestañas', (await count('.tab')) === 5);
await click('.tab[data-target="sec-inicio"]');
check('Inicio (pestaña) vuelve a la raíz', (await activeScreen()) === 'sec-inicio');
check('Inicio (pestaña) queda activa', (await activeTab()) === 'Inicio');

await browser.close();
console.log(failures === 0 ? 'OK: todo pasa' : `FALLOS: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
