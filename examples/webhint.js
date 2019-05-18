/* var shell = require('shelljs');

shell.exec('npx hint https://example.com', null, function (results){
    fs.writeFileSync(
        'results/webhint.json',
        JSON.stringify(results, null, "\t"),
        { flag: 'w' }
    );
}); */

// https://webhint.io/docs/user-guide/api/using-api/
// import [Analyzer] from 'hint';
const Analyzer = require('hint').Analyzer;
const fs = require('fs');

const userConfig = {
    extends: ['web-recommended'],
    formatters: ['json']
};

const webhint = Analyzer.create(userConfig);

async function analyze(){
    const results = await webhint.analyze('http://example.com');

    fs.writeFileSync(
        'results/webhint.json',
        JSON.stringify(results, null, "\t"),
        { flag: 'w' }
    );

    /* results.forEach((result) => {
        console.log(`Result for: ${result.url}`);

        // Print the result using `formatter-html` and `formatter-summary`
        webhint.format(result.problems);
    }); */

};
analyze();