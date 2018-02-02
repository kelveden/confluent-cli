#!/usr/bin/env node

const kafka        = require('kafka-node');
const uuid         = require('uuid/v4');
const avro         = require('avsc');
const through2     = require('through2');
const R            = require('ramda');
const Printer      = require('./printer');
const { Writable } = require('stream');
const _            = require('lodash/fp');
const DecimalType  = require('./DecimalType');

const getSchema = (schemaId, config, cliOptions) => {
    const proxy = require('./proxy')(cliOptions);

    return proxy.get(config.schemaRegistry + "/schemas/ids/" + schemaId, {
        auth: {
            username: config.username,
            password: config.password
        }
    }).then((x) => {
        return avro.Type.forSchema(R.pipe(
            JSON.parse,
            R.prop("schema"),
            JSON.parse)(x),
            { logicalTypes: { 'bytes': DecimalType } })});
};



const action = (config) => (topic, options) => {
    const printer      = new Printer(options);
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
            if (value[ 0 ] !== 0x0) {
                throw new Error("Magic byte not found.");
            }

            const schemaId = value.slice(1).readInt32BE();
            const body     = value.slice(5);

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
        .option("-o, --offset <offset>", "Initial offset.", /^(earliest|latest|start|end)$/)
        .option("-g, --group <consumer group>", "Consumer group to use (a random one will be generated otherwise).");
};

exports.action  = action;
exports.command = command;