import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import path from 'node:path';

puppeteer.use(StealthPlugin());

const executablePath = path.resolve('chrome/win64-154.0.8016.0/chrome-win64/chrome.exe');

async function scrape(url: string, platform: 'amazon' | 'flipkart') {
  console.log(`\nTesting ${platform}: ${url}`);
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    if (platform === 'flipkart') {
      await page.waitForSelector('div.Nx9bqj, div._30jeq3, div.hl05eU, div.U8ziW', { timeout: 8000 }).catch(() => {});
      const data = await page.evaluate(() => {
        const title = document.querySelector('span.VU-ZEz')?.textContent?.trim() 
                   || document.querySelector('h1 span')?.textContent?.trim()
                   || document.title.replace(/Buy.*at Best Price.*/i, '').trim();
        
        const priceEl = document.querySelector('div.Nx9bqj.CxhGGd') 
                     || document.querySelector('div.Nx9bqj') 
                     || document.querySelector('div._30jeq3._16Jk6d')
                     || document.querySelector('div._30jeq3')
                     || document.querySelector('div.hl05eU div')
                     || document.querySelector('.Nx9bqj.CxhGGd')
                     || document.querySelector('div[class*="Nx9bqj"]');
        const priceText = priceEl?.textContent?.trim() || '';

        // Dump all meta prices
        const metaEls = Array.from(document.querySelectorAll('meta[itemprop="price"], meta[property="product:price:amount"], meta[name="twitter:data1"]'));
        const metaPrices = metaEls.map(el => el.getAttribute('content'));

        return { title, priceText, metaPrices };
      });
      console.log('Result:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (browser) await browser.close();
  }
}

async function run() {
  await scrape('https://www.flipkart.com/oneplus-nord-ce-3-lite-5g-pastel-lime-256-gb/p/itm2cd5a4e659035', 'flipkart');
}

run();
