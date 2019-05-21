// Packages
const puppeteer = require('puppeteer');
const filenamify = require('filenamify');
const pages = require('./pages.js');
const { extractDataFromPerformanceTiming, logJSON } = require('./helpers');

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
            // Enable both JavaScript and CSS coverage
            await Promise.all([
                page.coverage.startJSCoverage(),
                page.coverage.startCSSCoverage()
            ]);
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
            await page.addScriptTag({ url: axeUrl });
            const accessibilityReport = await page.evaluate(options => {
                return new Promise(resolve => {
                    setTimeout(resolve, 0);
                    }).then(() => axe.run(options));
            }, axeOptions);
            logJSON('results/axe.json', accessibilityReport);

            // Calculate Code Coverage
            const [jsCoverage, cssCoverage] = await Promise.all([
                page.coverage.stopJSCoverage(),
                page.coverage.stopCSSCoverage(),
            ]);
            let totalBytes = 0;
            let usedBytes = 0;
            const coverage = [...jsCoverage, ...cssCoverage];
            for (const entry of coverage) {
                totalBytes += entry.text.length;
                for (const range of entry.ranges)
                    usedBytes += range.end - range.start - 1;
            }
            console.log(`Bytes used: ${usedBytes / totalBytes * 100}%`);

            // Performance Timing
            const performanceTiming = JSON.parse(
                await page.evaluate(() => JSON.stringify(window.performance.timing))
            );
            const extractedPerformanceTiming = extractDataFromPerformanceTiming(
                performanceTiming,
                'responseEnd',
                'domInteractive',
                'domContentLoadedEventEnd',
                'loadEventEnd'
            );
            console.log('extractedPerformanceTiming', extractedPerformanceTiming);

            // Metrics
            const metrics = await page.metrics()
            console.log('page.metrics', metrics);


            // Done with page
            await page.close();
        } catch (error) {
            console.log('ERROR:', pageData.url, error);

        }
    }
    await browser.close();
    console.log('All Done!');
})();