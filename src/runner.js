const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const mapper = require('./result-mapper');

exports.run = (url, options, config = null) => {
    return chromeLauncher.launch(options).then(chrome => {
        options.port = chrome.port;
        return lighthouse(url, options, config)
            .then(result => chrome.kill().then(() => mapper.map(result.lhr)))
            .catch(error => {
                if (chrome) {
                    chrome.kill().catch(() => { });
                }
                Promise.reject(error);
            });
    });
};
