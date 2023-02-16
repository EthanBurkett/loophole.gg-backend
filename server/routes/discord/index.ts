import { client } from "../../../bot";
import { Router } from "express";
import { GuildMember } from "discord.js";
import { User } from "../../models/user.model";
import guilds from "./guilds";
import { getAdminGuildsService } from "../../services/guilds";
const router = Router();

router.get("/user", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const user = await client.users
    .fetch((req.user as User).discordId)
    .then((user) => user);

  return user
    ? res.json(user)
    : res.status(404).json({ error: "User not found" });
});

router.get("/nonbotguilds", async (req, res) => {
  const data = await getAdminGuildsService((req.user as User).discordId);

  return res.json(data);
});

router.get("/usercount", async (req, res) => {
  const guilds = await client.guilds.fetch().then((guilds) => guilds);
  let count = 0;
  for (const [id, guild] of guilds) {
    const Guild = await guild.fetch().then((g) => g);
    const res = Guild.memberCount;
    count += res;
  }
  return res.send({ count });
});

export default router;
