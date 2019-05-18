// Packages
const puppeteer = require('puppeteer');
const filenamify = require('filenamify');
const pages = require('./pages');

// Helpers
const iPhone6 = puppeteer.devices['iPhone 6'];
const iPhoneX = puppeteer.devices['iPhone X'];
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 400;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

// Main Functionality
(async () => {
    const browser = await puppeteer.launch();

    for (const pageData of pages) {
        try {
            // Setup Page
            const page = await browser.newPage();
            // await page.emulate(iPhoneX);
            await page.goto(pageData.url);

            // Scroll Entire Page
            await autoScroll(page);

            // Take Screen Shot
            let screenshotFileName = filenamify(pageData.url, { replacement: '-' });
            let screenshotPath = './screenshots/' + screenshotFileName + '.png';
            await page.screenshot({
                path: screenshotPath,
                fullPage: true
            });

            // Done with page
            await page.close();
        } catch (error) {
            console.log('ERROR:', pageData.url, error);

        }
    }
    await browser.close();
    console.log('All Done!');
})();