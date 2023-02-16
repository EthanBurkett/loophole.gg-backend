"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const Client_1 = __importDefault(require("./Client"));
const discord_js_1 = require("discord.js");
const _config_1 = __importDefault(require("./!config"));
const client = new discord_js_1.Client({
  intents: [
    discord_js_1.GatewayIntentBits.Guilds,
    discord_js_1.GatewayIntentBits.GuildMessages,
    discord_js_1.GatewayIntentBits.GuildMembers,
    discord_js_1.GatewayIntentBits.MessageContent,
    discord_js_1.GatewayIntentBits.DirectMessages,
  ],
});
exports.client = client;
client.on("ready", () => {
  const instance = new Client_1.default({
    client,
    bot: {
      commandsDir: "./dist/bot/commands",
      testServers: [
        "1067602125099642912",
        "1044794654882791455",
        "1075530815557083306",
      ],
      eventsPath: "./dist/bot/events",
    },
  });
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
client.login(_config_1.default.Token);
