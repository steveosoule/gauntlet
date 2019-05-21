const fs = require('fs');

const extractDataFromPerformanceTiming = (timing, ...dataNames) => {
    // https://michaljanaszek.com/blog/test-website-performance-with-puppeteer
    const navigationStart = timing.navigationStart;

    const extractedData = {};
    dataNames.forEach(name => {
        extractedData[name] = timing[name] - navigationStart;
    });

    return extractedData;
};

const logJSON = (file, data) => {
    return fs.writeFileSync(
        file,
        JSON.stringify(data, null, "\t"),
        { flag: 'w' }
    );
};

module.exports = {
    extractDataFromPerformanceTiming,
    logJSON

};