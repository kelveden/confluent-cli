#!/usr/bin/env node

const Printer = require('./printer');

const action = (config) => (topic, options) => {
    const printer = new Printer(options);
    const proxy   = require('./proxy');

    proxy.get(config.apiUrl + "/topics/" + topic,
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
        .command('topic <topic>')
        .description("Display details of specified topic.")
        .action(action(config));
};

exports.action  = action;
exports.command = command;