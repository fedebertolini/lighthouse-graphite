module.exports = (resultsArray = []) => {
    if (!resultsArray.length) {
        throw new Error('param `resultsArray` must be an array with at least one element');
    }

    const aggregatedResult = {};

    const keys = Object.keys(resultsArray[0]);
    keys.forEach((key) => {
        aggregatedResult[key] = {};

        const values = [];
        let sum = 0;
        for (let i = 0; i < resultsArray.length; i++) {
            const value = resultsArray[i][key];

            sum += value;
            values.push(value);
        }
        const sortedValues = values.sort(sortNumbers);

        aggregatedResult[key].mean = Math.floor(sum / resultsArray.length);
        aggregatedResult[key].min = sortedValues[0];
        aggregatedResult[key].max = sortedValues[resultsArray.length - 1];
        aggregatedResult[key].median = median(sortedValues);
    });

    return aggregatedResult;
};

const sortNumbers = (a, b) => a - b;

const median = (values) => {
    if (values.length === 1) return values[0];
    const half = Math.floor(values.length / 2);
    return values[half];
};
