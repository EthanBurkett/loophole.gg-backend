"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _config_1 = require("../!config");
const discord_js_1 = require("discord.js");
const Client_1 = require("../Client");
exports.default = {
    description: "Embed builder",
    type: Client_1.CommandType.Slash,
    testOnly: true,
    permission: "ManageMessages",
    options: [
        {
            name: "builder",
            description: "Interactive embed editor",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "channel",
                    description: "Channel to send embed",
                    type: discord_js_1.ApplicationCommandOptionType.Channel,
                    required: true,
                },
            ],
        },
        {
            name: "json",
            description: "Create an embed from JSON",
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "channel",
                    description: "Channel to send embed",
                    type: discord_js_1.ApplicationCommandOptionType.Channel,
                    required: true,
                },
                {
                    name: "json",
                    description: "JSON to create embed from",
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
    ],
    execute: async ({ interaction, client }) => {
        if (!interaction)
            return;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "json") {
            const channel = interaction.options.getChannel("channel", true);
            if (!channel)
                return;
            const json = interaction.options.getString("json", true);
            if (!json)
                return;
            const embed = new discord_js_1.EmbedBuilder(JSON.parse(json));
            await channel.send({ embeds: [embed] });
            await interaction
                .reply({
                embeds: [
                    new discord_js_1.EmbedBuilder({
                        title: "Embed Sent",
                        color: _config_1.Colors.success,
                    }),
                ],
            })
                .catch(() => { });
        }
        if (subcommand === "builder") {
            const channel = interaction.options.getChannel("channel", true);
            if (!channel)
                return;
            const embed = new discord_js_1.EmbedBuilder({
                title: "Embed builder",
                description: "This is an interactive embed builder. You can use the buttons below to edit the embed.",
                color: _config_1.Colors.info,
                thumbnail: {
                    url: client.user.displayAvatarURL(),
                },
            });
            const row1 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("title")
                .setLabel("Edit Title")
                .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
                .setCustomId("description")
                .setLabel("Edit Content")
                .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
                .setCustomId("color")
                .setLabel("Edit Color")
                .setStyle(discord_js_1.ButtonStyle.Secondary));
            const row2 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("images")
                .setLabel("Edit Images")
                .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
                .setCustomId("author")
                .setLabel("Edit Author")
                .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
                .setCustomId("footer")
                .setLabel("Edit Footer")
                .setStyle(discord_js_1.ButtonStyle.Secondary));
            const row3 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("cancel")
                .setLabel("Cancel")
                .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
                .setCustomId("finish")
                .setLabel("Finish")
                .setStyle(discord_js_1.ButtonStyle.Success));
            await interaction.deferReply();
            const message = await interaction
                .channel.send({
                embeds: [embed],
                components: [row1, row2, row3],
            })
                .catch((e) => console.log(e));
            const filter = (i) => i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({
                filter,
                componentType: discord_js_1.ComponentType.Button,
                time: 1000 * 60 * 3,
            });
            await interaction.deleteReply();
            collector.on("collect", async (i) => {
                var _a, _b, _c, _d, _e, _f;
                if (i.customId === "cancel") {
                    await message.delete();
                    collector.stop();
                }
                if (i.customId === "finish") {
                    channel.send({
                        embeds: [embed],
                    });
                    collector.stop();
                    i.reply({
                        embeds: [
                            new discord_js_1.EmbedBuilder({
                                title: "Embed Sent",
                                color: _config_1.Colors.success,
                            }),
                        ],
                    });
                }
                if (["title", "description"].includes(i.customId)) {
                    const Modal = new discord_js_1.ModalBuilder()
                        .setCustomId("modal")
                        .setTitle("Edit Embed");
                    const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
                        .setCustomId(i.customId)
                        .setLabel(`${i.customId}`)
                        .setValue(embed.data[i.customId])
                        .setStyle(i.customId == "title"
                        ? discord_js_1.TextInputStyle.Short
                        : discord_js_1.TextInputStyle.Paragraph));
                    Modal.addComponents(row);
                    await i.showModal(Modal);
                    i.awaitModalSubmit({
                        time: 60000,
                        filter: (i) => i.user.id === interaction.user.id,
                    }).then(async (i) => {
                        const fields = i.fields.fields.map((f) => f);
                        fields.map((f) => {
                            embed.data[f.customId] = f.value;
                        });
                        await message.edit({
                            embeds: [embed],
                            components: [row1, row2, row3],
                        });
                        i.reply({
                            embeds: [
                                new discord_js_1.EmbedBuilder({
                                    title: "Embed Updated",
                                    color: _config_1.Colors.success,
                                }),
                            ],
                            ephemeral: true,
                        });
                    });
                }
                if (["color"].includes(i.customId)) {
                    const Modal = new discord_js_1.ModalBuilder()
                        .setCustomId("modal")
                        .setTitle("Edit Embed");
                    const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
                        .setCustomId(i.customId)
                        .setLabel(`${i.customId}`)
                        .setValue(embed.data[i.customId].toString())
                        .setStyle(discord_js_1.TextInputStyle.Short));
                    Modal.addComponents(row);
                    await i.showModal(Modal);
                    i.awaitModalSubmit({
                        time: 60000,
                        filter: (i) => i.user.id === interaction.user.id,
                    }).then(async (i) => {
                        const fields = i.fields.fields.map((f) => f);
                        fields.map((f) => {
                            try {
                                embed.data.color = (0, discord_js_1.resolveColor)(f.value);
                            }
                            catch (e) {
                                i.reply({
                                    embeds: [
                                        new discord_js_1.EmbedBuilder({
                                            title: "Invalid Color",
                                            color: _config_1.Colors.error,
                                        }),
                                    ],
                                    ephemeral: true,
                                }).catch(() => { });
                            }
                        });
                        await message.edit({
                            embeds: [embed],
                            components: [row1, row2, row3],
                        });
                        i.reply({
                            embeds: [
                                new discord_js_1.EmbedBuilder({
                                    title: "Embed Updated",
                                    color: _config_1.Colors.success,
                                }),
                            ],
                            ephemeral: true,
                        }).catch(() => { });
                    });
                }
                if (["images", "footer", "author"].includes(i.customId)) {
                    const Modal = new discord_js_1.ModalBuilder()
                        .setCustomId("modal")
                        .setTitle("Edit Embed");
                    let modalRow1, modalRow2;
                    if (i.customId === "footer") {
                        modalRow1 =
                            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
                                .setCustomId("footer_text")
                                .setLabel(`Footer Text`)
                                .setValue(((_a = embed.data.footer) === null || _a === void 0 ? void 0 : _a.text) || "")
                                .setStyle(discord_js_1.TextInputStyle.Short)
                                .setRequired(false));
                        modalRow2 =
                            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
                                .setCustomId("footer_icon:url")
                                .setLabel(`Footer Icon`)
                                .setStyle(discord_js_1.TextInputStyle.Short)
                                .setValue(((_b = embed.data.footer) === null || _b === void 0 ? void 0 : _b.icon_url) || "")
                                .setRequired(false));
                    }
                    if (i.customId === "author") {
                        modalRow1 =
                            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
                                .setCustomId("author_name")
                                .setLabel(`Author Name`)
                                .setStyle(discord_js_1.TextInputStyle.Short)
                                .setValue(((_c = embed.data.author) === null || _c === void 0 ? void 0 : _c.name) || "")
                                .setRequired(false));
                        modalRow2 =
                            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
                                .setCustomId("author_icon:url")
                                .setLabel(`Author Icon`)
                                .setValue(((_d = embed.data.author) === null || _d === void 0 ? void 0 : _d.icon_url) || "")
                                .setStyle(discord_js_1.TextInputStyle.Short)
                                .setRequired(false));
                    }
                    if (i.customId === "images") {
                        modalRow1 =
                            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
                                .setCustomId("thumbnail_url")
                                .setLabel(`Thumbnail URL`)
                                .setValue(((_e = embed.data.thumbnail) === null || _e === void 0 ? void 0 : _e.url) || "")
                                .setStyle(discord_js_1.TextInputStyle.Short)
                                .setRequired(false));
                        modalRow2 =
                            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
                                .setCustomId("image_url")
                                .setLabel(`Image URL`)
                                .setValue(((_f = embed.data.image) === null || _f === void 0 ? void 0 : _f.url) || "")
                                .setStyle(discord_js_1.TextInputStyle.Short)
                                .setRequired(false));
                    }
                    Modal.addComponents(modalRow1, modalRow2);
                    await i.showModal(Modal);
                    i.awaitModalSubmit({
                        time: 60000,
                        filter: (i) => i.user.id === interaction.user.id,
                    }).then(async (i) => {
                        const fields = i.fields.fields.map((f) => f);
                        fields.map((f) => {
                            var _a, _b, _c, _d, _e, _f;
                            const data = (_c = (_b = (_a = f.customId) === null || _a === void 0 ? void 0 : _a.split("_")[0]) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === null || _c === void 0 ? void 0 : _c.replace(/:/g, "_");
                            const value = (_f = (_e = (_d = f.customId) === null || _d === void 0 ? void 0 : _d.split("_")[1]) === null || _e === void 0 ? void 0 : _e.toLowerCase()) === null || _f === void 0 ? void 0 : _f.replace(/:/g, "_");
                            embed.data[data] = {
                                [value]: f.value,
                            };
                        });
                        await message.edit({
                            embeds: [embed],
                            components: [row1, row2, row3],
                        });
                        i.reply({
                            embeds: [
                                new discord_js_1.EmbedBuilder({
                                    title: "Embed Updated",
                                    color: _config_1.Colors.success,
                                }),
                            ],
                            ephemeral: true,
                        }).catch(() => { });
                    });
                }
            });
            collector.on("end", async (_, reason) => {
                if (reason === "time") {
                    await message.edit({
                        embeds: [embed],
                        components: [row1, row2, row3],
                    });
                }
                await message.delete().catch(() => { });
            });
        }
        return;
    },
};
