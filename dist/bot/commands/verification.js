"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _config_1 = require("../!config");
const discord_js_1 = require("discord.js");
const Client_1 = require("../Client");
exports.default = {
    description: "Setup verification",
    type: Client_1.CommandType.Slash,
    testOnly: true,
    permission: "Administrator",
    options: [
        {
            name: "channel",
            description: "Channel to send verification message",
            type: discord_js_1.ApplicationCommandOptionType.Channel,
            required: true,
        },
        {
            name: "verify",
            description: "Type of verification. None = click button to verify",
            type: discord_js_1.ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "None",
                    value: "none",
                },
                {
                    name: "Captcha",
                    value: "captcha",
                },
                {
                    name: "One Time Password",
                    value: "otp",
                },
            ],
        },
    ],
    async execute({ interaction, client }) {
        if (!interaction)
            return;
        const channel = interaction.options.getChannel("channel", true);
        const verifyType = interaction.options.getString("verify", true);
        if (verifyType === "none") {
            const row = new discord_js_1.ActionRowBuilder({
                components: [
                    new discord_js_1.ButtonBuilder({
                        label: "Verify",
                        style: discord_js_1.ButtonStyle.Success,
                        customId: "verify_none",
                    }),
                ],
            });
            const embed = new _config_1.EmbedBuilder({
                title: "Verification",
                description: "Click the button below to verify yourself.",
                color: _config_1.Colors.info,
            });
            await channel
                .send({
                embeds: [embed],
                components: [row],
            })
                .catch((err) => {
                client.error(err);
            });
        }
        else {
            const row = new discord_js_1.ActionRowBuilder({
                components: verifyType == "otp"
                    ? [
                        new discord_js_1.ButtonBuilder({
                            label: "Verify",
                            style: discord_js_1.ButtonStyle.Link,
                            url: `https://loophole.gg/verify/${interaction.guild.id}/${interaction.user.id}`,
                        }),
                    ]
                    : [
                        new discord_js_1.ButtonBuilder({
                            label: "Verify",
                            style: discord_js_1.ButtonStyle.Primary,
                            customId: `verify_${verifyType}`,
                        }),
                    ],
            });
            const embed = new _config_1.EmbedBuilder({
                title: "Verification",
                description: "Click the button below to start the verification process.",
                color: _config_1.Colors.info,
            });
            await channel
                .send({
                embeds: [embed],
                components: [row],
            })
                .catch((err) => {
                client.error(err);
            });
        }
        interaction.reply({
            embeds: [
                new _config_1.EmbedBuilder({
                    title: "Verification",
                    color: _config_1.Colors.success,
                    description: "Verification setup successful. You may further customize verification in the dashboard.",
                }),
            ],
            ephemeral: true,
        });
    },
};
