#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cli = require('commander')
    .version(require("../package.json").version)
    .option("-f, --format <format>", "The output format (raw, json or yaml)", /^(raw|json|yaml)$/i)
    .option("--ugly", "Turn off prettification");

const registerCommands = (cli, dir) =>
    fs.readdirSync(dir)
        .forEach((file) => {
            const filePath = path.join(dir, file);

            if (file.slice(0, 6) === "confl-") {
                require(filePath.toString()).command(cli);
            }
        });

registerCommands(cli, __dirname);
// cli.command("help", "Display this help", { isDefault: true })
//      .action(() => cli.help);

cli
    .command('help')
    .description("Display this help.")
    .action(cli.help);

cli.parse(process.argv);
