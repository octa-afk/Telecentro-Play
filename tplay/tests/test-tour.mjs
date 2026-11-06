// Tour del menú: Ajustes usuario (General/Idioma/Control parental/Grupo de canales),
// TV, Guía, Mi Contenido › Grabaciones, Apps y Adultos.
// Capturas opcionales: SHOT_DIR=/ruta node tests/test-tour.mjs
import { firefox } from 'playwright-core';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SHOT_DIR = process.env.SHOT_DIR || tmpdir();
const browser = await firefox.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
let failures = 0;
page.on('pageerror', e => { console.log('PAGEERROR:', e.message); failures++; });
await page.goto(new URL('../../Simulador-TPlay.html', import.meta.url).href);
await page.waitForTimeout(300);

const check = (name, ok, extra = '') => {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (ok ? '' : ' ' + extra));
  if (!ok) failures++;
};
const press = async (key, n = 1) => {
  for (let i = 0; i < n; i++) { await page.keyboard.press(key); await page.waitForTimeout(60); }
  await page.waitForTimeout(120);
};
const shot = name => page.screenshot({ path: join(SHOT_DIR, `tour-${name}.png`) });
const text = sel => page.evaluate(s => document.querySelector(s)?.textContent.trim(), sel);
const has = c => page.evaluate(c => document.querySelector('.decoder').classList.contains(c), c);
const visible = sel => page.evaluate(s => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== 'none'; }, sel);
const activeText = sel => page.evaluate(s => document.querySelector(s + '.active')?.textContent.trim(), sel);
const home = async () => { await press('Home'); await press('Home'); };
const goNav = async (label) => {          // desde HOME: flecha derecha hasta el ítem
  await home();
  for (let i = 0; i < 12; i++) {
    if ((await activeText('.nav-item')).toLowerCase() === label.toLowerCase()) return;
    await press('ArrowRight');
  }
};

// ── Ajustes usuario ──
await goNav('Ajustes');
await press('Enter');                     // Ajustes usuario
await press('Enter');                     // General
await press('Enter');                     // primera opción (Auto apagado)
check('General: hint de la opción activa', (await text('#usubHint')) === 'Presione OK para modificar : Desactivado');
check('General: panel con 6 valores', (await page.evaluate(() => document.querySelectorAll('#usubInfo .fr-kv').length)) === 6);
await shot('general');
await press('ArrowRight');
check('General: Duración banner 5 segundos', (await text('#usubHint')) === 'Presione OK para modificar : 5 segundos');
await press('Enter');
check('General: OK no inventa cambios de valor', (await text('#usubHint')) === 'Presione OK para modificar : 5 segundos');
await press('Escape');
await press('ArrowRight');                // Idioma
await press('Enter');
check('Idioma: barra Menú/Audio/Subtítulos', (await page.evaluate(() => [...document.querySelectorAll('#idiomaNav .general-option')].map(e => e.textContent)).then(a => a.join('|'))) === 'Menú|Audio|Subtítulos');
check('Idioma: panel con 3 valores', (await page.evaluate(() => document.querySelectorAll('#usubInfo .fr-kv').length)) === 3);
await shot('idioma');
await press('Escape');
await press('ArrowRight');                // Control parental
await press('Enter');
check('Control parental: 7 opciones', (await page.evaluate(() => document.querySelectorAll('#parentalNav .general-option').length)) === 7);
check('Control parental: hint de Cambiar PIN', (await text('#usubHint')) === 'Presione OK para cambiar PIN de control parental');
await press('ArrowRight', 4);             // Canales bloqueados
check('Control parental: hint de Canales bloqueados', (await text('#usubHint')) === 'Presionar OK para agregar o borrar canales bloqueados');
await press('Enter');
check('Canales bloqueados abre el modal de PIN', await has('pin-modal-mode'));
for (const k of ['1', '2', '3', '4']) await press(k);
await page.waitForTimeout(700);
check('Modal de PIN: 4 dígitos no reinician ni cierran (sin comportamiento observado)', (await has('pin-modal-mode')) && !(await has('fr-mode')));
await press('Escape');
check('Modal de PIN: Back lo cierra', !(await has('pin-modal-mode')));
await shot('parental');
await press('Escape');
await press('ArrowRight');                // Grupo de canales
await press('Enter');
check('Grupo de canales: Gestión de grupos', (await text('#usubHint')) === 'Presionar OK para crear o editar un grupo');
await shot('grupos');

// ── TV ──
await goNav('TV');
check('TV: hint Volver a TV', (await text('#sec-tv .sec-hint')) === 'Volver a TV');
await shot('tv');

// ── Guía ──
await goNav('Guía');
check('Guía: hint Presione OK para abrir la guía', (await text('#sec-guia .sec-hint')) === 'Presione OK para abrir la guía');
await press('Enter');
check('Guía: abre la grilla', await has('tour-mode') && await visible('#tour-guia'));
check('Guía: arranca en Ariel en su salsa', (await text('#guiaTitle')) === 'Ariel en su salsa' && (await text('#guiaTime')) === '11:15 - 13:00');
await shot('guia');
await press('ArrowDown');
check('Guía: abajo selecciona AM Noticias en la hora actual', (await text('#guiaTitle')) === 'AM Noticias');
await press('ArrowRight');
check('Guía: derecha avanza al siguiente programa', (await text('#guiaTitle')) === 'Vivo al mediodía');
await press('ArrowUp', 2);
check('Guía: arriba llega a MusicTop', (await text('#guiaTitle')) === 'MusicTop');
await press('Escape');
check('Guía: Back vuelve al menú', !(await has('tour-mode')));

// ── Mi Contenido › Grabaciones ──
await goNav('Mi contenido');
check('Mi contenido: sub-ítem Grabaciones', (await text('#sec-micontenido .mc-sub')) === 'Grabaciones');
await press('Enter');
check('Grabaciones: abre Mis grabaciones con 6 filas', (await page.evaluate(() => document.querySelectorAll('.rec-row').length)) === 6);
await shot('grabaciones');
await press('ArrowRight');
check('Grabaciones programadas: vacía', (await text('.grab-empty b')) === 'No tiene grabaciones');
await press('ArrowRight');
check('Crear: formulario con Canal TELEFE', (await text('.grab-form')).includes('TELEFE'));
await shot('crear');
await press('Escape');
check('Grabaciones: Back vuelve al menú', !(await has('tour-mode')));

// ── Apps ──
await goNav('Apps');
check('Apps (vista previa): 8 tiles', (await page.evaluate(() => document.querySelectorAll('#appsPreview .a-tile').length)) === 8);
await press('Enter');
check('Apps: abre la grilla navegable', await has('tour-mode') && await visible('#tour-apps'));
await press('ArrowRight', 2);
check('Apps: foco en prime video', (await page.evaluate(() => document.querySelector('#appsTour .a-tile.sel').textContent.trim())) === 'prime video');
await press('ArrowDown');
check('Apps: abajo va a la fila 2', (await page.evaluate(() => +document.querySelector('#appsTour .a-tile.sel').dataset.app)) === 7);
await shot('apps');
await press('Escape');
check('Apps: Back vuelve al menú', !(await has('tour-mode')));

// ── Adultos ──
await goNav('Adultos');
check('Adultos: hint antes de entrar', (await text('#sec-adultos .sec-hint')) === 'Presione OK para acceder al modo Adultos' && !(await visible('#sec-adultos .adultos-placeholder')));
await shot('adultos');
await press('Enter');
check('Adultos: OK muestra el PIN', await visible('#sec-adultos .adultos-placeholder'));

console.log(failures ? `\n${failures} FALLO(S)` : '\nOK');
await browser.close();
process.exit(failures ? 1 : 0);
