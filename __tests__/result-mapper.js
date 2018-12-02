const mock = require('./result-mock.json');
const mapper = require('../src/result-mapper');

describe('result-mapper', () => {
    it('maps the lighthouse result to a reduced metrics object', () => {
        const reducedObject = mapper.map(mock);

        expect(reducedObject).toEqual({
            'first-contentful-paint': 750,
            'first-meaningful-paint': 825,
            'speed-index': 991,
            'estimated-input-latency': 12,
            'time-to-first-byte': 109,
            'first-cpu-idle': 900,
            'interactive': 903,
            'network-requests': 2,
            'total-byte-weight': 1490,
            'dom-size': 13,
            'performance-score': 100,
            'pwa-score': 50,
            'accessibility-score': 88,
            'best-practices-score': 93,
            'seo-score': 89,
            'total-time': 5274,
        });
    });
});
