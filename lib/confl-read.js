#!/usr/bin/env node

const Printer = require('./printer');
const avroDeserializer = require('./avro-deserializer');
const through2 = require('through2');
const { Writable } = require('stream');

const action = (config) => (options) => {
    const printer = new Printer(options);
    const printMessage = printer.printResponse();

    process.stdin
        .pipe(through2.obj(function (messageBytes, enc, callback) {
            return avroDeserializer.deserialize(messageBytes, config)
                .then((body) => {
                    this.push(body);
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
        }))
};

const command = (program, config) => {
    program
        .command('read')
        .description("Deserializes the avro message bytes from stdin.")
        .action(action(config));
};

exports.action = action;
exports.command = command;