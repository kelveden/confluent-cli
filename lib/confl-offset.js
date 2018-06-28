#!/usr/bin/env node

const kafka = require('kafka-node');
const Printer = require('./printer');

const action = (config) => (topics, options) => {
    const printer = new Printer(options);
    const printMessage = printer.printResponse();

    const client = new kafka.KafkaClient({
        kafkaHost: config.broker,
        sslOptions: config.ssl
    });
    const offset = new kafka.Offset(client);

    offset.fetchLatestOffsets(topics.split(","), function (err, offsets) {
        client.close();

        if (err) {
            console.error(err);
        } else {
            printMessage(offsets);
        }
    });
};

const command = (program, config) => {
    program
        .command('offset <topics>')
        .description("Get partition offsets for given comma-separated topic(s).")
        .action(action(config));
};

exports.action = action;
exports.command = command;