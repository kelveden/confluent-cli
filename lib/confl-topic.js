#!/usr/bin/env node

const Printer = require('./printer');

const action = (topic, options) => {
    const printer = new Printer(options);
    const proxy   = require('./proxy')(options);

    const baseUrl = "https://kafka-uat.ovo-uat.aivencloud.com:13583"
//    const baseUrl = "https://kafka-prd.ovo-prd.aivencloud.com:21558";

    proxy.get(baseUrl + "/topics/" + topic,
        {
            auth: {
                username: process.env.AIVEN_USERNAME,
                password: process.env.AIVEN_PASSWORD
            }
        })
        .then(printer.printResponse());
};

const command = (program) => {
    program
        .command('topic <topic>')
        .description("Display details of specified topic.")
        .action(action);
};

exports.action  = action;
exports.command = command;