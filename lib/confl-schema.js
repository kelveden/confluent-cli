#!/usr/bin/env node

const Printer = require('./printer');

const action = (config) => (topic, options) => {
    const printer = new Printer(options);
    const proxy = require('./proxy')(options);

    proxy.get(config.schemaRegistry + "/subjects/" + topic + "-value/versions/latest", { auth: {
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
        .command('schema <topic>')
        .description("Display schema for specified topic.")
        .action(action(config));
};

exports.action = action;
exports.command = command;