"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const Client_1 = __importDefault(require("./Client"));
const discord_js_1 = require("discord.js");
const _config_1 = __importDefault(require("./!config"));
const autorole_model_1 = __importDefault(require("./models/autorole.model"));
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.DirectMessages,
    ],
    ws: {
        properties: {
            browser: "Discord iOS",
        },
    },
});
exports.client = client;
client.on("ready", async () => {
    const instance = new Client_1.default({
        client,
        bot: {
            commandsDir: "./bot/commands",
            testServers: [
                "1067602125099642912",
                "1044794654882791455",
                "1075530815557083306",
            ],
            eventsPath: "./bot/events",
        },
    });
    client.cache.autoroles = [];
    await loadCache();
    client.user.setPresence({
        activities: [
            {
                name: ".gg/loophole",
                type: discord_js_1.ActivityType.Watching,
                url: "https://discord.gg/loophole",
            },
        ],
    });
});
const loadCache = async () => {
    const autoroles = await autorole_model_1.default.find();
    client.cache.autoroles = autoroles;
};
client.login(_config_1.default.Beta ? _config_1.default.BetaToken : _config_1.default.Token);
