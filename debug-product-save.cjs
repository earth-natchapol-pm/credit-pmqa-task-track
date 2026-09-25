const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Products/i }).click();
  await page.getByRole('button', { name: /Add product/i }).click();

  console.log('modal exists', await page.locator('.modal').count());
  const nameInput = page.locator('input[name="name"]');
  const acronymInput = page.locator('input[name="acronym"]');
  await nameInput.fill('Test Product');
  await acronymInput.fill('TP');

  const saveButton = page.getByRole('button', { name: /Save product/i });
  console.log('save visible', await saveButton.isVisible());
  console.log('save enabled', await saveButton.isEnabled());
  await saveButton.click();
  await page.waitForTimeout(1200);

  console.log('modal still open', await page.locator('.modal').count());
  console.log('body snippet:', (await page.locator('body').innerText()).slice(0, 1500));
  await browser.close();
})();
