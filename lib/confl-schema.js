#!/usr/bin/env node

const Printer = require('./printer');
const getStream = require('get-stream');
const request = require('request');

const action = (config) => (subject, options) => {
    const printer = new Printer(options);
    const proxy = require('./proxy')(options);

    const isSchemaId = parseInt(subject, 10);

    const url = isSchemaId ?
        "/schemas/ids/" + subject :
        "/subjects/" + subject + "-value/versions/latest"

    getStream(process.stdin).then((schema) => {
        if (schema && !isSchemaId) {
            request({
                url: config.schemaRegistry + "/compatibility" + url,
                auth: {
                    username: config.username,
                    password: config.password
                },
                body: {
                    schema: schema.replace(/\n/gm, "")
                },
                method: "POST",
                json: true
            }, (err, res, body) => {
                if (err) {
                    printer.printError(err);
                } else {
                    printer.printResponse()(body)
                }
            });

        } else {
            proxy.get(config.schemaRegistry + url, {
                auth: {
                    username: config.username,
                    password: config.password
                }
            })
                .then((body) => {
                    return JSON.parse(body).schema
                })
                .then(printer.printResponse())
                .catch(printer.printError);
        }
    });

};

const command = (program, config) => {
    program
        .command('schema <subject|id>')
        .description("Display schema with specified id or for the specified subject.")
        .action(action(config));
};

exports.action = action;
exports.command = command;