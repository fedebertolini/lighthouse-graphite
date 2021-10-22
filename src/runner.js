const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const mapper = require('./result-mapper');
const fs = require('fs');


// One thing to note is that it is necessary to introduce a delay between each run, otherwise Chromium can get confused
// and the runs will error out
function wait(val) {
    return new Promise(resolve => setTimeout(resolve, val));
}

const setupBrowser = async (url, userAgent, cookies) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    if (userAgent) {
        await page.setUserAgent(userAgent);
    }
    for (const cookie of cookies) {
        await page.setCookie({...cookie, url});
    }
    return browser;
}

exports.run = async (url, userAgent, cookies, options, report, config = null) => {
    let browser = null;
    let page = null;
    try {
        browser = await setupBrowser(url, userAgent, cookies);
        page = (await browser.pages())[0];
        options.port = (new URL(browser.wsEndpoint())).port;
        options.output = 'html';
        const results = await lighthouse(url, options, config);

        await wait(500);

        if (results) {
            if (report) {
                fs.writeFile(report, results.report, function (err) {
                    if (err) return console.error(err);
                    console.log('write report to ' + report);
                });
            }
            return mapper.map(results.lhr);
        }
    } catch (error) {
        console.error('lighthouse ', error);
    } finally {
        await page.close();
        await browser.close();
    }
};
