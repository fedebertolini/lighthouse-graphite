const clsDecimalMultiplier = 10000;
exports.map = result => ({
    'largest-contentful-paint': Math.floor(result.audits['largest-contentful-paint'].numericValue),
    'total-blocking-time': Math.floor(result.audits['total-blocking-time'].numericValue),
    'cumulative-layout-shift': Math.floor(result.audits['cumulative-layout-shift'].numericValue * clsDecimalMultiplier) / clsDecimalMultiplier,
    'performance-score': result.categories.performance.score * 100,
    'first-contentful-paint': Math.floor(result.audits['first-contentful-paint'].numericValue),
    'speed-index': Math.floor(result.audits['speed-index'].numericValue),
    'interactive': Math.floor(result.audits['interactive'].numericValue),
    'server-response-time': Math.floor(result.audits['server-response-time'].numericValue),
    'dom-size': result.audits['dom-size'].numericValue,
    'dom-content-loaded': Math.floor(result.audits['metrics']['details']['items'][0]['observedDomContentLoaded']),
});
