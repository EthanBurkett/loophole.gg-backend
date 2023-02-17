import { Colors, EmbedBuilder } from "../!config";
import {
  Client,
  AttachmentBuilder,
  TextBasedChannel,
  GuildMember,
  Message,
  ChannelType,
  GuildInvitableChannelResolvable,
  Invite,
} from "discord.js";
import fs from "fs";
import { createCanvas, loadImage } from "canvas";
import { Production } from "../../!global";
import path from "path";
import { Sendgrid } from "../utils/Sendgrid";
import userModel from "../../server/models/user.model";

export default async (client: Client<boolean>) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton() || !interaction.guild) return;
    if (interaction.customId === "verify_none") {
      const user = interaction.user.id;
      const member = interaction.guild?.members.cache.get(user);
      if (!member) return;
      const role = interaction.guild?.roles.cache.find(
        (r) => r.name.toLowerCase() === "verified"
      );
      if (!role) return;
      await member.roles.add(role).catch((e) => client.error(e));
      await interaction.reply({
        embeds: [
          new EmbedBuilder({
            title: "Successfully verified",
            color: Colors.success,
          }),
        ],
        ephemeral: true,
      });
    } else if (interaction.customId === "verify_captcha") {
      const user = interaction.user.id;
      const member = interaction.guild?.members.cache.get(user);
      if (!member) return;

      const { captcha, url, serverMessage } = await generateCaptcha(
        client,
        member
      );
      const role = interaction.guild?.roles.cache.find(
        (r) => r.name.toLowerCase() === "verified"
      );
      if (!role) return;

      member
        .send({
          embeds: [
            new EmbedBuilder({
              title: "Verification",
              description: `Please respond with the exact text you see below to be verified in ${interaction.guild.name}. You have 30 seconds to respond.`,
              color: Colors.info,
              image: {
                url,
              },
            }),
          ],
        })
        .catch(() => {})
        .then((m) => {
          if (!m) return;
          interaction.reply({
            embeds: [
              new EmbedBuilder({
                title: "Verification",
                description: `Please check your DMs for the captcha.`,
                color: Colors.info,
              }),
            ],
            ephemeral: true,
          });
          const collector = m.channel.createMessageCollector({
            time: 30 * 1000,
            max: 1,
            filter: (msg) => msg.author.id === member.user!.id,
          });

          collector.on("collect", async (msg) => {
            await serverMessage!.delete().catch(() => {});
            if (msg.content.toLowerCase() === captcha.toLowerCase()) {
              await member.roles.add(role).catch((e) => client.error(e));
              await msg
                .reply({
                  embeds: [
                    new EmbedBuilder({
                      title: "Successfully verified",
                      color: Colors.success,
                    }),
                  ],
                })
                .catch(() => {});
            } else {
              await msg
                .reply({
                  embeds: [
                    new EmbedBuilder({
                      title: "Verification failed",
                      color: Colors.error,
                    }),
                  ],
                })
                .catch(() => {});
            }
          });
        });
    } else if (interaction.customId === "verify_otp") {
      // generate a random string 6 characters long
      const verificationCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      // create an invite
      const invite: Invite | void = await interaction.guild?.invites
        .create(interaction.channel as GuildInvitableChannelResolvable, {
          maxAge: 0,
          maxUses: 1,
          unique: true,
          reason: "Verification",
        })
        .catch(() => {});
      if (!invite) {
        interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder({
              title: "Error",
              description: "Unable to create an invite.",
              color: Colors.error,
            }),
          ],
        });
        return;
      }

      const sendgrid = new Sendgrid();

      const user = await userModel.findOne({
        discordId: interaction.user.id,
      });

      if (!user) {
        interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder({
              title: "Click here to login",
              description:
                "Please login to the dashboard to continue verification.",
              color: Colors.error,
              url: `https://api.loophole.gg/auth/discord`,
            }),
          ],
        });
      }

      const member = interaction.guild?.members.cache.get(interaction.user.id)!;

      sendgrid
        .sendOTP(user?.email!, {
          code: verificationCode,
          discordinvite: invite.url,
          guildname: interaction.guild.name,
        })
        .then(() => {
          member
            .send({
              embeds: [
                new EmbedBuilder({
                  title: "E-Mail OTP Verification",
                  description: `You have been sent an email at \`${
                    user!.email
                  }\`. Please respond within 2 minutes with the code you see in the email.`,
                  color: Colors.info,
                }),
              ],
            })
            .catch(() => {
              interaction.reply({
                ephemeral: true,
                embeds: [
                  new EmbedBuilder({
                    title: "Error",
                    description: "Unable to send you a DM.",
                    color: Colors.error,
                  }),
                ],
              });
            })
            .then((m) => {
              if (!m) return;
              interaction
                .reply({
                  embeds: [
                    new EmbedBuilder({
                      title: "Verification",
                      description: `Please check your DMs to continue verification.`,
                      color: Colors.info,
                    }),
                  ],
                  ephemeral: true,
                })
                .catch(() => {});

              const collector = m.channel.createMessageCollector({
                time: 120 * 1000,
                max: 1,
                filter: (msg) => msg.author.id === member.user!.id,
              });

              collector.on("collect", async (msg) => {
                if (
                  msg.content.toLowerCase() === verificationCode.toLowerCase()
                ) {
                  const role = interaction.guild?.roles.cache.find(
                    (r) => r.name.toLowerCase() === "verified"
                  );
                  if (!role) return;
                  await member.roles.add(role).catch((e) => client.error(e));
                  await msg
                    .reply({
                      embeds: [
                        new EmbedBuilder({
                          title: "Successfully verified",
                          color: Colors.success,
                        }),
                      ],
                    })
                    .catch(() => {});
                } else {
                  await msg
                    .reply({
                      embeds: [
                        new EmbedBuilder({
                          title: "Verification failed",
                          color: Colors.error,
                        }),
                      ],
                    })
                    .catch(() => {});
                }
              });

              collector.on("end", (collected, reason) => {
                if (reason === "time") {
                  m.reply({
                    embeds: [
                      new EmbedBuilder({
                        title: "Verification failed",
                        description: "You took too long to respond.",
                        color: Colors.error,
                      }),
                    ],
                  }).catch(() => {});
                }
              });
            });
        });
    }
  });
};

const generateCaptcha = async (
  client: Client<boolean>,
  member: GuildMember
) => {
  const canvas = createCanvas(200, 100);
  const ctx = canvas.getContext("2d");

  ctx.font = "30px Sans Serif";
  ctx.fillStyle = "rgb(40,40,40)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // randomly place numbers on image not going past the previous number

  let captcha: {
    x: number;
    y: number;
    text: string;
  }[] = [];
  for (let i = 0; i < 6; i++) {
    const prev = captcha[captcha.length - 1];
    let x, y;
    if (prev) {
      x = prev.x + 30;
    } else x = 25;
    y = Math.floor(Math.random() * canvas.height);
    // check if x is too close to the previous number
    if (x < i * 20) {
      x = i * 20;
    }
    // check if numbers overlap
    if (x > canvas.width - 20) {
      x = canvas.width - 20;
    }

    if (y <= 20) y = 40;
    if (y > canvas.height - 20) y = canvas.height - 30;

    if (x) ctx.fillStyle = "#eeeeee";
    const newNum = Math.floor(Math.random() * 10).toString();
    captcha.push({
      x,
      y,
      text: newNum,
    });

    ctx.fillText(newNum, x, y);
  }

  const buffer = canvas.toBuffer("image/png");
  const attachment = new AttachmentBuilder(buffer)
    .setName("captcha.png")
    .setSpoiler(true);

  const captchaChannel = client.guilds.cache
    .get("1067602125099642912")
    ?.channels.cache.get("1075262888375238707") as TextBasedChannel;
  let message: Message<boolean> | void;
  if (captchaChannel) {
    message = await captchaChannel
      .send({
        embeds: [
          new EmbedBuilder({
            title: "New Captcha Generated",
            description: `Captcha: ${captcha.map((c) => c.text).join("")}`,
            color: Colors.info,
            fields: [
              {
                name: "User",
                value: `${member.user!.tag} (${member.user!.id})`,
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
      .catch(() => {});
  }

  const imageUrl = message?.attachments.first()?.url || "";

  return {
    captcha: captcha.map((c) => c.text).join(""),
    attachment,
    url: imageUrl,
    serverMessage: message,
  };
};
