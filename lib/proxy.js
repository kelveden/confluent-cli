const request = require('request');
const R       = require('ramda');

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

            request(R.merge(opts, { url: url, method: method }), responseHandler)
        });
    };

module.exports = {
    "get": sendRequest("get"),
    "delete": sendRequest("delete"),
    "post": sendRequest("post"),
    "put": sendRequest("put")
};
