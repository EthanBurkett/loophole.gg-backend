import CustomClient from "./Client";
import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import path from "path";
import Config from "./!config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.on("ready", () => {
  const instance = new CustomClient({
    client,
    bot: {
      commandsDir: "./bot/commands",
      testServers: ["1067602125099642912", "1044794654882791455"],
      eventsPath: "./bot/events",
    },
  });

  client.user!.setPresence({
    activities: [
      {
        name: ".gg/loophole",
        type: ActivityType.Watching,
        url: "https://discord.gg/loophole",
      },
    ],
  });
});

client.login(Config.Token);

export { client };
