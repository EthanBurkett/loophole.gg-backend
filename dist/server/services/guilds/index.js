"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGuildService = exports.getMutualGuildsService = exports.getUserGuildsService = exports.getAllGuildsService = exports.getAdminGuildsService = exports.getBotGuildsService = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../../constants");
const _config_1 = __importDefault(require("../../../bot/!config"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const bot_1 = require("../../../bot");
function getBotGuildsService() {
    return axios_1.default.get(`${constants_1.DiscordApiUrl}/users/@me/guilds`, {
        headers: {
            Authorization: `Bot ${_config_1.default.Token}`,
        },
    });
}
exports.getBotGuildsService = getBotGuildsService;
async function getAdminGuildsService(id) {
    const { data: userGuilds } = await getUserGuildsService(id);
    const botGuilds = bot_1.client.guilds.cache.map((guild) => guild);
    const adminUserGuilds = userGuilds.filter(({ permissions }) => (parseInt(permissions) & 0x8) === 0x8);
    return adminUserGuilds.filter((guild) => !botGuilds.some((botGuild) => botGuild.id == guild.id));
}
exports.getAdminGuildsService = getAdminGuildsService;
async function getAllGuildsService(id) {
    const { data: userGuilds } = await getUserGuildsService(id);
    const botGuilds = bot_1.client.guilds.cache.map((guild) => guild);
    const adminUserGuilds = userGuilds.filter(({ permissions }) => (parseInt(permissions) & 0x8) === 0x8);
    let mutuals = adminUserGuilds.filter((guild) => botGuilds.some((botGuild) => botGuild.id == guild.id));
    let nonMutuals = adminUserGuilds.filter((guild) => !botGuilds.some((botGuild) => botGuild.id == guild.id));
    return { botGuilds, mutuals, nonbotGuilds: nonMutuals };
}
exports.getAllGuildsService = getAllGuildsService;
async function getUserGuildsService(id) {
    const user = await user_model_1.default.findOne({ discordId: id });
    if (!user) {
        console.error("No user found");
        process.exit(0);
    }
    return axios_1.default.get(`${constants_1.DiscordApiUrl}/users/@me/guilds`, {
        headers: {
            Authorization: `Bearer ${user.accessToken}`,
        },
    });
}
exports.getUserGuildsService = getUserGuildsService;
async function getMutualGuildsService(id) {
    const botGuilds = bot_1.client.guilds.cache.map((guild) => guild);
    const { data: userGuilds } = await getUserGuildsService(id);
    const adminUserGuilds = userGuilds.filter(({ permissions }) => (parseInt(permissions) & 0x8) === 0x8);
    return adminUserGuilds.filter((guild) => botGuilds.some((botGuild) => botGuild.id == guild.id));
}
exports.getMutualGuildsService = getMutualGuildsService;
function getGuildService(id) {
    return axios_1.default.get(`${constants_1.DiscordApiUrl}/guilds/${id}`, {
        headers: {
            Authorization: `Bot ${_config_1.default.Token}`,
        },
    });
}
exports.getGuildService = getGuildService;
