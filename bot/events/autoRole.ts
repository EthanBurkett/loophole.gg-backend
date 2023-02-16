import { Client } from "discord.js";
import CustomClient from "../Client";

export default (client: Client<boolean>, instance: CustomClient) => {
  client.on("guildMemberAdd", async (member) => {
    const autoroles = client.cache.autoroles.filter(
      (r) => r.guildId === member.guild.id
    );

    if (!autoroles.length) return;

    const roles = autoroles.map((r) => r.roleId);

    await member.roles.add(roles, "AutoRole").catch(() => {});
  });
};
