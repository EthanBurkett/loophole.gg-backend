import {
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  Collection,
  EmbedBuilder,
  Guild,
  GuildMember,
  Interaction,
  Message,
  MessageCreateOptions,
  MessagePayload,
  TextBasedChannel,
} from "discord.js";
import CustomClient, { Command, Settings } from "..";

export default class CommandHandler {
  private _client: Client<boolean>;
  private _instance: CustomClient;
  private _commands: Collection<string, Command>;
  private _settings: Settings;

  constructor(client: Client<boolean>, instance: CustomClient) {
    this._client = client;
    this._instance = instance;
    this._commands = instance.commands;
    this._settings = instance.settings;

    this._client.on("messageCreate", async (message) => {
      await this._handleLegacy(message);
    });
    this._client.on(
      "interactionCreate",
      async (interaction: Interaction<CacheType>) => {
        if (!interaction.isCommand()) return;
        await this._handleSlash(
          interaction as ChatInputCommandInteraction<CacheType>
        );
      }
    );
  }

  private async _handleSlash(
    interaction: ChatInputCommandInteraction<CacheType>
  ) {
    if (!interaction.isCommand()) return;
    const { commandName, guild, channelId } = interaction;

    const member = interaction.member as GuildMember;
    let command: Command | undefined = this._commands.get(commandName);
    if (!command) return;

    if (command.type != "slash" && command.type != "both") return;

    if (command.permission) {
      if (!member.permissions.has(command.permission)) {
        return this._replyFromCallback(
          "You don't have permission to use this command",
          interaction,
          this._client,
          command
        );
      }
    }

    let execute = command.execute({
      message: null,
      interaction,
      args: interaction.options.data.map((option) => option.value),
      instance: this._instance,
      client: this._client,
      member: member!,
      guild: (await this._client.guilds.fetch(interaction.guildId!)) as Guild,
      channel: (await this._client.channels.fetch(
        interaction.channelId
      )) as TextBasedChannel,
      author: interaction.user,
    });

    if (execute instanceof Promise) execute = await execute;

    this._replyFromCallback(execute, interaction, this._client, command);
  }

  private async _handleLegacy(message: Message<boolean>) {
    if (message.author.bot) return;
    let prefix = this._settings.bot.prefix;
    if (message.channel.type == ChannelType.DM)
      prefix = this._settings.bot.prefix;
    if (message.guild && this._client.cache.prefixes.get(message.guild!.id))
      prefix = this._client.cache.prefixes.get(message.guild!.id)!;
    if (!prefix) prefix = "!";

    if (message.author.id == this._settings.client.user!.id) return;

    let args = message.content.trim().substring(prefix.length).split(/ +/g);

    let command = this._commands.get(args[0]);
    if (!command) {
      command = this._commands.find((cmd) => cmd.names?.includes(args[0]));
    }
    if (!command) return;

    if (command.permission) {
      if (!message.member?.permissions.has(command.permission)) {
        const reply = this._replyFromCallback(
          "You don't have permission to use this command",
          message,
          this._client,
          command
        );
        return reply;
      }
    }

    if (command.type == "slash") return;

    if (
      command.testOnly &&
      !this._settings.bot.testServers?.includes(message.guild!.id)
    )
      return;

    args = args.slice(1);

    let execute = command.execute({
      args,
      client: this._client,
      interaction: null,
      instance: this._instance,
      message,
      member: message.member!,
      guild: message.guild!,
      channel: message.channel! as any,
      author: message.member!.user,
    });

    if (execute instanceof Promise) execute = await execute;

    this._replyFromCallback(execute, message, this._client, command);
  }

  private _replyFromCallback(
    reply: string | void | MessageCreateOptions | EmbedBuilder | MessagePayload,
    msgOrInter: any,
    client: Client<boolean>,
    command: Command
  ) {
    if (!reply) return;
    else if (reply instanceof EmbedBuilder) {
      return msgOrInter
        .reply({
          embeds: [reply],
        })
        .catch((e: any) => {
          if (msgOrInter.editReply) {
            msgOrInter.editReply(reply).catch((e: any) => {
              console.log(e);
              client.error(`Failed to reply. Command: ${command.names![0]}`);
            });
          } else {
            console.log(e);
            client.error(`Failed to reply. Command: ${command.names![0]}`);
          }
        });
    } else if (typeof reply == "string") {
      return msgOrInter.reply(reply).catch((e: any) => {
        if (msgOrInter.editReply) {
          msgOrInter.editReply(reply).catch((e: any) => {
            console.log(e);
            client.error(`Failed to reply. Command: ${command.names![0]}`);
          });
        } else {
          console.log(e);
          client.error(`Failed to reply. Command: ${command.names![0]}`);
        }
      });
    } else {
      return msgOrInter.reply(reply).catch((e: any) => {
        if (msgOrInter.editReply) {
          msgOrInter.editReply(reply).catch((e: any) => {
            console.log(e);
            client.error(`Failed to reply. Command: ${command.names![0]}`);
          });
        } else {
          console.log(e);
          client.error(`Failed to reply. Command: ${command.names![0]}`);
        }
      });
    }
  }
}
