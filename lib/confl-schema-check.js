#!/usr/bin/env node

const Printer = require('./printer');
const getStream = require('get-stream');
const request = require('request');

const action = (config) => (subject, options) => {
    const printer = new Printer(options);
    const proxy = require('./proxy');
    
    const url = "/compatibility/subjects/" + subject + "/versions/latest";

    getStream(process.stdin).then((schema) => {
        proxy.post(config.schemaRegistry + url, {
            auth: {
                username: config.username,
                password: config.password
            },
            body: {
                schema: schema.replace(/\n/gm, "")
            },
            json: true
        })
            .then(printer.printResponse())
            .catch(printer.printError);
    });

};

const command = (program, config) => {
    program
        .command('schema-check <subject>')
        .description("Check the schema piped in via stdin against the specified schema for compatibility.")
        .action(action(config));
};

exports.action = action;
exports.command = command;