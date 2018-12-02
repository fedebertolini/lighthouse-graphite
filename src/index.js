const argv = require('minimist')(process.argv.slice(2));
const runner = require('./runner');
const aggregate = require('./result-aggregation');

if (argv._.length !== 1) {
    console.error('One and only one url must be provided (i.e. `lighthouse-graphite https://www.example.com`');
    return;
}
const url = argv._[0];
const runs = argv.runs || 3;

const options = {
    chromeFlags: ['--no-sandbox', '--headless', '--incognito'],
};

const results = [];

(async () => {
    try {
        for (let i = 0; i < runs; i++) {
            const result = await runner.run(url, options);
            results.push(result);
        }
    } catch (error) {
        console.error(error);
    }

    const aggregatedResults = aggregate(results);
    console.log(aggregatedResults);
})();
