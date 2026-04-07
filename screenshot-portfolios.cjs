const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:5173/portfolios.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/Users/a6112594/Desktop/onesource-demo/portfolios-screenshot.png', fullPage: true });
  console.log('Screenshot saved');
  await browser.close();
})();
