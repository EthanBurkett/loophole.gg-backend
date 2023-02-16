"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Client_1 = require("../Client");
const webhooks_model_1 = __importDefault(require("../models/webhooks.model"));
const _config_1 = require("../!config");
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
        {
            name: "info",
            description: "Get info about a webhook",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "webhook",
                    description: "Webhook to get info about",
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "channel",
                    description: "Channel to get webhook info from",
                    type: discord_js_1.ApplicationCommandOptionType.Channel,
                    required: false,
                },
            ],
        },
        {
            name: "delete",
            description: "Delete a webhook",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "webhook",
                    description: "Webhook to delete",
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "channel",
                    description: "Channel to delete webhook from",
                    type: discord_js_1.ApplicationCommandOptionType.Channel,
                    required: false,
                },
            ],
        },
    ],
    async execute({ interaction, client }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (!interaction)
            return;
        const subcommand = interaction.options.getSubcommand(true);
        if (subcommand === "create") {
            console.log("test");
            const name = interaction.options.getString("name", true);
            const channel = interaction.options.getChannel("channel", true);
            if (name.length > 16)
                return "Webhook name must be 16 characters or less";
            if (channel.type !== discord_js_1.ChannelType.GuildText)
                return "Channel must be a text channel";
            const webhooks = await channel.fetchWebhooks();
            const exists = await webhooks_model_1.default.findOne({
                guildId: (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.id,
                channelId: channel.id,
                webhook: name,
            });
            const webhookExists = webhooks.find((w) => w.name.toLowerCase() == name.toLowerCase());
            if (webhookExists || exists) {
                return "A webhook with that name already exists in this channel";
            }
            const webhook = await channel.createWebhook({
                name,
                reason: `Webhook created by ${interaction.user.tag}`,
            });
            const webhookModel = new webhooks_model_1.default({
                guildId: (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.id,
                channelId: channel.id,
                webhook: webhook.name,
                createdBy: interaction.user.id,
                webhookId: webhook.id,
            });
            await webhookModel.save();
            return {
                embeds: [
                    new discord_js_1.EmbedBuilder({
                        title: "Webhook Created",
                        color: _config_1.Colors.success,
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
        else if (subcommand === "info") {
            const channel = interaction.options.getChannel("channel", false);
            const webhook = interaction.options.getString("webhook", true);
            let webhookModel = channel
                ? await webhooks_model_1.default.find({
                    guildId: (_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.id,
                    webhook,
                    channelId: channel.id,
                })
                : await webhooks_model_1.default.find({
                    guildId: (_d = interaction.guild) === null || _d === void 0 ? void 0 : _d.id,
                    webhook,
                });
            if (webhookModel.length < 1)
                return {
                    embeds: [
                        new discord_js_1.EmbedBuilder({
                            title: "No Webhooks Found",
                            color: _config_1.Colors.error,
                        }),
                    ],
                };
            interaction
                .reply({
                embeds: [
                    new discord_js_1.EmbedBuilder({
                        title: "Webhook Info",
                        color: _config_1.Colors.info,
                        fields: [
                            {
                                name: "Webhook ID",
                                value: webhookModel[0].webhookId,
                                inline: true,
                            },
                            {
                                name: "Webhook Name",
                                value: webhookModel[0].webhook,
                                inline: true,
                            },
                            {
                                name: "Channel",
                                value: `<#${webhookModel[0].channelId}>`,
                            },
                            {
                                name: "Created By",
                                value: `<@${webhookModel[0].createdBy}> (${webhookModel[0].createdBy})`,
                                inline: true,
                            },
                            {
                                name: "Created At",
                                value: new Date(webhookModel[0].createdAt).toLocaleString(),
                                inline: true,
                            },
                        ],
                    }),
                ],
            })
                .catch(() => { });
            if (webhookModel.length > 1) {
                for (const webhook of webhookModel) {
                    if (webhook.webhookId !== webhookModel[0].webhookId) {
                        setTimeout(() => {
                            var _a;
                            (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.send({
                                embeds: [
                                    new discord_js_1.EmbedBuilder({
                                        title: `Webhook Info`,
                                        description: `Showing other webhooks with the same name (${webhookModel.length})`,
                                        color: _config_1.Colors.info,
                                        fields: [
                                            {
                                                name: "Webhook ID",
                                                value: webhook.webhookId,
                                                inline: true,
                                            },
                                            {
                                                name: "Webhook Name",
                                                value: webhook.webhook,
                                                inline: true,
                                            },
                                            {
                                                name: "Channel",
                                                value: `<#${webhook.channelId}>`,
                                            },
                                            {
                                                name: "Created By",
                                                value: `<@${webhook.createdBy}> (${webhook.createdBy})`,
                                                inline: true,
                                            },
                                            {
                                                name: "Created At",
                                                value: new Date(webhook.createdAt).toLocaleString(),
                                                inline: true,
                                            },
                                        ],
                                    }),
                                ],
                            });
                        }, 1000);
                    }
                }
            }
        }
        else if (subcommand === "delete") {
            const channel = interaction.options.getChannel("channel", false);
            const webhook = interaction.options.getString("webhook", true);
            let webhookModel = channel
                ? await webhooks_model_1.default.find({
                    guildId: (_e = interaction.guild) === null || _e === void 0 ? void 0 : _e.id,
                    webhook,
                    channelId: channel.id,
                })
                : await webhooks_model_1.default.find({
                    guildId: (_f = interaction.guild) === null || _f === void 0 ? void 0 : _f.id,
                    webhook,
                });
            if (!webhookModel)
                return "Webhook not found";
            const channelWebhooks = await ((_g = interaction.guild) === null || _g === void 0 ? void 0 : _g.channels.cache.map(async (c) => {
                if (c.type === discord_js_1.ChannelType.GuildText) {
                    return await c.fetchWebhooks();
                }
            }));
            channelWebhooks === null || channelWebhooks === void 0 ? void 0 : channelWebhooks.map(async (w) => {
                var _a;
                const webhook = (_a = (await w)) === null || _a === void 0 ? void 0 : _a.find((w) => w.name.toLowerCase() == webhookModel[0].webhook.toLowerCase());
                if (webhook) {
                    await webhook.delete();
                }
            });
            channel
                ? await webhooks_model_1.default.deleteMany({
                    guildId: (_h = interaction.guild) === null || _h === void 0 ? void 0 : _h.id,
                    channelId: channel.id,
                    webhook,
                })
                : await webhooks_model_1.default.deleteMany({
                    guildId: (_j = interaction.guild) === null || _j === void 0 ? void 0 : _j.id,
                    webhook,
                });
            interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder({
                        title: "Webhook Deleted",
                        color: _config_1.Colors.success,
                        fields: [
                            {
                                name: "Webhook Name",
                                value: webhookModel[0].webhook,
                            },
                            {
                                name: "Channel",
                                value: `<#${webhookModel[0].channelId}>`,
                            },
                        ],
                    }),
                ],
            });
            if (webhookModel.length > 1) {
                for (const webhook of webhookModel) {
                    if (webhook.webhookId !== webhookModel[0].webhookId) {
                        setTimeout(() => {
                            var _a;
                            (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.send({
                                embeds: [
                                    new discord_js_1.EmbedBuilder({
                                        title: `Webhook Deleted`,
                                        description: `Deleted webhooks in other channels with the same name (${webhookModel.length})`,
                                        color: _config_1.Colors.success,
                                        fields: [
                                            {
                                                name: "Webhook Name",
                                                value: webhook.webhook,
                                            },
                                            {
                                                name: "Channel",
                                                value: `<#${webhook.channelId}>`,
                                            },
                                        ],
                                    }),
                                ],
                            });
                        }, 1000);
                    }
                }
            }
        }
    },
};
