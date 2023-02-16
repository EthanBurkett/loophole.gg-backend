"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class CommandLoader {
    constructor(client, settings) {
        this._settings = settings;
        this._client = client;
        this._commands = new discord_js_1.Collection();
        this._load();
        this.checkUnusedSlash();
    }
    _load() {
        const files = getAllFiles(this._settings.bot.commandsDir);
        for (const file of files) {
            const command = file.fileContents;
            if (!command.names) {
                this._client.error(`Command "${file.name[0]}" does not have a name!`);
                process.exit(0);
            }
            if (command.testOnly && !this._settings.bot.testServers) {
                this._client.error(`Command "${file.name[0]}" is set to test only, but no test servers are provided!`);
                process.exit(0);
            }
            if (command.type == "slash" || command.type == "both") {
                if (this._settings.bot.testServers && command.testOnly) {
                    this._settings.bot.testServers.map((server) => {
                        this.create(command.names[0], command.description, command.options ? command.options : [], server);
                    });
                }
                else {
                    this.create(command.names[0], command.description, command.options, undefined);
                }
            }
            this._commands.set(file.name[0], command);
        }
    }
    checkUnusedSlash() {
        this._client.log("Checking for unused slash commands...");
        const cmds = (async () => {
            var _a;
            return await ((_a = this._client.application) === null || _a === void 0 ? void 0 : _a.commands.fetch().then((cmds) => {
                cmds.map((slash) => {
                    const cmd = this._commands.find((cmd) => { var _a; return (_a = cmd.names) === null || _a === void 0 ? void 0 : _a.includes(slash.name); });
                    if (!cmd)
                        return;
                    if (cmd.type == "legacy") {
                        slash.delete();
                        this._client.log(`Removing client slash command "${cmd.names[0]}" due to property "type" not including slash functionality.`);
                    }
                });
            }));
        })();
        this._client.guilds.cache.map(async (guild) => {
            await guild.commands.fetch();
            guild.commands.cache.map((slash) => {
                const cmd = this._commands.find((cmd) => { var _a; return (_a = cmd.names) === null || _a === void 0 ? void 0 : _a.includes(slash.name); });
                if (!cmd)
                    return;
                if (cmd.type != "both" && cmd.type != "slash") {
                    slash.delete();
                    this._client.log(`Removing guild slash command "${cmd.names[0]}" due to property "type" not including slash functionality.`);
                }
            });
        });
    }
    get commands() {
        return this._commands;
    }
    didOptionsChange(command, options) {
        var _a;
        return (((_a = command.options) === null || _a === void 0 ? void 0 : _a.filter((opt, index) => {
            var _a, _b, _c;
            return ((opt === null || opt === void 0 ? void 0 : opt.required) !== ((_a = options[index]) === null || _a === void 0 ? void 0 : _a.required) &&
                (opt === null || opt === void 0 ? void 0 : opt.name) !== ((_b = options[index]) === null || _b === void 0 ? void 0 : _b.name) &&
                ((_c = opt === null || opt === void 0 ? void 0 : opt.options) === null || _c === void 0 ? void 0 : _c.length) !== options.length);
        }).length) !== 0);
    }
    getCommands(guildId) {
        var _a, _b;
        if (guildId) {
            return (_a = this._client.guilds.cache.get(guildId)) === null || _a === void 0 ? void 0 : _a.commands;
        }
        return (_b = this._client.application) === null || _b === void 0 ? void 0 : _b.commands;
    }
    async create(name, description, options, guildId) {
        var _a, _b;
        let commands;
        if (guildId) {
            commands = (_a = this._client.guilds.cache.get(guildId)) === null || _a === void 0 ? void 0 : _a.commands;
        }
        else {
            commands = (_b = this._client.application) === null || _b === void 0 ? void 0 : _b.commands;
        }
        if (!commands) {
            return;
        }
        await commands.fetch();
        const cmd = commands.cache.find((cmd) => cmd.name === name);
        if (cmd) {
            const optionsChanged = this.didOptionsChange(cmd, options);
            if ((cmd.options &&
                cmd.description &&
                options &&
                cmd.options.length != options.length) ||
                cmd.description !== description ||
                optionsChanged) {
                this._client.log(`Updating${guildId ? " guild" : ""} slash command "${name}"`);
                return commands === null || commands === void 0 ? void 0 : commands.edit(cmd.id, {
                    name,
                    description,
                    options,
                });
            }
            return Promise.resolve(cmd);
        }
        if (commands) {
            this._client.log(`Creating${guildId ? " guild" : ""} slash command "${name}"`);
            const newCommand = await commands.create({
                name,
                description,
                options,
            });
            return newCommand;
        }
        return Promise.resolve(undefined);
    }
    async delete(commandId, guildId) {
        const commands = this.getCommands(guildId);
        if (commands) {
            const cmd = commands.cache.get(commandId);
            if (cmd) {
                this._client.log(`Deleted${guildId ? " guild" : ""} slash command "${cmd.name}".`);
                cmd.delete();
            }
        }
        return Promise.resolve(undefined);
    }
}
exports.default = CommandLoader;
const getAllFiles = (path, foldersOnly = false) => {
    const files = fs_1.default.readdirSync(path, {
        withFileTypes: true,
    });
    let filesFound = [];
    for (const file of files) {
        const filePath = path_1.default.join(path, file.name);
        if (file.isDirectory()) {
            if (foldersOnly) {
                filesFound.push({
                    filePath,
                    fileContents: file,
                });
            }
            else {
                filesFound = [...filesFound, ...getAllFiles(filePath)];
            }
            continue;
        }
        const L = filePath.replace(/\\/g, "/").replace(/\\\\/g, "/").split("/");
        let name = [L[L.length - 1].substring(0, L[L.length - 1].length - 3)];
        let fileContents = require(path_1.default.join(process.cwd(), filePath));
        if (fileContents.default)
            fileContents = fileContents.default;
        if (fileContents.names) {
            if (typeof fileContents.names === "string")
                fileContents.names = [fileContents.names];
            name = fileContents.names;
        }
        else if (fileContents.command) {
            fileContents.command({
                defaultCommands: {
                    [name[0]]: {
                        names: name,
                    },
                },
            });
        }
        else {
            fileContents.names = name;
        }
        filesFound.push({
            filePath,
            name,
            fileContents: (fileContents === null || fileContents === void 0 ? void 0 : fileContents.default) || fileContents,
        });
    }
    return filesFound;
};
