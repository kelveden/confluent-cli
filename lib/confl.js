#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const R = require('ramda');
const cli = require('commander')
    .version(require("../package.json").version)
    .option("-p, --profile <profile>", "Configuration profile to use.")
    .option("-f, --format <format>", "The output format (raw, json or yaml)", /^(raw|json|yaml)$/i)
    .option("--ugly", "Turn off prettification");

const registerCommands = (cli, config, dir) =>
    fs.readdirSync(dir)
        .forEach((file) => {
            const filePath = path.join(dir, file);

            if (file.slice(0, 6) === "confl-") {
                require(filePath.toString()).command(cli, config);
            }
        });

cli.parse(process.argv);
const config = JSON.parse(fs.readFileSync(os.homedir() + "/.confl/config", 'utf8'));
const profile = config.profiles[cli.profile || config.defaultProfile];

registerCommands(cli, R.merge(config, profile), __dirname);

cli
    .command('help')
    .description("Display this help.")
    .action(cli.help);

cli.parse(process.argv);
