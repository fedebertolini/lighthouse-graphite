const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const mapper = require('./result-mapper');
const fs = require('fs');


// One thing to note is that it is necessary to introduce a delay between each run, otherwise Chromium can get confused
// and the runs will error out
function wait(val) {
    return new Promise(resolve => setTimeout(resolve, val));
}

exports.run = (url, options, config = null) => {
    return chromeLauncher.launch({ chromeFlags: options.chromeFlags }).then(async chrome => {
        options.port = chrome.port;
        try {
            results = await lighthouse(url, options, config);
        } catch (e) {
            console.error("lighthouse", e);
        }
        await wait(500);
        chrome.kill();
        if (results){

            filename = '/sitespeed.io/report_'+Date.now().toString()+'.html';
            fs.writeFile(filename, results.report[1], function (err) {
                if (err) return console.error(err);
                console.log('write report to ' + filename);
            });

            return mapper.map(results.lhr);
        }

    }).catch((err) => { console.error('chromium', err) });
};
