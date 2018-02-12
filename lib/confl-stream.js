#!/usr/bin/env node

const kafka = require('kafka-node');
const uuid = require('uuid/v4');
const through2 = require('through2');
const Printer = require('./printer');
const { Writable } = require('stream');
const avroDeserializer = require('./avro-deserializer');

const action = (config) => (topic, options) => {
    const printer = new Printer(options);
    const printMessage = printer.printResponse();

    const consumerStream = new kafka.ConsumerGroupStream({
        kafkaHost: config.broker,
        sslOptions: config.ssl,
        groupId: options.groupId || uuid(),
        sessionTimeout: 15000,
        protocol: [ 'roundrobin' ],
        fromOffset: (options.offset || 'latest')
            .replace("start", "earliest")
            .replace("end", "latest"),
        encoding: "buffer"
    }, topic);

    consumerStream
        .pipe(through2.obj(function (message, enc, callback) {
            const { partition, offset, value } = message;

            return avroDeserializer.deserialize(value, config)
                .then((body) => {
                    this.push({
                        partition: partition,
                        offset: offset,
                        body: body
                    })
                    callback();
                })
                .catch(console.error)
        }))
        .pipe(new Writable({
            objectMode: true,
            write(chunk, encoding, callback) {
                printMessage(chunk);
                callback();
            }
        }));
};

const command = (program, config) => {
    program
        .command('stream <topic>')
        .description("Pull messages from specified topic.")
        .action(action(config))
        .option("-o, --offset <offset>", "Initial offset.", /^(earliest|latest|start|end)$/)
        .option("-g, --group <consumer group>", "Consumer group to use (a random one will be generated otherwise).");
};

exports.action = action;
exports.command = command;