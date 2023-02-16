import { client } from "../";
import {
  ApplicationCommandOptionType,
  ChannelType,
  EmbedBuilder,
  TextBasedChannel,
} from "discord.js";
import { Command, CommandType } from "../Client";
import webhooksModel from "../models/webhooks.model";

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
  ],
  async execute({ interaction, client }) {
    if (!interaction) return;
    const subcommand = interaction.options.getSubcommand(true);

    if (subcommand === "create") {
      const name = interaction.options.getString("name", true);
      const channel = interaction.options.getChannel(
        "channel",
        true
      ) as TextBasedChannel;

      if (name.length > 16) return "Webhook name must be 16 characters or less";
      if (channel.type !== ChannelType.GuildText)
        return "Channel must be a text channel";

      const webhook = await channel.createWebhook({
        name,
        reason: `Webhook created by ${interaction.user.tag}`,
      });

      const webhookModel = new webhooksModel({
        guildId: interaction.guild?.id,
        channelId: channel.id,
        webhook: webhook.name,
        createdBy: interaction.user.id,
      });

      await webhookModel.save();

      return {
        embeds: [
          new EmbedBuilder({
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
} as Command;
