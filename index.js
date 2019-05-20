// Packages
const puppeteer = require('puppeteer');
const filenamify = require('filenamify');
const pages = require('./pages.js');

// Helpers
const axeUrl = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/3.2.2/axe.min.js';
const axeOptions = {};
// const iPhone6 = puppeteer.devices['iPhone 6'];
// const iPhoneX = puppeteer.devices['iPhone X'];
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

            // Test Accessibility
            // https://marmelab.com/blog/2018/07/18/accessibility-performance-testing-puppeteer.html
            await page.addScriptTag({ url: axeUrl });
            const accessibilityReport = await page.evaluate(options => {
                return new Promise(resolve => {
                    setTimeout(resolve, 0);
                    }).then(() => axe.run(options));
            }, axeOptions);
            console.log(accessibilityReport);

            // Done with page
            await page.close();
        } catch (error) {
            console.log('ERROR:', pageData.url, error);

        }
    }
    await browser.close();
    console.log('All Done!');
})();