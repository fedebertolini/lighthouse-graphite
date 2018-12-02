const runner = require('./runner');

(async () => {
    try {
        const options = {
            chromeFlags: ['--no-sandbox --headless'],
        };
        const result = await runner.run('https://www.example.com', options);
        console.log(result);
    } catch (error) {
        console.error(error);
    }
})();
