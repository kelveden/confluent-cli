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

    const admin = new kafka.Admin(client);
    admin.listGroups((err, res) => {
        console.log("HERE");
        printMessage(res);
        client.close();
    });

    // const offset = new kafka.Offset(client);
    //
    // offset.fetchCommits(consumerGroup, [
    //     { topic: topic, partition: 0 }
    // ], function (err, data) {
    // });
    //
    // offset.fetchLatestOffsets(topics.split(","), function (err, offsets) {
    //     client.close();
    //
    //     if (err) {
    //         console.error(err);
    //     } else {
    //         printMessage(offsets);
    //     }
    // });
};

const command = (program, config) => {
    program
        .command('lag <topic>')
        .description("Display consumer lag for the specified topic.")
        .action(action(config));
};

exports.action = action;
exports.command = command;