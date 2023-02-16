import { Colors } from "../!config";
import {
  ApplicationCommandOptionType,
  ComponentType,
  EmbedBuilder,
  TextBasedChannel,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  ModalActionRowComponentBuilder,
  TextInputStyle,
  ModalSubmitInteraction,
  CacheType,
  resolveColor,
} from "discord.js";
import { Command, CommandType } from "../Client";

export default {
  description: "Embed builder",
  type: CommandType.Slash,
  testOnly: true,
  permission: "ManageMessages",
  options: [
    {
      name: "builder",
      description: "Interactive embed editor",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "Channel to send embed",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
    },
    {
      name: "json",
      description: "Create an embed from JSON",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "Channel to send embed",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
        {
          name: "json",
          description: "JSON to create embed from",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],
  execute: async ({ interaction, client }) => {
    if (!interaction) return;
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "json") {
      const channel = interaction.options.getChannel(
        "channel",
        true
      ) as TextBasedChannel;
      if (!channel) return;
      const json = interaction.options.getString("json", true);
      if (!json) return;
      const embed = new EmbedBuilder(JSON.parse(json));
      await channel.send({ embeds: [embed] });
      await interaction
        .reply({
          embeds: [
            new EmbedBuilder({
              title: "Embed Sent",
              color: Colors.success,
            }),
          ],
        })
        .catch(() => {});
    }
    if (subcommand === "builder") {
      const channel = interaction.options.getChannel(
        "channel",
        true
      ) as TextBasedChannel;
      if (!channel) return;
      const embed = new EmbedBuilder({
        title: "Embed builder",
        description:
          "This is an interactive embed builder. You can use the buttons below to edit the embed.",
        color: Colors.info,
        thumbnail: {
          url: client.user!.displayAvatarURL(),
        },
      });

      // Buttons
      const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("title")
          .setLabel("Edit Title")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("description")
          .setLabel("Edit Content")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("color")
          .setLabel("Edit Color")
          .setStyle(ButtonStyle.Secondary)
      );

      const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("images")
          .setLabel("Edit Images")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("author")
          .setLabel("Edit Author")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("footer")
          .setLabel("Edit Footer")
          .setStyle(ButtonStyle.Secondary)
      );

      const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("cancel")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("finish")
          .setLabel("Finish")
          .setStyle(ButtonStyle.Success)
      );
      await interaction.deferReply();
      const message = await interaction
        .channel!.send({
          embeds: [embed],
          components: [row1, row2, row3],
        })
        .catch((e) => console.log(e));

      const filter = (i: any) => i.user.id === interaction.user.id;
      const collector = message!.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 1000 * 60 * 3,
      });

      await interaction.deleteReply();
      collector.on("collect", async (i) => {
        if (i.customId === "cancel") {
          await message!.delete();
          collector.stop();
        }
        if (i.customId === "finish") {
          channel.send({
            embeds: [embed],
          });

          collector.stop();
          i.reply({
            embeds: [
              new EmbedBuilder({
                title: "Embed Sent",
                color: Colors.success,
              }),
            ],
          });
        }
        if (["title", "description"].includes(i.customId)) {
          const Modal = new ModalBuilder()
            .setCustomId("modal")
            .setTitle("Edit Embed");

          const row =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId(i.customId)
                .setLabel(`${i.customId}`)
                .setValue((embed.data as any)[i.customId])
                .setStyle(
                  i.customId == "title"
                    ? TextInputStyle.Short
                    : TextInputStyle.Paragraph
                )
            );

          Modal.addComponents(row);

          await i.showModal(Modal);
          i.awaitModalSubmit({
            time: 60000,
            filter: (i: ModalSubmitInteraction<CacheType>) =>
              i.user.id === interaction.user.id,
          }).then(async (i: ModalSubmitInteraction<CacheType>) => {
            const fields = i.fields.fields.map((f) => f);

            fields.map((f) => {
              (embed.data as any)[f.customId] = f.value;
            });
            await message!.edit({
              embeds: [embed],
              components: [row1, row2, row3],
            });

            i.reply({
              embeds: [
                new EmbedBuilder({
                  title: "Embed Updated",
                  color: Colors.success,
                }),
              ],
              ephemeral: true,
            });
          });
        }
        if (["color"].includes(i.customId)) {
          const Modal = new ModalBuilder()
            .setCustomId("modal")
            .setTitle("Edit Embed");

          const row =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId(i.customId)
                .setLabel(`${i.customId}`)
                .setValue((embed.data as any)[i.customId].toString())
                .setStyle(TextInputStyle.Short)
            );

          Modal.addComponents(row);

          await i.showModal(Modal);
          i.awaitModalSubmit({
            time: 60000,
            filter: (i: ModalSubmitInteraction<CacheType>) =>
              i.user.id === interaction.user.id,
          }).then(async (i: ModalSubmitInteraction<CacheType>) => {
            const fields = i.fields.fields.map((f) => f);

            fields.map((f) => {
              try {
                (embed.data as any)[f.customId] = resolveColor(f.value as any);
              } catch (e) {
                i.reply({
                  embeds: [
                    new EmbedBuilder({
                      title: "Invalid Color",
                      color: Colors.error,
                    }),
                  ],
                  ephemeral: true,
                }).catch(() => {});
              }
            });
            await message!.edit({
              embeds: [embed],
              components: [row1, row2, row3],
            });

            i.reply({
              embeds: [
                new EmbedBuilder({
                  title: "Embed Updated",
                  color: Colors.success,
                }),
              ],
              ephemeral: true,
            }).catch(() => {});
          });
        }

        if (["images", "footer", "author"].includes(i.customId)) {
          const Modal = new ModalBuilder()
            .setCustomId("modal")
            .setTitle("Edit Embed");
          let modalRow1, modalRow2;

          if (i.customId === "footer") {
            modalRow1 =
              new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                new TextInputBuilder()
                  .setCustomId("footer_text")
                  .setLabel(`Footer Text`)
                  .setValue(embed.data.footer?.text || "")
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false)
              );
            modalRow2 =
              new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                new TextInputBuilder()
                  .setCustomId("footer_icon:url")
                  .setLabel(`Footer Icon`)
                  .setStyle(TextInputStyle.Short)
                  .setValue(embed.data.footer?.icon_url || "")
                  .setRequired(false)
              );
          }

          if (i.customId === "author") {
            modalRow1 =
              new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                new TextInputBuilder()

                  .setCustomId("author_name")
                  .setLabel(`Author Name`)
                  .setStyle(TextInputStyle.Short)
                  .setValue(embed.data.author?.name || "")
                  .setRequired(false)
              );
            modalRow2 =
              new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                new TextInputBuilder()
                  .setCustomId("author_icon:url")
                  .setLabel(`Author Icon`)
                  .setValue(embed.data.author?.icon_url || "")
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false)
              );
          }

          if (i.customId === "images") {
            modalRow1 =
              new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                new TextInputBuilder()
                  .setCustomId("thumbnail_url")
                  .setLabel(`Thumbnail URL`)
                  .setValue(embed.data.thumbnail?.url || "")
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false)
              );
            modalRow2 =
              new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                new TextInputBuilder()
                  .setCustomId("image_url")
                  .setLabel(`Image URL`)
                  .setValue(embed.data.image?.url || "")
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false)
              );
          }

          Modal.addComponents(modalRow1 as any, modalRow2 as any);
          await i.showModal(Modal);
          i.awaitModalSubmit({
            time: 60000,
            filter: (i: ModalSubmitInteraction<CacheType>) =>
              i.user.id === interaction.user.id,
          }).then(async (i: ModalSubmitInteraction<CacheType>) => {
            const fields = i.fields.fields.map((f) => f);

            fields.map((f) => {
              // if (f.value == "") return;
              const data = f.customId
                ?.split("_")[0]
                ?.toLowerCase()
                ?.replace(/:/g, "_");
              const value = f.customId
                ?.split("_")[1]
                ?.toLowerCase()
                ?.replace(/:/g, "_");
              (embed.data as any)[data] = {
                [value]: f.value,
              };
            });
            await message!.edit({
              embeds: [embed],
              components: [row1, row2, row3],
            });

            i.reply({
              embeds: [
                new EmbedBuilder({
                  title: "Embed Updated",
                  color: Colors.success,
                }),
              ],
              ephemeral: true,
            }).catch(() => {});
          });
        }
      });

      collector.on("end", async (_, reason) => {
        if (reason === "time") {
          await message!.edit({
            embeds: [embed],
            components: [row1, row2, row3],
          });
        }
        await message!.delete().catch(() => {});
      });
    }
    return;
  },
} as Command;
