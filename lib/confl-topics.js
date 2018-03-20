#!/usr/bin/env node

const Printer = require('./printer');

const action = (config) => (options) => {
    const printer = new Printer(options);
    const proxy   = require('./proxy');

    proxy.get(config.apiUrl + "/topics",
        {
            auth: {
                username: config.username,
                password: config.password
            }
        })
        .then(printer.printResponse())
        .catch(printer.printError);
};

const command = (program, config) => {
    program
        .command('topics')
        .description("Display list of all topics.")
        .action(action(config));
};

exports.action  = action;
exports.command = command;