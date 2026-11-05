import { firefox } from 'playwright-core';

const browser = await firefox.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 800 } });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto('file:///home/octa/Descargas/tplay/deco_v2.html');
await page.waitForTimeout(300);

let pass = 0, fail = 0;
const expect = (label, cond, detail) => {
  if (cond) { pass++; console.log(`  OK   ${label}`); }
  else { fail++; console.log(`  FALLA ${label} :: ${detail}`); }
};

const snap = (id) => page.evaluate((navId) => {
  const nav = document.getElementById(navId);
  const active = nav.querySelector('.active');
  const first = nav.firstElementChild;
  const navRect = nav.getBoundingClientRect();
  const rel = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return Math.round((r.left + r.width / 2) - (navRect.left + navRect.width / 2));
  };
  return {
    display: getComputedStyle(nav).display,
    bw: getComputedStyle(nav).borderBottomWidth,
    scroll: Math.round(nav.scrollLeft),
    active: active ? active.textContent.trim() : null,
    firstCenterRel: rel(first),
    activeCenterRel: rel(active),
  };
}, id);

const state = () => page.evaluate(() => {
  const g = (id) => Math.round(document.getElementById(id).scrollLeft);
  return {
    classes: document.querySelector('.decoder').className,
    activeNav: document.querySelector('.nav-item.active')?.textContent.trim() ?? null,
    activeSub: document.querySelector('.subnav-item.active')?.textContent.trim() ?? null,
    activeUser: document.querySelector('.settings-option.active')?.textContent.trim() ?? null,
    activeGen: document.querySelector('.general-option.active')?.textContent.trim() ?? null,
    activeSis: document.querySelector('.sistema-option.active')?.textContent.trim() ?? null,
    activeCon: document.querySelector('.conexion-option.active')?.textContent.trim() ?? null,
    navBar: g('navBar'), settingsNav: g('settingsNav'), userNav: g('userNav'),
    generalNav: g('generalNav'), sistemaNav: g('sistemaNav'), conexionNav: g('conexionNav'),
    dSub: getComputedStyle(document.getElementById('settingsNav')).display,
    dUser: getComputedStyle(document.getElementById('userNav')).display,
    dGen: getComputedStyle(document.getElementById('generalNav')).display,
    dSis: getComputedStyle(document.getElementById('sistemaNav')).display,
    dCon: getComputedStyle(document.getElementById('conexionNav')).display,
    dNav: getComputedStyle(document.getElementById('navBar')).display,
  };
});

async function press(key) {
  await page.keyboard.press(key);
  await page.waitForTimeout(500);
}
const near = (a, b, tol = 15) => Math.abs(a - b) <= tol;

// ─── refs: HOME -> AJUSTES ─────────────────────────────────────────
for (let i = 0; i < 6; i++) await press('ArrowRight');
const ref_ajustes = (await state()).navBar;
await press('Enter');
let s = await state();
const ref_sub_first = s.settingsNav;
expect('entrada a Ajustes: primer ítem del subnav activo', s.activeSub === 'Ajustes usuario', s.activeSub);
expect('entrada a Ajustes: preview de usuario visible, sin sistema', s.dSis === 'none' && !s.classes.includes('settings-sistema-active'), s.classes);
const usrPrev = await snap('userNav');
expect('preview de usuario: General centrado bajo Ajustes usuario',
  Math.abs(usrPrev.firstCenterRel) <= 6, `off=${usrPrev.firstCenterRel}`);

// ─── P1: opciones de usuario -> vuelta ─────────────────────────────
await press('Enter'); // entra a opciones de usuario (General activa)
s = await state();
const ref_user_first = s.userNav;
expect('entrada a usuario: General activa y centrada', s.activeUser === 'General' && near(s.userNav, ref_user_first), JSON.stringify(s));
await press('ArrowRight');
await press('ArrowRight'); // -> Control parental (scrolled)
s = await state();
const ref_user_cp = s.userNav;
expect('navegación en usuario: scroll se movió', !near(ref_user_cp, ref_user_first), `${ref_user_first} vs ${ref_user_cp}`);
await press('Escape'); // <- vuelve a subnav
s = await state();
expect('VUELTA usuario->subnav: subnav visible con ítem activo',
  s.dSub === 'flex' && s.activeSub === 'Ajustes usuario' && near(s.settingsNav, ref_sub_first),
  `sub=${s.settingsNav} ref=${ref_sub_first} active=${s.activeSub}`);
expect('VUELTA usuario->subnav: opciones de usuario vuelven a 1ª opción',
  s.dUser === 'flex' && s.activeUser === null && near(s.userNav, ref_user_first),
  `user=${s.userNav} ref=${ref_user_first} active=${s.activeUser}`);

// ─── P4: general -> usuario -> subnav ──────────────────────────────
await press('Enter'); // re-entra a usuario (General activa)
s = await state();
expect('preview de General: barra general visible, sin activa',
  s.dGen === 'flex' && s.activeGen === null, `dGen=${s.dGen} activeGen=${s.activeGen}`);
const usrBw = await snap('userNav');
const genBw = await snap('generalNav');
expect('preview de General: separador entre barras, nada debajo del preview',
  usrBw.bw === '1px' && genBw.bw === '0px', `user=${usrBw.bw} gen=${genBw.bw}`);
await press('Enter'); // entra a general
s = await state();
const ref_gen_first = s.generalNav;
expect('entrada a general: 1ª opción activa', s.activeGen === 'Auto apagado', s.activeGen);
await press('ArrowRight');
await press('ArrowRight'); // -> Tiempo recordatorios
s = await state();
const ref_gen_mid = s.generalNav;
expect('navegación en general: scroll se movió', !near(ref_gen_mid, ref_gen_first), `${ref_gen_first} vs ${ref_gen_mid}`);
await press('Escape'); // <- general -> usuario
s = await state();
expect('VUELTA general->usuario: opciones de usuario restauradas con activa',
  s.dUser === 'flex' && s.activeUser === 'General' && near(s.userNav, ref_user_first),
  `user=${s.userNav} ref=${ref_user_first} active=${s.activeUser}`);
expect('VUELTA general->usuario: barra general vuelve a 1ª opción en preview',
  s.dGen === 'flex' && s.activeGen === null && near(s.generalNav, ref_gen_first),
  `dGen=${s.dGen} activeGen=${s.activeGen} gen=${s.generalNav} ref=${ref_gen_first}`);
expect('VUELTA general->usuario: subnav sigue oculta', s.dSub === 'none', `dSub=${s.dSub}`);
await press('ArrowRight'); // -> Idioma: el preview de General debe ocultarse
s = await state();
expect('navegar a otra opción oculta el preview de General', s.dGen === 'none', `dGen=${s.dGen}`);
await press('ArrowLeft'); // -> General: el preview vuelve
s = await state();
expect('volver a General re-muestra el preview', s.dGen === 'flex', `dGen=${s.dGen}`);
await press('Escape'); // <- usuario -> subnav
s = await state();
expect('VUELTA usuario->subnav (2): subnav activo correcto',
  s.activeSub === 'Ajustes usuario' && near(s.settingsNav, ref_sub_first),
  `sub=${s.settingsNav} ref=${ref_sub_first} active=${s.activeSub}`);

// ─── P2: sistema -> Reset -> vuelta ────────────────────────────────
for (let i = 0; i < 4; i++) await press('ArrowRight'); // -> Sistema
s = await state();
const ref_sub_sistema = s.settingsNav;
expect('preview de Sistema: barra de sistema visible, sin activa',
  s.dSis === 'flex' && s.activeSis === null, `dSis=${s.dSis} active=${s.activeSis}`);
const subSis = await snap('settingsNav');
const sisPrev = await snap('sistemaNav');
expect('preview de Sistema: Sistema centrado en el subnav',
  Math.abs(subSis.activeCenterRel) <= 6, `off=${subSis.activeCenterRel}`);
expect('preview de Sistema: Diagnóstico centrado bajo Sistema',
  Math.abs(sisPrev.firstCenterRel) <= 6, `off=${sisPrev.firstCenterRel}`);
await press('Enter'); // entra a opciones de sistema
s = await state();
const ref_sis_first = s.sistemaNav;
expect('entrada a sistema: Diagnóstico activa', s.activeSis === 'Diagnóstico', s.activeSis);
const sisEntBw = await snap('sistemaNav');
expect('entrada a sistema: separador debajo de la barra activa',
  sisEntBw.bw === '1px', `bw=${sisEntBw.bw}`);
for (let i = 0; i < 3; i++) await press('ArrowRight'); // -> Reset
s = await state();
const ref_sis_reset = s.sistemaNav;
expect('navegación en sistema: scroll se movió', !near(ref_sis_reset, ref_sis_first), `${ref_sis_first} vs ${ref_sis_reset}`);
await press('Enter'); // ingresa a Reset
await press('Escape'); // <- vuelve
s = await state();
expect('VUELTA Reset->subnav: subnav visible con Sistema activo (sin resetear)',
  s.dSub === 'flex' && s.activeSub === 'Sistema' && near(s.settingsNav, ref_sub_sistema),
  `sub=${s.settingsNav} ref=${ref_sub_sistema} active=${s.activeSub}`);
expect('VUELTA Reset->subnav: barra sistema en 1ª opción sin activa',
  s.activeSis === null && near(s.sistemaNav, ref_sis_first),
  `sis=${s.sistemaNav} ref=${ref_sis_first} active=${s.activeSis}`);

// ─── P3: sistema -> Conexión -> Wi-Fi -> vuelta ────────────────────
await press('Enter'); // re-entra a opciones de sistema
await press('ArrowRight'); // -> Conexión
s = await state();
const ref_sis_con = s.sistemaNav;
const ref_con_first = s.conexionNav;
expect('preview de Conexión: barra de conexión visible, sin activa',
  s.dCon === 'flex' && s.activeCon === null, `dCon=${s.dCon} active=${s.activeCon}`);
const sisBw = await snap('sistemaNav');
const conBw = await snap('conexionNav');
expect('preview de Conexión: separador entre barras, nada debajo del preview',
  sisBw.bw === '1px' && conBw.bw === '0px', `sis=${sisBw.bw} con=${conBw.bw}`);
await press('Enter'); // entra a conexión (Ethernet activa)
s = await state();
const ref_con_eth = s.conexionNav;
expect('entrada a conexión: Ethernet activa', s.activeCon === 'Ethernet', s.activeCon);
await press('ArrowRight'); // -> Wi-Fi
s = await state();
const ref_con_wifi = s.conexionNav;
expect('navegación en conexión: scroll se movió', !near(ref_con_wifi, ref_con_eth), `${ref_con_eth} vs ${ref_con_wifi}`);
await press('Enter'); // abre la pantalla Wi-Fi desde la opción seleccionada
let wifiUi = await page.evaluate(() => ({
  visible: getComputedStyle(document.getElementById('wifiScreen')).display !== 'none',
  actions: document.querySelectorAll('#wifiActions [data-wifi-action]').length,
  networks: document.querySelectorAll('#wifiNetworks [data-ssid]').length,
  connected: document.querySelector('#wifiNetworks .connected')?.getAttribute('data-ssid') ?? null,
}));
expect('pantalla Wi-Fi: composición determinista visible',
  wifiUi.visible && wifiUi.actions === 3 && wifiUi.networks === 4 && wifiUi.connected === 'Telecentro-5G',
  JSON.stringify(wifiUi));
await press('ArrowDown'); // Unirse a otra red
await press('ArrowRight'); // primera red
await press('Enter');
const wifiStatus = await page.evaluate(() => document.getElementById('wifiStatus').textContent);
expect('pantalla Wi-Fi: OK sobre red deja estado demo',
  wifiStatus.includes('Red seleccionada: Telecentro-5G'), wifiStatus);
await press('Escape'); // Wi-Fi -> preview de Conexión
wifiUi = await page.evaluate(() => ({
  screen: getComputedStyle(document.getElementById('wifiScreen')).display,
  preview: getComputedStyle(document.getElementById('conexionNav')).display,
}));
expect('pantalla Wi-Fi: ATRÁS restaura preview de Conexión',
  wifiUi.screen === 'none' && wifiUi.preview === 'flex', JSON.stringify(wifiUi));
await press('Escape'); // <- vuelve a opciones de sistema
s = await state();
expect('VUELTA conexión->sistema: subnav sigue oculta (sigue entered)',
  s.dSub === 'none', `dSub=${s.dSub}`);
expect('VUELTA conexión->sistema: barra sistema restaura Conexión activa centrada',
  s.dSis === 'flex' && s.activeSis === 'Conexión' && near(s.sistemaNav, ref_sis_con),
  `sis=${s.sistemaNav} ref=${ref_sis_con} active=${s.activeSis}`);
expect('VUELTA conexión->sistema: barra conexión vuelve a 1ª opción sin activa',
  s.dCon === 'flex' && s.activeCon === null && near(s.conexionNav, ref_con_first),
  `con=${s.conexionNav} ref=${ref_con_first} active=${s.activeCon}`);
await press('Escape'); // <- vuelve al subnav
s = await state();
expect('VUELTA sistema->subnav (2): subnav con Sistema activo',
  s.dSub === 'flex' && s.activeSub === 'Sistema' && near(s.settingsNav, ref_sub_sistema),
  `sub=${s.settingsNav} ref=${ref_sub_sistema} active=${s.activeSub}`);
expect('VUELTA sistema->subnav (2): barra sistema en 1ª opción',
  s.activeSis === null && near(s.sistemaNav, ref_sis_first),
  `sis=${s.sistemaNav} ref=${ref_sis_first} active=${s.activeSis}`);

// ─── P5: salir a menú principal y re-entrar arranca fresco ────────
await press('Escape'); // <- subnav -> menú principal
s = await state();
expect('VUELTA subnav->principal: navBar visible con AJUSTES activo centrado',
  s.dNav === 'flex' && s.activeNav === 'AJUSTES' && near(s.navBar, ref_ajustes),
  `nav=${s.navBar} ref=${ref_ajustes} active=${s.activeNav}`);
await press('Enter'); // re-entra a Ajustes
s = await state();
expect('RE-ENTRADA a Ajustes: arranca en 1ª opción (no en la última visitada)',
  s.activeSub === 'Ajustes usuario' && !s.classes.includes('settings-sistema-active') && s.dSis === 'none',
  `activeSub=${s.activeSub} classes=${s.classes} dSis=${s.dSis}`);

// ─── P6: HOME desde estado profundo limpia todo ────────────────────
for (let i = 0; i < 4; i++) await press('ArrowRight'); // -> Sistema
await press('Enter');   // opciones de sistema
for (let i = 0; i < 3; i++) await press('ArrowRight'); // -> Reset
await press('Enter');   // dentro de Reset (entered)
await press('Home');    // siempre debe volver a HOME limpio
s = await state();
expect('HOME desde Reset: clases de ajustes limpias',
  !/settings-|conexion-|general-entered/.test(s.classes), s.classes);
expect('HOME desde Reset: HOME activo', s.activeNav === 'HOME', s.activeNav);
await press('ArrowRight'); // debe mover el menú principal
s = await state();
expect('HOME desde Reset: las flechas mueven el menú principal',
  s.activeNav === 'TV', s.activeNav);
await press('Enter');
s = await state();
expect('HOME desde Reset: Enter abre la sección TV', (await state()).activeNav === 'TV', s.activeNav);

console.log(`\nRESULTADO: ${pass} OK, ${fail} FALLA`);
if (fail) process.exitCode = 1;
await browser.close();
