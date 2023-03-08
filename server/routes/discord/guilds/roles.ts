import Router from "../../Router";
const router = new Router();
import { client } from "../../../../bot";
import { Guild, Role } from "discord.js";
import { getGuild } from "../../../controllers/guilds";

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const guild = (await getGuild(id)) as Guild;

    return res.send(
      guild.roles.cache.map((r) => r).sort((a, b) => b.position - a.position)
    );
  } catch (e) {
    console.error(e);
    res.status(400).send({ msg: "Error" });
  }
});

router.get("/:id/:role", async (req, res) => {
  const id = req.params.id;
  const roleid = req.params.role;
  try {
    const guild = (await getGuild(id)) as Guild;

    let role: Role | undefined | null = guild.roles.cache.find(
      (r) => r.id === roleid
    );
    if (!role) {
      role = await guild.roles.fetch(roleid).then((r) => r);
    }

    return role ? res.send(role) : res.sendStatus(404);
  } catch (e) {
    console.error(e);
    res.status(400).send({ msg: "Error" });
  }
});

export default router;
