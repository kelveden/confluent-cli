#!/usr/bin/env node

const kafka        = require('node-rdkafka');
const uuidv4       = require('uuid/v4');
const avro         = require('avsc');
const through2     = require('through2');
const R            = require('ramda');
const Printer      = require('./printer');
const { Writable } = require('stream');
const os           = require('os');

const magicByte     = 0x0
const parseSchemaId = R.pipe(
    R.dropWhile(R.equals(magicByte)),
    R.head
);

const parseMessageBody = R.pipe(
    R.dropWhile(R.equals(magicByte)),
    R.tail
);

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

    kafka.KafkaConsumer.createReadStream({
            "bootstrap.servers": config.broker,
            "security.protocol": "ssl",
            "ssl.key.location": os.homedir + "/aiven-credentials/uat/service.key",
            "ssl.certificate.location": os.homedir + "/aiven-credentials/uat/service.cert",
            "ssl.ca.location": os.homedir + "/aiven-credentials/uat/ca.pem",
            "group.id": options.group || uuidv4()
        },
        {
            "auto.offset.reset": options.offset || "end"
        },
        {
            topics: [ topic ]
        }
    )
        .pipe(through2.obj(function (message, enc, callback) {
            const { partition, offset, value } = message;
            const schemaId                     = parseSchemaId(value);
            const body                         = parseMessageBody(value);

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
        .option("-o, --offset <offset>", "Initial offset.", /^(beginning|end|[0-9]+)$/)
        .option("-g, --group <consumer group>", "Consumer group to use (a random one will be generated otherwise).");
};

exports.action  = action;
exports.command = command;