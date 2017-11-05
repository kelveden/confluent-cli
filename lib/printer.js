const prettyjson = require('prettyjson');
const util = require('util');
const R = require('ramda');
const _ = require('lodash');
const separator = (new Array(51)).join("-");

require('colors');

module.exports = function Printer (commandOptions) {
    const sortObject = (o) => {
        if (_.isArray(o)) {
            return o.map(sortObject);

        } else if (R.is(Object, o)) {
            return R.keys(o)
                .sort()
                .reduce((accumulated, key) => {
                    return R.assoc(key, sortObject(o[ key ]), accumulated);
                }, {});

        } else {
            return o;
        }
    };

    const safePrintBody = (body, { format, ugly }, customPrinter) => {
        const parseJson = R.cond([
            [ R.is(String), body => JSON.parse(body) ],
            [ R.T, R.identity ]
        ]);

        const printYaml = R.pipe(
            parseJson,
            sortObject,
            R.partialRight(prettyjson.render, [ { noColor: ugly } ]),
            console.log
        );

        const printJson = R.pipe(
            parseJson,
            sortObject,
            R.partialRight(util.inspect, [ { colors: !ugly, depth: null } ]),
            console.log
        );

        if (format === "yaml") {
            printYaml(body);

        } else if (format === "raw") {
            console.log(body);

        } else if ((format === "json") || !customPrinter) {
            // Fallback to JSON format
            printJson(body);

        } else if (customPrinter) {
            customPrinter(parseJson(body));
        }
    };

    this.printObject = (object, indent) => {
        function padRight(string, length) {
            return string + (new Array((length - string.length) + 1).join(" "));
        }

        const indentPad = Array(indent).join(" ") || "";

        if (!_.isPlainObject(object)) {
            console.log(indentPad + object);
            return;
        }

        const names = R.keys(object);
        const longestName = names.reduce(function (currentLongestName, name) {
            return name.length > currentLongestName.length ? name : currentLongestName;
        }, "");

        names.forEach((name) => {
            const child = object[name];
            const header = indentPad + padRight(name + ": ", longestName.length + 2);

            if (_.isArray(child)) {
                console.log(header);
                child.forEach((item) => this.printObject(item, (indent || 0) + 3));

            } else if (_.isPlainObject(child)) {
                console.log(header);
                this.printObject(child, (indent || 0) + 2);

            } else {
                console.log(header + child);
            }
        });
    };

    this.printResponse = (printer) => (body) => {
        if (!body) {
            console.log("No data");
            return;
        }

        const options = commandOptions.parent;
        safePrintBody(body, options, printer);
    };

    this.printError = () => console.error;
    this.printSeparator = () => console.log(separator);
};
