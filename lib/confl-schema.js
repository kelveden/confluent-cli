#!/usr/bin/env node

const Printer = require('./printer');

const action = (topic, options) => {
    const printer = new Printer(options);
    const proxy = require('./proxy')(options);

    proxy.get("https://kafka-prd.ovo-prd.aivencloud.com:21559/subjects/" + topic + "-value/versions/1", { auth: {
        username: process.env.AIVEN_USERNAME,
        password: process.env.AIVEN_PASSWORD
    }})
        .then((body) => {
            return JSON.parse(body).schema
        })
        .then(printer.printResponse());
};

const command = (program) => {
    program
        .command('schema <topic>')
        .description("Display schema for specified topic.")
        .action(action);
};

exports.action = action;
exports.command = command;