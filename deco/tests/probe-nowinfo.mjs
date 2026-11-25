import { chromium } from 'playwright';

const file = new URL('../Simulador-TPlay.html', import.meta.url).href;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 800 } });
await page.goto(file);

const vis = () => page.evaluate(() => {
  const el = document.querySelector('.now-info');
  return getComputedStyle(el).visibility;
});
const activeNav = () => page.evaluate(() => document.querySelector('.nav-item.active')?.textContent.trim());
const visibleSection = () => page.evaluate(() => document.querySelector('.section.visible')?.id);

console.log('--- estado inicial (HOME activa, sin navegar) ---');
console.log('now-info visibility:', await vis(), '| nav activa:', await activeNav(), '| sección:', await visibleSection());

console.log('\n--- navegar con flechas >= (mover resaltado) ---');
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(150);
for (let i = 0; i < 3; i++) {
  console.log('visibility:', await vis(), '| nav activa:', await activeNav(), '| sección:', await visibleSection());
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
}

console.log('\n--- OK sobre la opción resaltada ---');
await page.keyboard.press('Enter');
await page.waitForTimeout(150);
console.log('visibility:', await vis(), '| nav activa:', await activeNav(), '| sección:', await visibleSection());

console.log('\n--- más flechas después del OK ---');
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(150);
console.log('visibility:', await vis(), '| nav activa:', await activeNav(), '| sección:', await visibleSection());

console.log('\n--- clic del mouse sobre AJUSTES ---');
await page.click('.nav-item[data-section="ajustes"]');
await page.waitForTimeout(150);
console.log('visibility:', await vis(), '| nav activa:', await activeNav(), '| sección:', await visibleSection());

console.log('\n--- Esc hasta HOME ---');
await page.click('.nav-item[data-section="home"]');
await page.waitForTimeout(150);
console.log('visibility:', await vis(), '| nav activa:', await activeNav(), '| sección:', await visibleSection());

// captura de referencia
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(150);
await page.screenshot({ path: '/tmp/opencode/nav-preview.png' });
await page.keyboard.press('Enter');
await page.waitForTimeout(150);
await page.screenshot({ path: '/tmp/opencode/nav-entered.png' });

await browser.close();
console.log('\nScreenshots: /tmp/opencode/nav-preview.png, /tmp/opencode/nav-entered.png');
