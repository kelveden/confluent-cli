#!/usr/bin/env node

const kafka        = require('kafka-node');
const uuidv4       = require('uuid/v4');
const avro         = require('avsc');
const through2     = require('through2');
const R            = require('ramda');
const Printer      = require('./printer');
const { Writable } = require('stream');
const _            = require('lodash/fp');

const getSchema = (schemaId, config, cliOptions) => {
    const proxy = require('./proxy')(cliOptions);

    return proxy.get(config.schemaRegistry + "/schemas/ids/" + schemaId, {
        auth: {
            username: config.username,
            password: config.password
        }
    })
        .then(R.pipe(
            JSON.parse,
            R.prop("schema"),
            JSON.parse,
            avro.Type.forSchema)
        );
};

const action = (config) => (topic, options) => {
    const printer      = new Printer(options);
    const printMessage = printer.printResponse();

    const consumerStream = new kafka.ConsumerGroupStream({
        kafkaHost: config.broker,
        sslOptions: config.ssl,
        groupId: options.groupId || uuidv4(),
        sessionTimeout: 15000,
        protocol: [ 'roundrobin' ],
        fromOffset: options.offset || 'latest',
        encoding: "buffer"
    }, topic);

    consumerStream
        .pipe(through2.obj(function (message, enc, callback) {
            const { partition, offset, value } = message;
            const schemaId              = value.slice(1).readInt32BE();
            const body                  = value.slice(5);

            getSchema(schemaId, config, options)
                .then((schema) => {
                    this.push({
                        partition: partition,
                        offset: offset,
                        body: schema.fromBuffer(body)
                    });
                    callback();
                })
                .catch(console.error);
        }))
        .pipe(new Writable({
            objectMode: true,
            write (chunk, encoding, callback) {
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
        .option("-o, --offset <offset>", "Initial offset.", /^(earliest|latest)$/)
        .option("-g, --group <consumer group>", "Consumer group to use (a random one will be generated otherwise).");
};

exports.action  = action;
exports.command = command;