import axios, { AxiosResponse } from "axios";
import { DiscordApiUrl } from "../../constants";
import Config from "../../!config";
import BotConfig from "../../../bot/!config";
import userModel from "../../models/user.model";
import { client } from "../../../bot";

export interface PartialGuild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: string;
}

export function getBotGuildsService(): Promise<
  AxiosResponse<PartialGuild[], any>
> {
  return axios.get<PartialGuild[]>(`${DiscordApiUrl}/users/@me/guilds`, {
    headers: {
      Authorization: `Bot ${BotConfig.Token}`,
    },
  });
}

export async function getAdminGuildsService(id: string) {
  const { data: userGuilds } = await getUserGuildsService(id);
  const botGuilds = client.guilds.cache.map((guild) => guild);

  const adminUserGuilds = userGuilds.filter(
    ({ permissions }) => (parseInt(permissions) & 0x8) === 0x8
  );

  return adminUserGuilds.filter(
    (guild) => !botGuilds.some((botGuild) => botGuild.id == guild.id)
  );
}

export async function getAllGuildsService(id: string) {
  const { data: userGuilds } = await getUserGuildsService(id);
  const botGuilds = client.guilds.cache.map((guild) => guild);

  const adminUserGuilds = userGuilds.filter(
    ({ permissions }) => (parseInt(permissions) & 0x8) === 0x8
  );
  let mutuals = adminUserGuilds.filter((guild) =>
    botGuilds.some((botGuild) => botGuild.id == guild.id)
  );
  let nonMutuals = adminUserGuilds.filter(
    (guild) => !botGuilds.some((botGuild) => botGuild.id == guild.id)
  );

  return { botGuilds, mutuals, nonbotGuilds: nonMutuals };
}

export async function getUserGuildsService(id: string) {
  const user = await userModel.findOne({ discordId: id });
  if (!user) {
    console.error("No user found");
    process.exit(0);
  }

  return axios.get<PartialGuild[]>(`${DiscordApiUrl}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
}

export async function getMutualGuildsService(id: string) {
  const botGuilds = client.guilds.cache.map((guild) => guild);
  const { data: userGuilds } = await getUserGuildsService(id);
  // const { data: botGuilds } = await getBotGuildsService();
  // const { data: userGuilds } = await getUserGuildsService(id);

  const adminUserGuilds = userGuilds.filter(
    ({ permissions }) => (parseInt(permissions) & 0x8) === 0x8
  );
  return adminUserGuilds.filter((guild) =>
    botGuilds.some((botGuild) => botGuild.id == guild.id)
  );
}

export function getGuildService(id: string) {
  return axios.get(`${DiscordApiUrl}/guilds/${id}`, {
    headers: {
      Authorization: `Bot ${BotConfig.Token}`,
    },
  });
}
