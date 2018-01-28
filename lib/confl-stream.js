#!/usr/bin/env node

const Printer = require('./printer');

const action = (config) => (topic, options) => {
    const printer = new Printer(options);
    const proxy   = require('./proxy')(options);

    const baseUrl = config.apiUrl;

    const clearUp = () => {
        proxy.delete(baseUrl + "/consumers/alistair/instances/alistair_instance", {
            auth: {
                username: config.username,
                password: config.password
            },
            headers: {
                "Content-Type": "application/vnd.kafka.v2+json"
            }
        });
    };

    proxy.post(baseUrl + "/consumers/alistair",
        {
            auth: {
                username: config.username,
                password: config.password
            },
            headers: {
                "Content-Type": "application/vnd.kafka.v2+json"
            },
            body: JSON.stringify({
                name: "alistair_instance",
                format: "avro",
                "auto.offset.reset": "earliest"
            })
        })
        .then(() => proxy.post(baseUrl + "/consumers/alistair/instances/alistair_instance/subscription", {
            auth: {
                username: config.username,
                password: config.password
            },
            headers: {
                "Content-Type": "application/vnd.kafka.v2+json"
            },
            body: JSON.stringify({
                topics: [ topic ]
            })
        }))
        .then(() => proxy.get(baseUrl + "/consumers/alistair/instances/alistair_instance/records", {
            auth: {
                username: config.username,
                password: config.password
            },
            headers: {
                "Accept": "application/vnd.kafka.avro.v2+json"
            }
        }))
        .then(printer.printResponse())
        .then(clearUp)
        .catch(clearUp);
};

const command = (program, config) => {
    program
        .command('stream <topic>')
        .description("Pull messages from specified topic.")
        .action(action(config));
};

exports.action  = action;
exports.command = command;