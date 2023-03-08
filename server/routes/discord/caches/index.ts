import { APIGuild } from "discord.js";
import { client } from "../../../../bot";
import Router from "../../Router";
const router = new Router();

router.get("/", (req, res) => {
  return client.cache ? res.send(client.cache) : res.json({});
});

router.get("/guilds", async (req, res) => {
  return client.cache.guilds ? res.send(client.cache.guilds) : res.json({});
});

router.put<{
  guildId: string;
  data: APIGuild;
}>(
  "/guilds",
  async (req, res) => {
    if (!req.body.data || !req.body.guildId) return res.sendStatus(400);
    client.cache.guilds.set(req.body.guildId, req.body.data);
    return client.cache.guilds.get(req.body.guildId)
      ? res.sendStatus(200)
      : res.sendStatus(400);
  },
  [
    {
      key: "guildId",
      type: "string",
    },
    {
      key: "data",
      type: "object",
    },
  ]
);

export default router;
