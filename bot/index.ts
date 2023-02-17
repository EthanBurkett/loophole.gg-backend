import CustomClient from "./Client";
import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import path from "path";
import Config from "./!config";
import autoroleModel from "./models/autorole.model";
import { Production } from "../!global";
import { Sendgrid } from "./utils/Sendgrid";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  ws: {
    properties: {
      browser: "Discord iOS",
    },
  },
});

client.on("ready", async () => {
  const instance = new CustomClient({
    client,
    bot: {
      commandsDir: Production ? "dist/bot/commands" : "./bot/commands",
      testServers: [
        "1067602125099642912",
        "1044794654882791455",
        "1075530815557083306",
      ],
      eventsPath: Production ? "dist/bot/events" : "./bot/events",
    },
  });

  client.cache.autoroles = [];

  await loadCache();

  client.user!.setPresence({
    activities: [
      {
        name: ".gg/loophole",
        type: ActivityType.Watching,
        url: "https://discord.gg/loophole",
      },
    ],
  });

  const sg = new Sendgrid();
});

const loadCache = async () => {
  const autoroles = await autoroleModel.find();
  client.cache.autoroles = autoroles;
};

client.login(Config.Beta ? Config.BetaToken : Config.Token);

export { client };
