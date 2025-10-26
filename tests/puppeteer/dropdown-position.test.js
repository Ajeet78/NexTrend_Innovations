const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');

// Start local server (server.js must listen on PORT or default to 3000)
const server = spawn('node', [path.join(process.cwd(), 'server.js')], { stdio: 'inherit' });

async function waitForServer(url, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res && res.status < 500) return true;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Server did not start in time');
}

(async () => {
  try {
    const baseUrl = 'http://localhost:3000';
    // wait briefly for server to start
    await new Promise(r => setTimeout(r, 800));

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    const viewports = [
      { width: 1300, height: 800 }, // desktop
      { width: 1024, height: 768 },
      { width: 800, height: 600 },
      { width: 480, height: 800 } // mobile portrait
    ];

    for (const vp of viewports) {
      await page.setViewport(vp);
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });

      // Hover the services menu to make dropdown appear
      const servicesSelector = 'a#servicesDropdown';
      await page.waitForSelector(servicesSelector, { timeout: 2000 });

      // Hover or click depending on viewport width
      if (vp.width > 768) {
        await page.hover(servicesSelector);
        await page.waitForTimeout(200); // wait for animation
      } else {
        await page.click(servicesSelector);
        await page.waitForTimeout(200);
      }

      const dropdownSelector = '.nav-item.dropdown .dropdown-menu';
      const isVisible = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const rc = el.getBoundingClientRect();
        return (rc.width > 0 && rc.height > 0 && rc.right > 0 && rc.left < (window.innerWidth || document.documentElement.clientWidth));
      }, dropdownSelector);

      if (!isVisible) throw new Error(`Dropdown not visible for viewport ${vp.width}x${vp.height}`);

      // Check dropdown is fully within viewport horizontally
      const within = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        const rc = el.getBoundingClientRect();
        return rc.left >= 0 && rc.right <= (window.innerWidth || document.documentElement.clientWidth) - 1;
      }, dropdownSelector);

      if (!within) throw new Error(`Dropdown clipped horizontally for viewport ${vp.width}x${vp.height}`);

      console.log(`Viewport ${vp.width}x${vp.height} - dropdown visible and within viewport`);

      // Close dropdown for next iteration if mobile
      if (vp.width <= 768) {
        await page.click('body');
      } else {
        await page.mouse.move(0,0);
      }

      await page.waitForTimeout(150);
    }

    await browser.close();
    server.kill();
    console.log('All dropdown positioning checks passed');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    try { server.kill(); } catch(e) {}
    process.exit(2);
  }
})();
