// https://github.com/addyosmani/a11y
const a11y = require('a11y');
const fs = require('fs');

a11y('example.com', (err, reports) => {
    const audit = reports.audit; // `a11y` Formatted report
    const report = reports.report; // DevTools Accessibility Audit formatted report

    fs.writeFileSync(
        'results/a11y.json',
        JSON.stringify(reports, null, "\t"),
        { flag: 'w' }
    );
});