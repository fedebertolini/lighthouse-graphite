#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const runner = require('./runner');
const aggregate = require('./result-aggregation');
const GraphiteClient = require('./graphite-client');
const desktopConfig = require('lighthouse/lighthouse-core/config/lr-desktop-config.js');

if (argv._.length !== 1) {
    console.error(
        'One and only one url must be provided (i.e. `lighthouse-graphite https://www.example.com`)', argv, process.argv
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
const chromeFlags = argv['chrome-flags'] ? argv['chrome-flags'].split(',') : ['--no-sandbox', '--headless', '--incognito', '--disable-dev-shm-usage'];
const reportFolder = argv['report-folder'] || '/sitespeed.io';
const userAgent = argv['user-agent'];

if (!graphiteHost) {
    console.warn('`--graphite-host` argument not defined, will skip sending metrics to graphite');
}

const options = {
    chromeFlags: chromeFlags,
}

const extraHeaders = argv['extra-headers'];
if (extraHeaders) {
    options["extraHeaders"] = JSON.parse(extraHeaders)
}

const parseExtraCookies = (extraCookies) => {
    const result = []
    if (!extraCookies) {
        return result;
    }
    const cookies = JSON.parse(extraCookies)
    for (const cookie of cookies) {
        if (typeof cookie === 'string') {
            const pair = cookie.split('=')
            result.push({ name: pair[0], value: pair[1] })
        } else {
            result.push(cookie)
        }
    }
    return result
}

const cookies = parseExtraCookies(argv['extra-cookies']);

const parseTarget = (target) => {
    target = target || 'default';
    return ['default', 'mobile', 'desktop'].includes(target) ? target : 'default';
};

const target = parseTarget(argv['target']);

// default is pre-configured to run full speed without throttling of CPU and network
const configDefault = {
    extends: 'lighthouse:default',
    settings: {
        throttlingMethod: "provided",
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
        ],
    },
};

const configMobile = {
    extends: 'lighthouse:default',
};

const getConfig = (target) => {
    return {
        mobile: configMobile,
        desktop: desktopConfig,
        default: configDefault
    }[target];
}

const config = getConfig(target);

const results = [];

(async () => {
    try {
        for (let i = 0; i < runs; i++) {
            try {
                const report = reportFolder+'/report_'+Date.now().toString()+'.html';
                const result = await runner.run(url, userAgent, cookies, options, report, config);
                // lighthouse sometimes delivers no results. TODO check the reason
                if (results !== undefined && results != null) {
                    results.push(result);
                }
            } catch (err) {
                console.error('runner', err);
            }
        }
        if (results.length > 0) {
            const aggregatedResults = aggregate(results, metricsBlacklist, functionBlacklist);
            if (graphiteHost) {
                const graphiteClient = new GraphiteClient(graphiteHost, graphitePrefix);
                await graphiteClient.send(aggregatedResults);
            }
            console.log(aggregatedResults);
        }
    } catch (error) {
        console.error('aggregation', error);
    }
})().catch((err) => { console.error('lighthouse-graphite', err) });
