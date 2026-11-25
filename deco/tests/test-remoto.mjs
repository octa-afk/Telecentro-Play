import { firefox } from 'playwright-core';

var browser = await firefox.launch();
var page = await browser.newPage({ viewport: { width: 1600, height: 800 } });
var fails = 0;
page.on('pageerror', function(e) { console.log('PAGEERROR:', e.message); fails++; });
await page.goto(new URL('../Simulador-TPlay.html', import.meta.url).href);
await page.waitForTimeout(300);

function check(name, ok) { console.log((ok ? 'PASS ' : 'FAIL ') + name); if (!ok) fails++; }
var activeNav = function() { return page.evaluate(function() { return document.querySelector('.nav-item.active').dataset.section; }); };
async function tap(key) { await page.click('#remote [data-remote="' + key + '"]'); await page.waitForTimeout(450); }

var geo = await page.evaluate(function() {
  var f = document.querySelector('.simulator-frame').getBoundingClientRect();
  var r = document.getElementById('remote').getBoundingClientRect();
  return { fr: f.right, rl: r.left, rr: r.right, rb: r.bottom, rt: r.top, vw: innerWidth, vh: innerHeight };
});
check('control a la derecha del marco', geo.rl > geo.fr);
check('control completo dentro de la ventana', geo.rr <= geo.vw && geo.rb <= geo.vh && geo.rt >= 0);

check('arranca en HOME', await activeNav() === 'home');
await tap('right');
check('flecha derecha -> TV', await activeNav() === 'tv');
await tap('left');
check('flecha izquierda -> HOME', await activeNav() === 'home');
await tap('guia');
check('botón GUÍA -> sección guía', await activeNav() === 'guia');
await tap('apps');
check('botón APPS -> sección apps', await activeNav() === 'apps');
await tap('search');
check('lupa -> buscar', await activeNav() === 'buscar');
await tap('home');
check('HOME -> inicio', await activeNav() === 'home');

// Entrar a AJUSTES con el control y volver con ATRÁS
for (var i = 0; i < 6; i++) await tap('right');
check('6 derechas -> AJUSTES', await activeNav() === 'ajustes');
await tap('ok');
check('OK entra a ajustes', await page.evaluate(function() { return document.querySelector('.decoder').classList.contains('settings-mode'); }));
await tap('back');
check('ATRÁS sale de ajustes', await page.evaluate(function() { return !document.querySelector('.decoder').classList.contains('settings-mode'); }));
await tap('exit');
check('SALIR -> inicio', await activeNav() === 'home');

// Botones sin equivalente no hacen nada
var before = await page.evaluate(function() { return document.querySelector('.decoder').className; });
await page.click('#remote [data-remote="none"] >> nth=0');
await page.click('#remote button:has-text("INFO")');
await page.waitForTimeout(200);
check('botones sin función no cambian el estado', before === await page.evaluate(function() { return document.querySelector('.decoder').className; }));

// El teclado sigue funcionando
await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450);
check('teclado sigue funcionando', await activeNav() === 'tv');

await page.screenshot({ path: process.env.SHOT || '/tmp/claude-1000/-home-octa-projects-Telecentro-Play/117c7bd8-95dc-47df-8102-2b783651e46b/scratchpad/remoto.png' });
await browser.close();
console.log(fails ? 'FALLAS: ' + fails : 'OK');
process.exit(fails ? 1 : 0);
