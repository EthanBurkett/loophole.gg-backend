"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("../../../bot");
const express_1 = require("express");
const guilds_1 = require("../../services/guilds");
const router = (0, express_1.Router)();
router.get("/user", async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    const user = await bot_1.client.users
        .fetch(req.user.discordId)
        .then((user) => user);
    return user
        ? res.json(user)
        : res.status(404).json({ error: "User not found" });
});
router.get("/nonbotguilds", async (req, res) => {
    const data = await (0, guilds_1.getAdminGuildsService)(req.user.discordId);
    return res.json(data);
});
router.get("/usercount", async (req, res) => {
    const guilds = await bot_1.client.guilds.fetch().then((guilds) => guilds);
    let count = 0;
    for (const [id, guild] of guilds) {
        const Guild = await guild.fetch().then((g) => g);
        const res = Guild.memberCount;
        count += res;
    }
    return res.send({ count });
});
exports.default = router;
