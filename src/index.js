const argv = require('minimist')(process.argv.slice(2));
const runner = require('./runner');
const aggregate = require('./result-aggregation');
const GraphiteClient = require('./graphite-client');

if (argv._.length !== 1) {
    console.error('One and only one url must be provided (i.e. `lighthouse-graphite https://www.example.com`');
    return;
}
const url = argv._[0];
const runs = argv.runs || 3;
const graphiteHost = argv['graphite-host'];
const graphitePrefix = argv['graphite-prefix'] || '';
const metricsBlacklist = argv['metrics-blacklist'] ? argv['metrics-blacklist'].split(',') : [];
const functionBlacklist = argv['function-blacklist'] ? argv['function-blacklist'].split(',') : [];

if (!graphiteHost) {
    console.warn('`--graphite-host` argument not defined, will skip sending metrics to graphite');
}

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

        const aggregatedResults = aggregate(results, metricsBlacklist, functionBlacklist);

        if (graphiteHost) {
            const graphiteClient = new GraphiteClient(graphiteHost, graphitePrefix);
            await graphiteClient.send(aggregatedResults);
        }

        console.log(aggregatedResults);
    } catch (error) {
        console.error(error);
    }
})();
