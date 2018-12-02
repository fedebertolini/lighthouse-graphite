const aggregate = require('../src/result-aggregation');

describe('result-aggregation', () => {
    it('calculates the result aggregation', () => {
        const results = [{
            prop1: 50,
            prop2: 100,
        },
        {
            prop1: 20,
            prop2: 34,
        },
        {
            prop1: 78,
            prop2: 100,
        },
        {
            prop1: 54,
            prop2: 3,
        }];

        expect(aggregate(results)).toEqual({
            prop1: {
                mean: 50,
                min: 20,
                max: 78,
                median: 54,
            },
            prop2: {
                mean: 59,
                min: 3,
                max: 100,
                median: 100,
            },
        });
    })
});
