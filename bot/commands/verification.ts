import { Colors, EmbedBuilder } from "../!config";
import {
  ApplicationCommandOptionType,
  TextBasedChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Command, CommandType } from "../Client";

export default {
  description: "Setup verification",
  type: CommandType.Slash,
  testOnly: true,
  permission: "Administrator",
  options: [
    {
      name: "channel",
      description: "Channel to send verification message",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "verify",
      description: "Type of verification. None = click button to verify",
      type: ApplicationCommandOptionType.String,
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
    if (!interaction) return;
    const channel = interaction.options.getChannel(
      "channel",
      true
    ) as TextBasedChannel;
    const verifyType = interaction.options.getString("verify", true);

    if (verifyType === "none") {
      const row = new ActionRowBuilder<ButtonBuilder>({
        components: [
          new ButtonBuilder({
            label: "Verify",
            style: ButtonStyle.Success,
            customId: "verify_none",
          }),
        ],
      });

      const embed = new EmbedBuilder({
        title: "Verification",
        description: "Click the button below to verify yourself.",
        color: Colors.info,
      });

      await channel
        .send({
          embeds: [embed],
          components: [row],
        })
        .catch((err) => {
          client.error(err);
        });
    } else {
      const row = new ActionRowBuilder<ButtonBuilder>({
        components:
          verifyType == "otp"
            ? [
                new ButtonBuilder({
                  label: "Verify",
                  style: ButtonStyle.Link,
                  url: `https://loophole.gg/verify/${interaction.guild!.id}/${
                    interaction.user!.id
                  }`,
                }),
              ]
            : [
                new ButtonBuilder({
                  label: "Verify",
                  style: ButtonStyle.Primary,
                  customId: `verify_${verifyType}`,
                }),
              ],
      });

      const embed = new EmbedBuilder({
        title: "Verification",
        description:
          "Click the button below to start the verification process.",
        color: Colors.info,
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
        new EmbedBuilder({
          title: "Verification",
          color: Colors.success,
          description:
            "Verification setup successful. You may further customize verification in the dashboard.",
        }),
      ],
      ephemeral: true,
    });
  },
} as Command;
