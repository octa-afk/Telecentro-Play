import { firefox } from 'playwright-core';

const browser = await firefox.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
await page.goto('file:///home/octa/Descargas/tplay/deco_v2.html');
await page.waitForTimeout(500);

async function press(key, n = 1, delay = 450) {
  for (let i = 0; i < n; i++) {
    await page.keyboard.press(key);
    await page.waitForTimeout(delay);
  }
}

async function diag(label) {
  const d = await page.evaluate(() => {
    const dec = document.querySelector('.decoder');
    const screen = document.getElementById('wifiScreen');
    const actions = Array.from(screen.querySelectorAll('#wifiActions .wifi-action'));
    return {
      classes: dec ? dec.className : null,
      screenDisplay: screen ? getComputedStyle(screen).display : null,
      actions: actions.map(a => ({ text: a.textContent.trim(), classes: a.className })),
      focus: document.querySelector('#wifiScreen .wifi-focus')?.getAttribute('data-wifi-action') ||
             document.querySelector('#wifiScreen .wifi-focus')?.getAttribute('data-ssid') || null,
    };
  });
  console.log(label + ':', JSON.stringify(d));
}

// 1. Navegar a AJUSTES
await press('ArrowRight', 6);
await press('Enter'); // entra a settings-mode

// 2. Navegar a Sistema en subnav
await press('ArrowRight', 4); // Ajustes usuario -> Video -> Visita -> Grabaciones -> Sistema

// 3. Enter en Sistema -> settings-sistema-active
await press('Enter');

// 4. Navegar a Conexión en sistema-option (es el segundo)
await press('ArrowRight');

// 5. Enter en Conexión -> conexion-option-active (Wi-Fi es primero ahora)
await press('Enter');

// 6. Enter en Wi-Fi -> enterWifiScreen()
await press('Enter');

await page.waitForTimeout(500);

await diag('Wi-Fi pantalla');

await page.screenshot({ path: 'shot-wifi-screen.png', fullPage: true });
console.log('Screenshot: shot-wifi-screen.png');

await browser.close();
