#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const runner = require('./runner');
const aggregate = require('./result-aggregation');
const GraphiteClient = require('./graphite-client');

if (argv._.length !== 1) {
    console.error(
        'One and only one url must be provided (i.e. `lighthouse-graphite https://www.example.com`'
    );
    return;
}
const url = argv._[0];
const runs = argv.runs || 3;
const graphiteHost = argv['graphite-host'];
const graphitePrefix = argv['graphite-prefix'] || '';
const metricsBlacklist = argv['metrics-blacklist'] ? argv['metrics-blacklist'].split(',') : [];
const functionBlacklist = argv['function-blacklist'] ? argv['function-blacklist'].split(',') : [];
const blockedUrlPatterns = argv['blocked-url-patterns']
    ? argv['blocked-url-patterns'].split(',')
    : [];
const chromeFlags = argv['chrome-flags'] ? argv['chrome-flags'].split(',') : ['--no-sandbox', '--headless', '--incognito'];

if (!graphiteHost) {
    console.warn('`--graphite-host` argument not defined, will skip sending metrics to graphite');
}

const options = {
    chromeFlags: chromeFlags,
};
const config = {
    extends: 'lighthouse:default',
    settings: {
        throttlingMethod: "provided",
        maxWaitForFcp: 45000,
        onlyAudits: [
            "largest-contentful-paint",
            "total-blocking-time",
            "cumulative-layout-shift",
            "first-contentful-paint",
            "speed-index",
            "interactive",
            "dom-size",
            "server-response-time",
            "metrics"
        ]
    },
    passes: [
        {
            blockedUrlPatterns,
        },
    ],
};

const results = [];

(async () => {
    try {
        for (let i = 0; i < runs; i++) {
            try {
                const result = await runner.run(url, options, config);
                // lighthouse sometimes delivers no results. TODO check the reason
                if (results !== undefined) {
                    results.push(result);
                }
            } catch (err) {
                console.error(err);
            }
        }
        if (results.length > 0) {
            const aggregatedResults = aggregate(results, metricsBlacklist, functionBlacklist);
            if (graphiteHost) {
                const graphiteClient = new GraphiteClient(graphiteHost, graphitePrefix);
                await graphiteClient.send(aggregatedResults);
            }
            console.log(aggregatedResults);
        } else {
            console.error('No lighthouse results.')
        }
    } catch (error) {
        console.error(error);
    }
})().catch(() => {});
