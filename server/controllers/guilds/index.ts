import { Request, Response } from "express";
import {
  getAllGuildsService,
  getGuildService,
  getMutualGuildsService,
} from "../../services/guilds";
import { User } from "../../models/user.model";
import { client } from "../../../bot";
import { APIGuild } from "discord.js";

export async function getGuildsController(req: Request, res: Response) {
  const user = req.user as User;
  try {
    const guilds = await getAllGuildsService(user.discordId);
    res.send(guilds);
  } catch (err) {
    console.error(err);
    res.status(400).send({ msg: "Error" });
  }
}

export async function getGuildPermissionsController(
  req: Request,
  res: Response
) {
  const user = req.user as User;
  const { id } = req.params;

  try {
    const guilds = await getMutualGuildsService(user.discordId);
    const valid = guilds.some((guild) => guild.id === id);
    return valid ? res.sendStatus(200) : res.sendStatus(403);
  } catch (err) {
    console.error(err);
    res.status(400).send({ msg: "Error" });
  }
}

export async function getGuild(id) {
  if (client.cache.guilds.has(id)) return client.cache.guilds.get(id);
  try {
    const guild = await getGuildService(id);
    client.cache.guilds.set(id, guild as any);
    return guild;
  } catch (e) {
    console.error(e);
  }
}

export async function getGuildController(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const guild = await getGuild(id);
    return res.send(guild);
  } catch (e) {
    console.error(e);
    res.status(400).send({ msg: "Error" });
  }
}
