import { firefox } from 'playwright-core';

const browser = await firefox.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto('file:///home/octa/Descargas/tplay/deco_v2.html');
await page.waitForTimeout(500);

async function press(key, n = 1, delay = 400) {
  for (let i = 0; i < n; i++) {
    await page.keyboard.press(key);
    await page.waitForTimeout(delay);
  }
}

async function diag(label) {
  const d = await page.evaluate(() => {
    const dec = document.querySelector('.decoder');
    const activeNav = document.querySelector('.nav-item.active');
    const activeSub = document.querySelector('.subnav-item.active');
    const activeSis = document.querySelector('.sistema-option.active');
    const activeCon = document.querySelector('.conexion-option.active');
    return {
      classes: dec ? dec.className : null,
      activeNav: activeNav ? activeNav.textContent.trim() + ' (' + activeNav.getAttribute('data-section') + ')' : null,
      activeSub: activeSub ? activeSub.textContent.trim() + ' (' + activeSub.getAttribute('data-settings') + ')' : null,
      activeSis: activeSis ? activeSis.textContent.trim() + ' (' + activeSis.getAttribute('data-sistemaoption') + ')' : null,
      activeCon: activeCon ? activeCon.textContent.trim() : null,
    };
  });
  console.log(label + ':', JSON.stringify(d));
}

await diag('inicio');

// Navegar por nav-item para encontrar Ajustes
for (let i = 0; i < 8; i++) {
  await press('ArrowRight');
  await diag('despues de ArrowRight #' + (i + 1));
}

await browser.close();
