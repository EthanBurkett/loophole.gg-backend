"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Client_1 = require("../Client");
const webhooks_model_1 = __importDefault(require("../models/webhooks.model"));
exports.default = {
    description: "Configure webhooks for this server",
    type: Client_1.CommandType.Slash,
    testOnly: true,
    permission: "Administrator",
    options: [
        {
            name: "create",
            description: "Create a webhook",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "name",
                    description: "Name of the webhook (max 16 characters)",
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "channel",
                    description: "Channel to send webhook messages",
                    type: discord_js_1.ApplicationCommandOptionType.Channel,
                    required: true,
                },
            ],
        },
        {
            name: "addcommand",
            description: "Add a command to log to a webhook",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "command",
                    description: "Command to log",
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "channel",
                    description: "Channel to send webhook messages",
                    type: discord_js_1.ApplicationCommandOptionType.Channel,
                    required: true,
                },
                {
                    name: "webhook",
                    description: "Webhook to log to",
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
    ],
    async execute({ interaction, client }) {
        var _a;
        if (!interaction)
            return;
        const subcommand = interaction.options.getSubcommand(true);
        if (subcommand === "create") {
            const name = interaction.options.getString("name", true);
            const channel = interaction.options.getChannel("channel", true);
            if (name.length > 16)
                return "Webhook name must be 16 characters or less";
            if (channel.type !== discord_js_1.ChannelType.GuildText)
                return "Channel must be a text channel";
            const webhook = await channel.createWebhook({
                name,
                reason: `Webhook created by ${interaction.user.tag}`,
            });
            const webhookModel = new webhooks_model_1.default({
                guildId: (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.id,
                channelId: channel.id,
                webhook: webhook.name,
                createdBy: interaction.user.id,
            });
            await webhookModel.save();
            return {
                embeds: [
                    new discord_js_1.EmbedBuilder({
                        title: "Webhook Created",
                        fields: [
                            {
                                name: "Webhook ID",
                                value: webhook.id,
                            },
                            {
                                name: "Webhook Name",
                                value: webhook.name,
                            },
                            {
                                name: "Channel",
                                value: `<#${channel.id}>`,
                            },
                        ],
                    }),
                ],
            };
        }
    },
};
