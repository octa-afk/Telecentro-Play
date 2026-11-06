// Flujo completo: Ajustes › Sistema › Reset › Reset de fábrica → PIN → arranque
// → asistente de instalación (10 pasos) → TV. Tiempos acelerados vía FR_T.
// Capturas opcionales: SHOT_DIR=/ruta node tests/test-factory-reset.mjs
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
const cls = () => page.evaluate(() => document.querySelector('.decoder').className);
const has = async c => (await cls()).split(/\s+/).includes(c);
const text = sel => page.evaluate(s => document.querySelector(s)?.textContent.trim(), sel);
const activeItem = () => page.evaluate(() => {
  const s = document.querySelector('.fr-step.visible');
  const a = s && [...s.querySelectorAll('.fr-item')].filter(i => i.offsetParent).find(i => i.classList.contains('active'));
  return a ? a.textContent.trim() : null;
});
const visibleItems = () => page.evaluate(() =>
  [...document.querySelector('.fr-step.visible').querySelectorAll('.fr-item')].filter(i => i.offsetParent).map(i => i.textContent.trim()));
const shot = name => page.screenshot({ path: join(SHOT_DIR, `fr-${name}.png`) });
const waitStep = async key => {
  await page.waitForFunction(k => document.querySelector('.fr-step.visible')?.id === 'fr-step-' + k
    && !document.querySelector('.fr-step.visible').classList.contains('busy'), key, { timeout: 5000 });
};

// Tiempos cortos (variables globales del script)
await page.evaluate(() => { FR_T.splash = 400; FR_T.boot = 400; FR_T.sync = 400; FR_T.canales = 400; FR_T.update = 400; FR_T.final = 400; FR_T.pin = 100; });

// ── Ajustes › Sistema › Reset ──
await press('ArrowRight', 6);   // HOME → AJUSTES
await press('Enter');           // entra a Ajustes
await press('ArrowRight', 4);   // → Sistema
await press('Enter');
await press('ArrowRight', 3);   // → Reset
check('Reset activo en barra Sistema', (await text('.sistema-option.active')) === 'Reset');
check('preview de la barra Reset (sin ítem activo)', (await has('reset-option-active')) && !(await page.$('.reset-option.active')));
await shot('1-reset-preview');
await press('Enter');
check('reset-entered', await has('reset-entered'));
check('primera opción: Chequear asociación', (await text('.reset-option.active')) === 'Chequear asociación');
await press('ArrowRight', 9);   // clamp en el extremo
check('clamp en la última opción', (await text('.reset-option.active')) === 'Reset de fábrica de Netflix');
await press('ArrowLeft');
check('Reset de fábrica seleccionado', (await text('.reset-option.active')) === 'Reset de fábrica');
check('hint visible', (await text('#resetHint')) === 'Pulse OK para reiniciar el decodificador');
await shot('2-reset-fabrica');

// Back jerárquico desde Reset hasta Sistema y de nuevo adentro
await press('Escape');
check('Back sale de reset-entered', !(await has('reset-entered')) && (await has('settings-sistema-entered')));
await press('Enter');
await press('ArrowRight', 3);

// ── Modal de PIN ──
await press('Enter');
check('modal de PIN abierto', await has('pin-modal-mode'));
await shot('3-pin');
await press('Escape');
check('Back cierra el modal sin reiniciar', !(await has('pin-modal-mode')) && !(await has('fr-mode')) && (await has('reset-entered')));
await press('Enter');
await press('1'); await press('2');
await press('Backspace');
check('Backspace borra un dígito', (await page.$$eval('#pinSlots .filled', n => n.length)) === 1);
await press('Enter');
check('Enter cierra el modal (ATRÁS enfocado)', !(await has('pin-modal-mode')));
await press('Enter');
// Con una red ya conectada: el reset debe olvidarla
await page.evaluate(() => setWifiConnected('RedPrevia'));
check('pre-reset: WiFi conectado', await has('wifi-connected'));
for (const k of ['1', '2', '3', '4']) await press(k);

// ── Arranque ──
await page.waitForFunction(() => document.querySelector('.decoder').classList.contains('fr-mode'));
check('el reset olvida la red conectada', !(await has('wifi-connected')) && (await page.evaluate(() => wifiConnectedSsid)) === null);
check('fr-mode activo y settings limpio', (await has('fr-mode')) && !(await has('settings-mode')) && !(await has('reset-entered')));
await page.waitForFunction(() => document.getElementById('fr-boot').classList.contains('visible'), null, { timeout: 3000 });
await shot('4-boot');
await press('Escape'); await press('Home');
check('Back/Home ignorados durante el arranque', await has('fr-mode'));

// ── Paso 1: sincronización de control remoto ──
await page.waitForFunction(() => document.getElementById('fr-step-sync').classList.contains('visible'));
check('paso 1 en busy (buscando control)', await page.evaluate(() => document.getElementById('fr-step-sync').classList.contains('busy')));
await shot('5-sync-busy');
await waitStep('sync');
check('paso 1: PASO : 1 / 10', (await text('#frStepCount')) === 'PASO : 1 / 10');
check('paso 1: SIGUIENTE activo', (await activeItem()) === 'Siguiente');
await shot('6-sync');
await press('Enter');

// ── Paso 2: modo ──
await waitStep('modo');
check('paso 2: [Atrás, Cable, IP] con Cable activo', JSON.stringify(await visibleItems()) === '["Atrás","Cable","IP"]' && (await activeItem()) === 'Cable');
await press('ArrowLeft'); await press('ArrowLeft');
check('clamp izquierdo en Atrás', (await activeItem()) === 'Atrás');
await press('Enter');           // Atrás → paso 1
await waitStep('sync');
check('Atrás vuelve al paso 1 sin repetir la búsqueda', !(await page.evaluate(() => document.getElementById('fr-step-sync').classList.contains('busy'))));
await press('Enter');
await waitStep('modo');
check('al volver, el foco del paso 2 se mantiene', (await activeItem()) === 'Atrás');
await press('ArrowRight');
await press('Enter');           // Cable

// ── Paso 3: red / WiFi ──
await waitStep('red');
check('paso 3: [Atrás, WiFi, Ethernet, Omita] con WiFi activo', JSON.stringify(await visibleItems()) === '["Atrás","WiFi","Ethernet","Omita este paso"]' && (await activeItem()) === 'WiFi');
await shot('7-red');
await press('Enter');           // WiFi
check('fr-wifi activo y pantalla "Unirse a otra red"', (await has('fr-wifi')) && (await has('wifi-join-mode')));
await shot('8-wifi-join');
await press('Escape');
check('Back desde "Unirse a otra red" vuelve al paso Red', !(await has('fr-wifi')) && (await has('fr-mode')) && (await page.evaluate(() => document.getElementById('fr-step-red').classList.contains('visible'))));
await press('Enter');
await press('Enter');           // Unirse a otra red → teclado
check('teclado de contraseña', await has('wifi-password-mode'));
await press('Enter'); await press('Enter');   // dos letras
await press('Escape');          // teclado → join
check('Back desde teclado → join', (await has('wifi-join-mode')) && (await has('fr-wifi')));
await press('Enter');           // de nuevo al teclado
await press('Enter');
await page.evaluate(() => confirmPassword());   // SIGUIENTE del teclado
await page.waitForTimeout(200);
check('conectado: vuelve al paso Red con SIGUIENTE', !(await has('fr-wifi')) && (await visibleItems()).join() === 'Atrás,Siguiente,WiFi,Ethernet');
check('toast "Perfil WIFI añadido"', (await text('#frToastMsg')) === 'Perfil WIFI añadido');
check('SIGUIENTE activo tras conectar', (await activeItem()) === 'Siguiente');
await shot('9-red-conectada');
await press('Enter');

// ── Paso 4: canales ──
await waitStep('canales');
check('paso 4: Automático activo', (await activeItem()) === 'Automático');
await press('Enter');
await page.waitForFunction(() => document.getElementById('fr-step-canales').classList.contains('busy'));
await shot('10-canales-busy');
await waitStep('canales');
check('canales encontrados 217', (await text('#frCanalesCount')) === '217');
check('barra [Atrás, Siguiente, Automático, Manual]', (await visibleItems()).join() === 'Atrás,Siguiente,Automático,Manual');
await press('Enter');

// ── Paso 5: idiomas ──
await waitStep('idiomas');
await press('ArrowRight'); await press('Enter');
check('idioma de menú rota', (await text('#frLangMenu')) === 'Inglés');
await press('ArrowLeft'); await press('Enter');

// ── Paso 6: operador ──
await waitStep('operador');
check('paso 6: Chequear asociación activo', (await activeItem()) === 'Chequear asociación');
await press('Enter');
check('toast de asociación exitosa', (await text('#frToastMsg')) === 'Asociación del Operador exitosa');
await shot('11-operador');
await press('Enter');

// ── Paso 7: control parental ──
await waitStep('parental');
await press('ArrowRight', 3);
await press('Enter');
check('definir edades activado', (await text('#frAges')) === 'Activado');
await press('ArrowLeft', 2);
await press('Enter');

// ── Paso 8: firmware ──
await waitStep('firmware');
check('paso 8: [Atrás, Actualizar]', (await visibleItems()).join() === 'Atrás,Actualizar');
await press('Enter');
await page.waitForFunction(() => document.getElementById('fr-step-firmware').classList.contains('busy'));
await shot('12-firmware-busy');
await waitStep('firmware');
check('firmware: [Atrás, Siguiente, Actualizar]', (await visibleItems()).join() === 'Atrás,Siguiente,Actualizar');
await press('Enter');

// ── Paso 9: portal ──
await waitStep('portal');
await press('Enter');
await waitStep('portal');
await press('Enter');

// ── Paso 10 → TV ──
await page.waitForFunction(() => document.getElementById('fr-step-final').classList.contains('visible'));
check('paso 10: PASO : 10 / 10', (await text('#frStepCount')) === 'PASO : 10 / 10');
check('paso 10: título de felicitaciones', (await text('#fr-step-final .fr-title')).toLowerCase().startsWith('felicitaciones'));
await shot('13-final');
await page.waitForFunction(() => document.getElementById('fr-tv').classList.contains('visible'));
await shot('14-tv');
await press('Escape'); await press('Enter');
check('TV: Back/OK no salen', await has('fr-mode'));
await press('Home');
check('Home en la TV sale del reset', !(await has('fr-mode')));
check('vuelve al HOME', await page.evaluate(() => document.getElementById('sec-home').classList.contains('visible') && document.querySelector('.nav-item.active').dataset.section === 'home'));

console.log(failures ? `\n${failures} FALLO(S)` : '\nOK');
await browser.close();
process.exit(failures ? 1 : 0);
