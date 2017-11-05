#!/usr/bin/env node

const Printer = require('./printer');

const action = (topic, options) => {
    const printer = new Printer(options);
    const proxy   = require('./proxy')(options);

    const baseUrl = "https://kafka-uat.ovo-uat.aivencloud.com:13583"
//    const baseUrl = "https://kafka-prd.ovo-prd.aivencloud.com:21558";

    const clearUp = () => {
        proxy.delete(baseUrl + "/consumers/alistair/instances/alistair_instance", {
            auth: {
                username: process.env.AIVEN_USERNAME,
                password: process.env.AIVEN_PASSWORD
            },
            headers: {
                "Content-Type": "application/vnd.kafka.v2+json"
            }
        });
    };

    proxy.post(baseUrl + "/consumers/alistair",
        {
            auth: {
                username: process.env.AIVEN_USERNAME,
                password: process.env.AIVEN_PASSWORD
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
                username: process.env.AIVEN_USERNAME,
                password: process.env.AIVEN_PASSWORD
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
                username: process.env.AIVEN_USERNAME,
                password: process.env.AIVEN_PASSWORD
            },
            headers: {
                "Accept": "application/vnd.kafka.avro.v2+json"
            }
        }))
        .then(printer.printResponse())
        .then(clearUp)
        .catch(clearUp);
};

const command = (program) => {
    program
        .command('stream <topic>')
        .description("Pull messages from specified topic.")
        .action(action);
};

exports.action  = action;
exports.command = command;