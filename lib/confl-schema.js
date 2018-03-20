#!/usr/bin/env node

const Printer = require('./printer');

const action = (config) => (subject, options) => {
    const printer = new Printer(options);
    const proxy = require('./proxy');

    const isSchemaId = parseInt(subject, 10);

    const url = isSchemaId ?
        "/schemas/ids/" + subject :
        "/subjects/" + subject + "/versions/latest"

        proxy.get(config.schemaRegistry + url, {
            auth: {
                username: config.username,
                password: config.password
            }
        })
            .then(body => JSON.parse(body).schema)
            .then(printer.printResponse())
            .catch(printer.printError);
};

const command = (program, config) => {
    program
        .command('schema <subject|id>')
        .description("Display schema with specified id or for the specified subject.")
        .action(action(config));
};

exports.action = action;
exports.command = command;