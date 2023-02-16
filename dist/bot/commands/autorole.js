"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _config_1 = require("../!config");
const Client_1 = require("../Client");
const autorole_model_1 = __importDefault(require("../models/autorole.model"));
exports.default = {
    description: "Configure autoroles for the server",
    type: Client_1.CommandType.Slash,
    testOnly: true,
    permission: "Administrator",
    options: [
        {
            name: "add",
            description: "Add an autorole",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "role",
                    description: "Role to add",
                    type: discord_js_1.ApplicationCommandOptionType.Role,
                    required: true,
                },
            ],
        },
        {
            name: "remove",
            description: "Remove an autorole",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "role",
                    description: "Role to remove",
                    type: discord_js_1.ApplicationCommandOptionType.Role,
                    required: true,
                },
            ],
        },
        {
            name: "list",
            description: "List all autoroles",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
        },
    ],
    async execute({ interaction, client }) {
        var _a;
        if (!interaction)
            return;
        const subcommand = interaction.options.getSubcommand(true);
        if (subcommand === "add") {
            const role = interaction.options.getRole("role", true);
            const guildId = interaction.guildId;
            const exists = await autorole_model_1.default.findOne({
                guildId,
                roleId: role.id,
            });
            if (exists) {
                return await interaction
                    .reply({
                    embeds: [
                        new discord_js_1.EmbedBuilder({
                            title: "Autorole already exists",
                            color: _config_1.Colors.error,
                        }),
                    ],
                })
                    .catch(() => { });
            }
            const autorole = new autorole_model_1.default({
                guildId,
                roleId: role.id,
            });
            await autorole.save();
            client.cache.autoroles.push(autorole);
            await interaction
                .reply({
                embeds: [
                    new discord_js_1.EmbedBuilder({
                        title: "Added role to autoroles",
                        color: _config_1.Colors.success,
                        fields: [
                            {
                                name: "Role",
                                value: `<@&${role.id}>`,
                                inline: true,
                            },
                            {
                                name: "Admin",
                                value: `<@${interaction.user.id}>`,
                                inline: true,
                            },
                        ],
                    }),
                ],
            })
                .catch(() => { });
        }
        else if (subcommand === "remove") {
            const role = interaction.options.getRole("role", true);
            const guildId = interaction.guildId;
            const exists = await autorole_model_1.default.findOne({
                guildId,
                roleId: role.id,
            });
            if (!exists) {
                return await interaction
                    .reply({
                    embeds: [
                        new discord_js_1.EmbedBuilder({
                            title: "Autorole doesn't exist",
                            color: _config_1.Colors.error,
                        }),
                    ],
                })
                    .catch(() => { });
            }
            await autorole_model_1.default.deleteOne({
                guildId,
                roleId: role.id,
            });
            client.cache.autoroles = client.cache.autoroles.filter((autorole) => autorole.roleId !== role.id);
            await interaction
                .reply({
                embeds: [
                    new discord_js_1.EmbedBuilder({
                        title: "Removed role from autoroles",
                        color: _config_1.Colors.success,
                        fields: [
                            {
                                name: "Role",
                                value: `<@&${role.id}>`,
                                inline: true,
                            },
                            {
                                name: "Admin",
                                value: `<@${interaction.user.id}>`,
                                inline: true,
                            },
                        ],
                    }),
                ],
            })
                .catch(() => { });
        }
        else if (subcommand === "list") {
            const guildId = interaction.guildId;
            const autoroles = client.cache.autoroles.filter((autorole) => autorole.guildId === guildId);
            if (!autoroles.length) {
                return await interaction
                    .reply({
                    embeds: [
                        new discord_js_1.EmbedBuilder({
                            title: `No autoroles found for ${(_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.name}`,
                            color: _config_1.Colors.error,
                        }),
                    ],
                })
                    .catch(() => { });
            }
            await interaction
                .reply({
                embeds: [
                    new discord_js_1.EmbedBuilder({
                        title: "Autoroles",
                        color: _config_1.Colors.success,
                        fields: [
                            {
                                name: "List of autoroles",
                                value: `${autoroles
                                    .map((autorole, i) => `<@&${autorole.roleId}>${i % 2 === 1 ? `\n` : ` `}`)
                                    .join(" ")}`,
                            },
                        ],
                    }),
                ],
            })
                .catch(() => { });
        }
    },
};
