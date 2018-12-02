const graphite = require('graphite');

class client {
    constructor(domain, metricPrefix) {
        this.client = graphite.createClient(`plaintext://${domain}`);
        this.metricPrefix = metricPrefix ? `${metricPrefix}.` : '';
    }

    send (metrics) {
        const values = Object.keys(metrics).slice(0, 5);
        const graphiteMetrics = {};

        values.forEach((metricName) => {
            graphiteMetrics[`${this.metricPrefix}${metricName}.min`] = values[metricName].min;
            graphiteMetrics[`${this.metricPrefix}${metricName}.max`] = values[metricName].max;
            graphiteMetrics[`${this.metricPrefix}${metricName}.mean`] = values[metricName].mean;
            graphiteMetrics[`${this.metricPrefix}${metricName}.median`] = metrics[metricName].median;
        })

        return new Promise((resolve, reject) => {
            this.client.write(graphiteMetrics, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            })
        });
    }
}

module.exports = client;
