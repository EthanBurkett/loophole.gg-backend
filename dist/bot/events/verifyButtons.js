"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _config_1 = require("../!config");
const discord_js_1 = require("discord.js");
const canvas_1 = require("canvas");
const Sendgrid_1 = require("../utils/Sendgrid");
const user_model_1 = __importDefault(require("../../server/models/user.model"));
exports.default = async (client) => {
    client.on("interactionCreate", async (interaction) => {
        var _a, _b, _c, _d, _e, _f;
        if (!interaction.isButton() || !interaction.guild)
            return;
        if (interaction.customId === "verify_none") {
            const user = interaction.user.id;
            const member = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get(user);
            if (!member)
                return;
            const role = (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.roles.cache.find((r) => r.name.toLowerCase() === "verified");
            if (!role)
                return;
            await member.roles.add(role).catch((e) => client.error(e));
            await interaction.reply({
                embeds: [
                    new _config_1.EmbedBuilder({
                        title: "Successfully verified",
                        color: _config_1.Colors.success,
                    }),
                ],
                ephemeral: true,
            });
        }
        else if (interaction.customId === "verify_captcha") {
            const user = interaction.user.id;
            const member = (_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.members.cache.get(user);
            if (!member)
                return;
            const { captcha, url, serverMessage } = await generateCaptcha(client, member);
            const role = (_d = interaction.guild) === null || _d === void 0 ? void 0 : _d.roles.cache.find((r) => r.name.toLowerCase() === "verified");
            if (!role)
                return;
            member
                .send({
                embeds: [
                    new _config_1.EmbedBuilder({
                        title: "Verification",
                        description: `Please respond with the exact text you see below to be verified in ${interaction.guild.name}. You have 30 seconds to respond.`,
                        color: _config_1.Colors.info,
                        image: {
                            url,
                        },
                    }),
                ],
            })
                .catch(() => { })
                .then((m) => {
                if (!m)
                    return;
                interaction.reply({
                    embeds: [
                        new _config_1.EmbedBuilder({
                            title: "Verification",
                            description: `Please check your DMs for the captcha.`,
                            color: _config_1.Colors.info,
                        }),
                    ],
                    ephemeral: true,
                });
                const collector = m.channel.createMessageCollector({
                    time: 30 * 1000,
                    max: 1,
                    filter: (msg) => msg.author.id === member.user.id,
                });
                collector.on("collect", async (msg) => {
                    await serverMessage.delete().catch(() => { });
                    if (msg.content.toLowerCase() === captcha.toLowerCase()) {
                        await member.roles.add(role).catch((e) => client.error(e));
                        await msg
                            .reply({
                            embeds: [
                                new _config_1.EmbedBuilder({
                                    title: "Successfully verified",
                                    color: _config_1.Colors.success,
                                }),
                            ],
                        })
                            .catch(() => { });
                    }
                    else {
                        await msg
                            .reply({
                            embeds: [
                                new _config_1.EmbedBuilder({
                                    title: "Verification failed",
                                    color: _config_1.Colors.error,
                                }),
                            ],
                        })
                            .catch(() => { });
                    }
                });
            });
        }
        else if (interaction.customId === "verify_otp") {
            const verificationCode = Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();
            const invite = await ((_e = interaction.guild) === null || _e === void 0 ? void 0 : _e.invites.create(interaction.channel, {
                maxAge: 0,
                maxUses: 1,
                unique: true,
                reason: "Verification",
            }).catch(() => { }));
            if (!invite) {
                interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new _config_1.EmbedBuilder({
                            title: "Error",
                            description: "Unable to create an invite.",
                            color: _config_1.Colors.error,
                        }),
                    ],
                });
                return;
            }
            const sendgrid = new Sendgrid_1.Sendgrid();
            const user = await user_model_1.default.findOne({
                discordId: interaction.user.id,
            });
            if (!user) {
                interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new _config_1.EmbedBuilder({
                            title: "Click here to login",
                            description: "Please login to the dashboard to continue verification.",
                            color: _config_1.Colors.error,
                            url: `https://api.loophole.gg/auth/discord`,
                        }),
                    ],
                });
            }
            const member = (_f = interaction.guild) === null || _f === void 0 ? void 0 : _f.members.cache.get(interaction.user.id);
            sendgrid
                .sendOTP(user === null || user === void 0 ? void 0 : user.email, {
                code: verificationCode,
                discordinvite: invite.url,
                guildname: interaction.guild.name,
            })
                .then(() => {
                member
                    .send({
                    embeds: [
                        new _config_1.EmbedBuilder({
                            title: "E-Mail OTP Verification",
                            description: `You have been sent an email at \`${user.email}\`. Please respond within 2 minutes with the code you see in the email.`,
                            color: _config_1.Colors.info,
                        }),
                    ],
                })
                    .catch(() => {
                    interaction.reply({
                        ephemeral: true,
                        embeds: [
                            new _config_1.EmbedBuilder({
                                title: "Error",
                                description: "Unable to send you a DM.",
                                color: _config_1.Colors.error,
                            }),
                        ],
                    });
                })
                    .then((m) => {
                    if (!m)
                        return;
                    interaction
                        .reply({
                        embeds: [
                            new _config_1.EmbedBuilder({
                                title: "Verification",
                                description: `Please check your DMs to continue verification.`,
                                color: _config_1.Colors.info,
                            }),
                        ],
                        ephemeral: true,
                    })
                        .catch(() => { });
                    const collector = m.channel.createMessageCollector({
                        time: 120 * 1000,
                        max: 1,
                        filter: (msg) => msg.author.id === member.user.id,
                    });
                    collector.on("collect", async (msg) => {
                        var _a;
                        if (msg.content.toLowerCase() === verificationCode.toLowerCase()) {
                            const role = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.find((r) => r.name.toLowerCase() === "verified");
                            if (!role)
                                return;
                            await member.roles.add(role).catch((e) => client.error(e));
                            await msg
                                .reply({
                                embeds: [
                                    new _config_1.EmbedBuilder({
                                        title: "Successfully verified",
                                        color: _config_1.Colors.success,
                                    }),
                                ],
                            })
                                .catch(() => { });
                        }
                        else {
                            await msg
                                .reply({
                                embeds: [
                                    new _config_1.EmbedBuilder({
                                        title: "Verification failed",
                                        color: _config_1.Colors.error,
                                    }),
                                ],
                            })
                                .catch(() => { });
                        }
                    });
                    collector.on("end", (collected, reason) => {
                        if (reason === "time") {
                            m.reply({
                                embeds: [
                                    new _config_1.EmbedBuilder({
                                        title: "Verification failed",
                                        description: "You took too long to respond.",
                                        color: _config_1.Colors.error,
                                    }),
                                ],
                            }).catch(() => { });
                        }
                    });
                });
            });
        }
    });
};
const generateCaptcha = async (client, member) => {
    var _a, _b;
    const canvas = (0, canvas_1.createCanvas)(200, 100);
    const ctx = canvas.getContext("2d");
    ctx.font = "30px Sans Serif";
    ctx.fillStyle = "rgb(40,40,40)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let captcha = [];
    for (let i = 0; i < 6; i++) {
        const prev = captcha[captcha.length - 1];
        let x, y;
        if (prev) {
            x = prev.x + 30;
        }
        else
            x = 25;
        y = Math.floor(Math.random() * canvas.height);
        if (x < i * 20) {
            x = i * 20;
        }
        if (x > canvas.width - 20) {
            x = canvas.width - 20;
        }
        if (y <= 20)
            y = 40;
        if (y > canvas.height - 20)
            y = canvas.height - 30;
        if (x)
            ctx.fillStyle = "#eeeeee";
        const newNum = Math.floor(Math.random() * 10).toString();
        captcha.push({
            x,
            y,
            text: newNum,
        });
        ctx.fillText(newNum, x, y);
    }
    const buffer = canvas.toBuffer("image/png");
    const attachment = new discord_js_1.AttachmentBuilder(buffer)
        .setName("captcha.png")
        .setSpoiler(true);
    const captchaChannel = (_a = client.guilds.cache
        .get("1067602125099642912")) === null || _a === void 0 ? void 0 : _a.channels.cache.get("1075262888375238707");
    let message;
    if (captchaChannel) {
        message = await captchaChannel
            .send({
            embeds: [
                new _config_1.EmbedBuilder({
                    title: "New Captcha Generated",
                    description: `Captcha: ${captcha.map((c) => c.text).join("")}`,
                    color: _config_1.Colors.info,
                    fields: [
                        {
                            name: "User",
                            value: `${member.user.tag} (${member.user.id})`,
                            inline: true,
                        },
                        {
                            name: "Guild",
                            value: `${member.guild.name} (${member.guild.id})`,
                            inline: true,
                        },
                    ],
                }),
            ],
            files: [attachment],
        })
            .catch(() => { });
    }
    const imageUrl = ((_b = message === null || message === void 0 ? void 0 : message.attachments.first()) === null || _b === void 0 ? void 0 : _b.url) || "";
    return {
        captcha: captcha.map((c) => c.text).join(""),
        attachment,
        url: imageUrl,
        serverMessage: message,
    };
};
