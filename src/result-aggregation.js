module.exports = (resultsArray = [], metricsBlacklist = [], functionBlacklist = []) => {
    if (!resultsArray.length) {
        throw new Error('param `resultsArray` must be an array with at least one element');
    }

    const blacklistReducer = (map, key) => {
        map[key] = true;
        return map;
    };
    const metricsBlacklistMap = metricsBlacklist.reduce(blacklistReducer, {});
    const functionBlacklistMap = functionBlacklist.reduce(blacklistReducer, {});

    const keys = Object.keys(resultsArray[0]).filter(metric => !metricsBlacklistMap[metric]);
    const aggregatedResult = {};

    keys.forEach(key => {
        aggregatedResult[key] = {};

        const values = [];
        let sum = 0;
        for (let i = 0; i < resultsArray.length; i++) {
            const value = resultsArray[i][key];

            sum += value;
            values.push(value);
        }
        const sortedValues = values.sort(sortNumbers);

        if (!functionBlacklistMap.min) {
            aggregatedResult[key].min = sortedValues[0];
        }
        if (!functionBlacklistMap.max) {
            aggregatedResult[key].max = sortedValues[resultsArray.length - 1];
        }
        if (!functionBlacklistMap.mean) {
            aggregatedResult[key].mean = Math.floor(sum / resultsArray.length);
        }
        if (!functionBlacklistMap.median) {
            aggregatedResult[key].median = median(sortedValues);
        }
    });

    return aggregatedResult;
};

const sortNumbers = (a, b) => a - b;

const median = values => {
    if (values.length === 1) return values[0];
    const half = Math.floor(values.length / 2);
    return values[half];
};
