// Simulador mobile: pantalla Canales (filtro alfabético de TV en vivo), abierta con el botón de filtro.
// Fuente: captura del teléfono. Solo se muestra el rango A-C; los demás rangos no se relevaron.
// Capturas opcionales: SHOT_DIR=/ruta node tests/test-mobile-canales.mjs
import { firefox } from 'playwright-core';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SHOT_DIR = process.env.SHOT_DIR || tmpdir();
const browser = await firefox.launch();
const page = await browser.newPage({ viewport: { width: 400, height: 820 } });
let failures = 0;
page.on('pageerror', e => { console.log('PAGEERROR:', e.message); failures++; });
await page.goto(new URL('../Simulador-TPlay-mobile.html', import.meta.url).href);
await page.waitForTimeout(300);

const check = (name, ok, extra = '') => {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (ok ? '' : ' ' + extra));
  if (!ok) failures++;
};
const text = sel => page.evaluate(s => document.querySelector(s)?.textContent.trim(), sel);
const all = sel => page.evaluate(s => [...document.querySelectorAll(s)].map(e => e.textContent.trim()), sel);
const activeScreen = () => page.evaluate(() => document.querySelector('.screen.is-active')?.id);
const activeTab = () => page.evaluate(() => document.querySelector('.tab.is-active')?.textContent.trim());
const click = async sel => { await page.locator(sel).first().click(); await page.waitForTimeout(80); };
const press = async key => { await page.keyboard.press(key); await page.waitForTimeout(80); };

await click('.tab[data-tab="tv"]');
await click('#sec-tv-en-vivo .filter-btn');
check('el filtro abre Canales', (await activeScreen()) === 'sec-canales');
check('Canales: pestaña TV en vivo sigue activa', (await activeTab()) === 'TV en vivo');
check('Canales: título', (await text('#sec-canales .c-ttl')) === 'Canales');
check('Canales: chips A-C · D-G · H-P · Q-T · U-W', JSON.stringify(await all('#sec-canales .a-chip')) === JSON.stringify(['A-C', 'D-G', 'H-P', 'Q-T', 'U-W']));
check('Canales: A-C seleccionado', (await text('#sec-canales .a-chip.sel')) === 'A-C');
const names = await all('#sec-canales .c-name');
check('Canales: 18 nombres, de A&E a AXN', names.length === 18 && names[0] === 'A&E' && names[17] === 'AXN', JSON.stringify(names));
await page.screenshot({ path: join(SHOT_DIR, 'mobile-canales.png') });
await click('#sec-canales .c-x');
check('✕ vuelve a TV en vivo', (await activeScreen()) === 'sec-tv-en-vivo');
await click('#sec-tv-en-vivo .filter-btn');
await press('Escape');
check('Escape también vuelve a TV en vivo', (await activeScreen()) === 'sec-tv-en-vivo');

await browser.close();
console.log(failures === 0 ? 'OK: todo pasa' : `FALLOS: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
