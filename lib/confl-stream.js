#!/usr/bin/env node

const { Kafka, logLevel, admin } = require('kafkajs')
const uuid                       = require('uuid/v4');
const Printer                    = require('./printer');
const avroDeserializer           = require('./avro-deserializer');
const R                          = require('ramda');

const action = (config) => async (topic, options) => {
    const printer      = new Printer(options);
    const printMessage = printer.printResponse();
    const maxMessages  = options.messages;
    const groupId      = options.groupId || "confl-cli-" + uuid();

    const isNumericOffset = !isNaN(parseInt(options.offset, 10));

    const kafka = new Kafka({
        clientId: "confluent-cli",
        brokers: [ config.broker ],
        logLevel: logLevel.NOTHING,
        ssl: config.ssl
    });

    const consumer = kafka.consumer({
        groupId: groupId,
        sessionTimeout: 15000
    });

    await consumer.connect();
    await consumer.subscribe({
        topic: topic,
        fromBeginning: (options.offset === "start") || (options.offset === "earliest")
    });

    var count = 0;

    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const { offset, value, key } = message;
            const output = {
                partition: partition,
                offset: parseInt(offset),
                key: key.toString()
            }

            count++;

            try {
                await avroDeserializer.deserialize(value, config)
                    .then(body => printMessage(R.assoc('body', body, output)))
                    .catch(console.error);
            } catch (e) {
                // Just print raw
                printMessage(R.assoc('body', value.toString(), output));
            }

            if (maxMessages && (count >= maxMessages)) {
                consumer.stop()
                    .then(() => process.exit(0));
            }
        }
    });

    if (isNumericOffset) {
        const kafkaAdmin = kafka.admin();

        await kafkaAdmin.connect();
        const result = await kafkaAdmin.fetchOffsets({ groupId, topic })
        await kafkaAdmin.disconnect();

        result
            .map(R.prop("partition"))
            .forEach(p => consumer.seek({ topic: topic, partition: p, offset: options.offset }))
    }
};

const command = (program, config) => {
    program
        .command('stream <topic>')
        .description("Pull messages from specified topic.")
        .action(action(config))
        .option("-o, --offset <offset>", "Initial offset - 'start', 'end' or a numeric offset. Defaults to 'end'", /^(earliest|latest|start|end|[0-9]+)$/)
        .option("-m, --messages <message-count>", "Maximum number of messages to return.", /^[0-9]+$/)
        .option("-g, --group <consumer group>", "Consumer group to use (a random one will be generated otherwise).");
};

exports.action  = action;
exports.command = command;
