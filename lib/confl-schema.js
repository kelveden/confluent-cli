#!/usr/bin/env node

const Printer = require('./printer');

const action = (config) => (subject, options) => {
    const printer = new Printer(options);
    const proxy = require('./proxy')(options);

    const url = parseInt(subject, 10) ?
        "/schemas/ids/" + subject :
        "/subjects/" + subject + "-value/versions/latest"

    proxy.get(config.schemaRegistry + url, { auth: {
        username: config.username,
        password: config.password
    }})
        .then((body) => {
            return JSON.parse(body).schema
        })
        .then(printer.printResponse());
};

const command = (program, config) => {
    program
        .command('schema <subject|id>')
        .description("Display schema with specified id or for the specified subject.")
        .action(action(config));
};

exports.action = action;
exports.command = command;