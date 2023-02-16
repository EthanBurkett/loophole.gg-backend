import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Colors } from "../!config";
import { Command, CommandType } from "../Client";
import autoroleModel from "../models/autorole.model";

export default {
  description: "Configure autoroles for the server",
  type: CommandType.Slash,
  testOnly: true,
  permission: "Administrator",
  options: [
    {
      name: "add",
      description: "Add an autorole",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "Role to add",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Remove an autorole",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "role",
          description: "Role to remove",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
      ],
    },
    {
      name: "list",
      description: "List all autoroles",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  async execute({ interaction, client }) {
    if (!interaction) return;
    const subcommand = interaction.options.getSubcommand(true);

    if (subcommand === "add") {
      const role = interaction.options.getRole("role", true);
      const guildId = interaction.guildId!;

      const exists = await autoroleModel.findOne({
        guildId,
        roleId: role.id,
      });

      if (exists) {
        return await interaction
          .reply({
            embeds: [
              new EmbedBuilder({
                title: "Autorole already exists",
                color: Colors.error,
              }),
            ],
          })
          .catch(() => {});
      }

      const autorole = new autoroleModel({
        guildId,
        roleId: role.id,
      });

      await autorole.save();

      client.cache.autoroles.push(autorole);

      await interaction
        .reply({
          embeds: [
            new EmbedBuilder({
              title: "Added role to autoroles",
              color: Colors.success,
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
        .catch(() => {});
    } else if (subcommand === "remove") {
      const role = interaction.options.getRole("role", true);
      const guildId = interaction.guildId!;

      const exists = await autoroleModel.findOne({
        guildId,
        roleId: role.id,
      });

      if (!exists) {
        return await interaction
          .reply({
            embeds: [
              new EmbedBuilder({
                title: "Autorole doesn't exist",
                color: Colors.error,
              }),
            ],
          })
          .catch(() => {});
      }

      await autoroleModel.deleteOne({
        guildId,
        roleId: role.id,
      });

      client.cache.autoroles = client.cache.autoroles.filter(
        (autorole) => autorole.roleId !== role.id
      );

      await interaction
        .reply({
          embeds: [
            new EmbedBuilder({
              title: "Removed role from autoroles",
              color: Colors.success,
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
        .catch(() => {});
    } else if (subcommand === "list") {
      const guildId = interaction.guildId!;
      const autoroles = client.cache.autoroles.filter(
        (autorole) => autorole.guildId === guildId
      );

      if (!autoroles.length) {
        return await interaction
          .reply({
            embeds: [
              new EmbedBuilder({
                title: `No autoroles found for ${interaction.guild?.name}`,
                color: Colors.error,
              }),
            ],
          })
          .catch(() => {});
      }

      await interaction
        .reply({
          embeds: [
            new EmbedBuilder({
              title: "Autoroles",
              color: Colors.success,
              fields: [
                {
                  name: "List of autoroles",
                  value: `${autoroles
                    .map(
                      (autorole, i) =>
                        `<@&${autorole.roleId}>${i % 2 === 1 ? `\n` : ` `}`
                    )
                    .join(" ")}`,
                },
              ],
            }),
          ],
        })
        .catch(() => {});
    }
  },
} as Command;
