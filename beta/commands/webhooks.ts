import { client } from "../";
import {
  ApplicationCommandOptionType,
  ChannelType,
  EmbedBuilder,
  TextBasedChannel,
} from "discord.js";
import { Command, CommandType } from "../Client";
import webhooksModel from "../models/webhooks.model";
import { Colors } from "../!config";

export default {
  description: "Configure webhooks for this server",
  type: CommandType.Slash,
  testOnly: true,
  permission: "Administrator",
  options: [
    {
      name: "create",
      description: "Create a webhook",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Name of the webhook (max 16 characters)",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "channel",
          description: "Channel to send webhook messages",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
    },
    {
      name: "addcommand",
      description: "Add a command to log to a webhook",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "command",
          description: "Command to log",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "channel",
          description: "Channel to send webhook messages",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
        {
          name: "webhook",
          description: "Webhook to log to",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "info",
      description: "Get info about a webhook",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "webhook",
          description: "Webhook to get info about",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "channel",
          description: "Channel to get webhook info from",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
    {
      name: "delete",
      description: "Delete a webhook",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "webhook",
          description: "Webhook to delete",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "channel",
          description: "Channel to delete webhook from",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
  ],
  async execute({ interaction, client }) {
    if (!interaction) return;
    const subcommand = interaction.options.getSubcommand(true);

    if (subcommand === "create") {
      console.log("test");
      const name = interaction.options.getString("name", true);
      const channel = interaction.options.getChannel(
        "channel",
        true
      ) as TextBasedChannel;

      if (name.length > 16) return "Webhook name must be 16 characters or less";
      if (channel.type !== ChannelType.GuildText)
        return "Channel must be a text channel";

      const webhooks = await channel.fetchWebhooks();
      const exists = await webhooksModel.findOne({
        guildId: interaction.guild?.id,
        channelId: channel.id,
        webhook: name,
      });
      const webhookExists = webhooks.find(
        (w) => w.name.toLowerCase() == name.toLowerCase()
      );
      if (webhookExists || exists) {
        return "A webhook with that name already exists in this channel";
      }

      const webhook = await channel.createWebhook({
        name,
        reason: `Webhook created by ${interaction.user.tag}`,
      });

      const webhookModel = new webhooksModel({
        guildId: interaction.guild?.id,
        channelId: channel.id,
        webhook: webhook.name,
        createdBy: interaction.user.id,
        webhookId: webhook.id,
      });

      await webhookModel.save();

      return {
        embeds: [
          new EmbedBuilder({
            title: "Webhook Created",
            color: Colors.success,
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
    } else if (subcommand === "info") {
      const channel = interaction.options.getChannel(
        "channel",
        false
      ) as TextBasedChannel;
      const webhook = interaction.options.getString("webhook", true);

      let webhookModel = channel
        ? await webhooksModel.find({
            guildId: interaction.guild?.id,
            webhook,
            channelId: channel.id,
          })
        : await webhooksModel.find({
            guildId: interaction.guild?.id,
            webhook,
          });

      if (webhookModel.length < 1)
        return {
          embeds: [
            new EmbedBuilder({
              title: "No Webhooks Found",
              color: Colors.error,
            }),
          ],
        };

      interaction
        .reply({
          embeds: [
            new EmbedBuilder({
              title: "Webhook Info",
              color: Colors.info,
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
        .catch(() => {});
      if (webhookModel.length > 1) {
        for (const webhook of webhookModel) {
          if (webhook.webhookId !== webhookModel[0].webhookId) {
            setTimeout(() => {
              interaction.channel?.send({
                embeds: [
                  new EmbedBuilder({
                    title: `Webhook Info`,
                    description: `Showing other webhooks with the same name (${webhookModel.length})`,
                    color: Colors.info,
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
    } else if (subcommand === "delete") {
      const channel = interaction.options.getChannel(
        "channel",
        false
      ) as TextBasedChannel;
      const webhook = interaction.options.getString("webhook", true);

      let webhookModel = channel
        ? await webhooksModel.find({
            guildId: interaction.guild?.id,
            webhook,
            channelId: channel.id,
          })
        : await webhooksModel.find({
            guildId: interaction.guild?.id,
            webhook,
          });

      if (!webhookModel) return "Webhook not found";

      const channelWebhooks = await interaction.guild?.channels.cache.map(
        async (c) => {
          if (c.type === ChannelType.GuildText) {
            return await c.fetchWebhooks();
          }
        }
      );

      channelWebhooks?.map(async (w) => {
        const webhook = (await w)?.find(
          (w) => w.name.toLowerCase() == webhookModel[0].webhook.toLowerCase()
        );
        if (webhook) {
          await webhook.delete();
        }
      });

      channel
        ? await webhooksModel.deleteMany({
            guildId: interaction.guild?.id,
            channelId: channel.id,
            webhook,
          })
        : await webhooksModel.deleteMany({
            guildId: interaction.guild?.id,
            webhook,
          });

      interaction.reply({
        embeds: [
          new EmbedBuilder({
            title: "Webhook Deleted",
            color: Colors.success,
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
              interaction.channel?.send({
                embeds: [
                  new EmbedBuilder({
                    title: `Webhook Deleted`,
                    description: `Deleted webhooks in other channels with the same name (${webhookModel.length})`,
                    color: Colors.success,
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
} as Command;
