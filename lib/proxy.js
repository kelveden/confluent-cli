const request = require('request');
const R       = require('ramda');

module.exports = (options) => {
    const dryRun = options.parent.dryRun;
    const debug  = options.parent.debug;

    const sendRequest = (method) =>
        function (url, opts) {
            return new Promise((resolve, reject) => {
                const responseHandler = (err, res, body) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }

                    if (res.statusCode >= 300) {
                        console.error(res.statusCode + ": " + res.statusMessage);
                        console.error(body);
                        reject(body);
                    }

                    resolve(body);
                };

                if (dryRun || debug) {
                    console.log(method.toUpperCase() + ": " + url);
                    console.log(opts);
                }

                if (!dryRun) {
                    request(R.merge(opts, { url: url, method: method }), responseHandler);
                } else {
                    resolve();
                }
            });
        };

    return {
        "get": sendRequest("get"),
        "delete": sendRequest("delete"),
        "post": sendRequest("post"),
        "put": sendRequest("put")
    };
};