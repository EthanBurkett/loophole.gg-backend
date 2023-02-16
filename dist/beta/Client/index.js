"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandType = void 0;
const discord_js_1 = require("discord.js");
const commandLoader_1 = __importDefault(require("./Handlers/commandLoader"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class CustomClient {
    constructor(settings) {
        var _a;
        this._settings = settings;
        this._settings.client.log = (...message) => {
            console.log(chalk_1.default.redBright.bold("Client Logs"), chalk_1.default.grey.bold("»"), ...message);
        };
        this._settings.client.error = (...message) => {
            console.log(chalk_1.default.bgRed.whiteBright.bold(" Error "), chalk_1.default.grey.bold("»"), ...message);
        };
        this._settings.client.cache = {
            prefixes: new discord_js_1.Collection(),
        };
        if (this._settings.mongo) {
            this._mongo();
        }
        this._commandLoader = new commandLoader_1.default(this._settings.client, settings);
        this._commands = this._commandLoader.commands;
        this._commandHandler = new commandHandler_1.default(this._settings.client, this);
        if (this._settings.bot.eventsPath) {
            this._loadEvents();
        }
        this._settings.client.log(`${(_a = this._settings.client.user) === null || _a === void 0 ? void 0 : _a.tag} is now ready.`);
    }
    get commands() {
        return this._commands;
    }
    get settings() {
        return this._settings;
    }
    get cache() {
        return this._settings.client.cache;
    }
    _loadEvents() {
        const eventFiles = getEventFiles(this._settings.bot.eventsPath);
        for (const file of eventFiles) {
            let event = require(path_1.default.join(process.cwd(), file.filePath));
            if (event.default)
                event = event.default;
            event(this._settings.client, this);
        }
    }
    async _mongo() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        mongoose_1.default.set("strictQuery", true);
        try {
            await mongoose_1.default.connect(`mongodb${((_a = this._settings.mongo) === null || _a === void 0 ? void 0 : _a.uri.srv) ? "+srv" : ""}://${(_b = this._settings.mongo) === null || _b === void 0 ? void 0 : _b.uri.username}:${encodeURIComponent((_c = this._settings.mongo) === null || _c === void 0 ? void 0 : _c.uri.password)}@${(_d = this._settings.mongo) === null || _d === void 0 ? void 0 : _d.uri.host}${((_e = this._settings.mongo) === null || _e === void 0 ? void 0 : _e.uri.srv)
                ? ``
                : `:${(_f = this._settings.mongo) === null || _f === void 0 ? void 0 : _f.uri.port}`}/${(_g = this._settings.mongo) === null || _g === void 0 ? void 0 : _g.uri.database}`, (_h = this._settings.mongo) === null || _h === void 0 ? void 0 : _h.dbOptions);
            this._settings.client.log(`Connected to MongoDB.`);
        }
        catch (e) {
            this._settings.client.error(`Failed to connect to MongoDB: ${e}`);
            process.exit(0);
        }
    }
}
exports.default = CustomClient;
const getEventFiles = (path, foldersOnly = false) => {
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
                filesFound = [...filesFound, ...getEventFiles(filePath)];
            }
            continue;
        }
        const L = filePath.replace(/\\/g, "/").replace(/\\\\/g, "/").split("/");
        let name = [L[L.length - 1].substring(0, L[L.length - 1].length - 3)];
        let fileContents = require(path_1.default.join(process.cwd(), filePath));
        if (fileContents.default)
            fileContents = fileContents.default;
        filesFound.push({
            filePath,
            name,
            fileContents: (fileContents === null || fileContents === void 0 ? void 0 : fileContents.default) || fileContents,
        });
    }
    return filesFound;
};
const mongoose_1 = __importDefault(require("mongoose"));
const commandHandler_1 = __importDefault(require("./Handlers/commandHandler"));
var CommandType;
(function (CommandType) {
    CommandType["Legacy"] = "legacy";
    CommandType["Slash"] = "slash";
    CommandType["Both"] = "both";
})(CommandType = exports.CommandType || (exports.CommandType = {}));
