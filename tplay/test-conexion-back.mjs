import { firefox } from 'playwright-core';

const browser = await firefox.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto('file:///home/octa/Descargas/tplay/deco_v2.html');
await page.waitForTimeout(300);

const snapshot = () => page.evaluate(() => {
  const sub = document.getElementById('settingsNav');
  const sis = document.getElementById('sistemaNav');
  const activeSub = document.querySelector('.subnav-item.active');
  const firstSis = document.querySelector('.sistema-option');
  const activeCon = document.querySelector('.conexion-option.active');
  const con = document.getElementById('conexionNav');
  const rel = (nav, el) => {
    if (!el) return null;
    const nr = nav.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return Math.round((er.left + er.width / 2) - (nr.left + nr.width / 2));
  };
  return {
    classes: document.querySelector('.decoder').className,
    subScroll: Math.round(sub.scrollLeft),
    subDisplay: getComputedStyle(sub).display,
    activeSub: activeSub ? activeSub.textContent.trim() : null,
    sisScroll: Math.round(sis.scrollLeft),
    sisDisplay: getComputedStyle(sis).display,
    firstSisCenterRel: rel(sis, firstSis),
    activeSis: document.querySelector('.sistema-option.active')?.textContent.trim() ?? null,
    conDisplay: getComputedStyle(con).display,
    conScroll: Math.round(con.scrollLeft),
    activeCon: activeCon ? activeCon.textContent.trim() : null,
  };
});

async function press(key) {
  await page.keyboard.press(key);
  await page.waitForTimeout(450);
}

for (let i = 0; i < 6; i++) await press('ArrowRight');
await press('Enter');
for (let i = 0; i < 4; i++) await press('ArrowRight');
const base = await snapshot();
console.log('baseline Sistema:', JSON.stringify(base));

await press('Enter');          // entra a opciones de Sistema
await press('ArrowRight');     // -> Conexión (queda activa y centrada)
const enCon = await snapshot();
console.log('Conexión seleccionada:', JSON.stringify(enCon));
await press('Enter');          // entra a Conexión (Ethernet / Wi-Fi)
console.log('en Conexión:', JSON.stringify(await snapshot()));
await press('ArrowRight');     // -> Wi-Fi
const inCon = await snapshot();
console.log('en Wi-Fi:', JSON.stringify(inCon));

await press('Enter');          // abre la pantalla Wi-Fi
const wifi = await page.evaluate(() => ({
  visible: getComputedStyle(document.getElementById('wifiScreen')).display !== 'none',
  actions: Array.from(document.querySelectorAll('#wifiActions [data-wifi-action]')).map(el => el.textContent.trim()),
  networks: Array.from(document.querySelectorAll('#wifiNetworks [data-ssid]')).map(el => el.getAttribute('data-ssid')),
  connected: document.querySelector('#wifiNetworks .wifi-network.connected')?.getAttribute('data-ssid') ?? null,
  locked: document.querySelectorAll('#wifiNetworks .wifi-lock').length,
  focus: document.querySelector('#wifiScreen .wifi-focus')?.getAttribute('data-wifi-action') ||
    document.querySelector('#wifiScreen .wifi-focus')?.getAttribute('data-ssid') || null,
}));
console.log('pantalla Wi-Fi:', JSON.stringify(wifi));
const wifiOk = wifi.visible
  && wifi.actions.join('|') === 'REFRESCAR|UNIRSE A OTRA RED|ATRÁS'
  && wifi.networks.length >= 3
  && wifi.connected === 'Telecentro-5G'
  && wifi.locked >= 1;
console.log('EXPECTATIVA pantalla-Wi-Fi:', wifiOk ? 'OK' : 'FALLA');

await press('ArrowDown');
const wifiAfterDown = await page.evaluate(() => document.querySelector('#wifiScreen .wifi-focus')?.textContent.trim() ?? null);
console.log('foco Wi-Fi tras flecha abajo:', wifiAfterDown);
await press('ArrowRight');
const networkFocus = await page.evaluate(() => document.querySelector('#wifiScreen .wifi-focus')?.getAttribute('data-ssid') ?? null);
console.log('foco red tras flecha derecha:', networkFocus);
await press('ArrowDown');
const networkFocusAfterDown = await page.evaluate(() => document.querySelector('#wifiScreen .wifi-focus')?.getAttribute('data-ssid') ?? null);
console.log('red siguiente tras flecha abajo:', networkFocusAfterDown);
await press('Escape');         // pantalla Wi-Fi -> preview de Conexión
const wifiBack = await page.evaluate(() => ({
  screen: getComputedStyle(document.getElementById('wifiScreen')).display,
  connectionPreview: getComputedStyle(document.getElementById('conexionNav')).display,
  activeConnection: document.querySelector('.conexion-option.active')?.textContent.trim() ?? null,
}));
console.log('vuelta desde Wi-Fi:', JSON.stringify(wifiBack));
const wifiBackOk = wifiBack.screen === 'none' && wifiBack.connectionPreview === 'flex' && wifiBack.activeConnection === null;
console.log('EXPECTATIVA vuelta-desde-Wi-Fi:', wifiBackOk ? 'OK' : 'FALLA');

await press('Escape');         // vuelve a opciones de Sistema (sigue "entered")
const after = await snapshot();
console.log('vuelta de Conexión:', JSON.stringify(after));

// Nivel intermedio: el subnav sigue oculto (settings-sistema-entered activo),
// la barra de sistema restaura Conexión ACTIVA centrada (como antes de entrar)
// y la barra de conexión vuelve a su 1ª opción centrada en preview.
const conOk = after.subDisplay === 'none' && after.sisDisplay === 'flex'
  && after.activeSis === 'Conexión'
  && Math.abs(after.sisScroll - enCon.sisScroll) <= 10
  && after.conDisplay === 'flex' && after.activeCon === null
  && Math.abs(after.conScroll - enCon.conScroll) <= 10;
console.log('EXPECTATIVA vuelta-a-opciones-Sistema:', conOk ? 'OK' : 'FALLA');

await press('Escape');         // vuelve al subnav (rama settings-sistema-entered)
const top = await snapshot();
console.log('vuelta al subnav:', JSON.stringify(top));
const topOk = top.subDisplay === 'flex' && top.activeSub === 'Sistema'
  && Math.abs(top.subScroll - base.subScroll) <= 10
  && Math.abs(top.firstSisCenterRel - base.firstSisCenterRel) <= 10;
console.log('EXPECTATIVA top-menu-sin-resetear:', topOk ? 'OK' : 'FALLA');
if (!conOk || !topOk || !wifiOk || !wifiBackOk || networkFocusAfterDown === networkFocus) process.exitCode = 1;

await browser.close();
