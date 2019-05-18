// https://github.com/GoogleChrome/lighthouse/blob/master/docs/readme.md#using-programmatically

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

function launchChromeAndRunLighthouse(url, opts, config = null) {
    return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then(chrome => {
        opts.port = chrome.port;
        return lighthouse(url, opts, config).then(results => {
            // use results.lhr for the JS-consumeable output
            // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
            // use results.report for the HTML/JSON/CSV output as a string
            // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
            return chrome.kill().then(() => results.lhr)
        });
    });
}

const opts = {
    chromeFlags: ['--show-paint-rects'],
    onlyCategories: ['performance']
};

const opts2 = {
    extends: 'lighthouse:default',
    settings: {
        onlyAudits: [
            'first-meaningful-paint',
            'speed-index-metric',
            'estimated-input-latency',
            'first-interactive',
            'consistently-interactive',
        ],
    },
};

// Usage:
launchChromeAndRunLighthouse('https://example.com', opts2).then(results => {
    // console.log( results );
    fs.writeFileSync(
        'results/lighthouse--opts2.json',
        JSON.stringify(results, null, "\t"),
        {flag: 'w'}
    );
});