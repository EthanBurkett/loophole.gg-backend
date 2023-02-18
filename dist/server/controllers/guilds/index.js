"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuildController = exports.getGuildPermissionsController = exports.getGuildsController = void 0;
const guilds_1 = require("../../services/guilds");
async function getGuildsController(req, res) {
    const user = req.user;
    try {
        const guilds = await (0, guilds_1.getAllGuildsService)(user.discordId);
        res.send(guilds);
    }
    catch (err) {
        console.error(err);
        res.status(400).send({ msg: "Error" });
    }
}
exports.getGuildsController = getGuildsController;
async function getGuildPermissionsController(req, res) {
    const user = req.user;
    const { id } = req.params;
    try {
        const guilds = await (0, guilds_1.getMutualGuildsService)(user.discordId);
        const valid = guilds.some((guild) => guild.id === id);
        return valid ? res.sendStatus(200) : res.sendStatus(403);
    }
    catch (err) {
        console.error(err);
        res.status(400).send({ msg: "Error" });
    }
}
exports.getGuildPermissionsController = getGuildPermissionsController;
async function getGuildController(req, res) {
    const { id } = req.params;
    try {
        const guild = await (0, guilds_1.getGuildService)(id);
        res.send(guild);
    }
    catch (e) {
        console.error(e);
        res.status(400).send({ msg: "Error" });
    }
}
exports.getGuildController = getGuildController;
