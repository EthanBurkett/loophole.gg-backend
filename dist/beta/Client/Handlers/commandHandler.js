"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class CommandHandler {
    constructor(client, instance) {
        this._client = client;
        this._instance = instance;
        this._commands = instance.commands;
        this._settings = instance.settings;
        this._client.on("messageCreate", async (message) => {
            await this._handleLegacy(message);
        });
        this._client.on("interactionCreate", async (interaction) => {
            if (!interaction.isCommand())
                return;
            await this._handleSlash(interaction);
        });
    }
    async _handleSlash(interaction) {
        if (!interaction.isCommand())
            return;
        const { commandName, guild, channelId } = interaction;
        const member = interaction.member;
        let command = this._commands.get(commandName);
        if (!command)
            return;
        if (command.type != "slash" && command.type != "both")
            return;
        if (command.permission) {
            if (!member.permissions.has(command.permission)) {
                return this._replyFromCallback("You don't have permission to use this command", interaction, this._client, command);
            }
        }
        let execute = command.execute({
            message: null,
            interaction,
            args: interaction.options.data.map((option) => option.value),
            instance: this._instance,
            client: this._client,
            member: member,
            guild: (await this._client.guilds.fetch(interaction.guildId)),
            channel: (await this._client.channels.fetch(interaction.channelId)),
            author: interaction.user,
        });
        if (execute instanceof Promise)
            execute = await execute;
        this._replyFromCallback(execute, interaction, this._client, command);
    }
    async _handleLegacy(message) {
        var _a, _b;
        if (message.author.bot)
            return;
        let prefix = this._settings.bot.prefix;
        if (message.channel.type == discord_js_1.ChannelType.DM)
            prefix = this._settings.bot.prefix;
        if (message.guild && this._client.cache.prefixes.get(message.guild.id))
            prefix = this._client.cache.prefixes.get(message.guild.id);
        if (!prefix)
            prefix = "!";
        if (message.author.id == this._settings.client.user.id)
            return;
        let args = message.content.trim().substring(prefix.length).split(/ +/g);
        let command = this._commands.get(args[0]);
        if (!command) {
            command = this._commands.find((cmd) => { var _a; return (_a = cmd.names) === null || _a === void 0 ? void 0 : _a.includes(args[0]); });
        }
        if (!command)
            return;
        if (command.permission) {
            if (!((_a = message.member) === null || _a === void 0 ? void 0 : _a.permissions.has(command.permission))) {
                const reply = this._replyFromCallback("You don't have permission to use this command", message, this._client, command);
                return reply;
            }
        }
        if (command.type == "slash")
            return;
        if (command.testOnly &&
            !((_b = this._settings.bot.testServers) === null || _b === void 0 ? void 0 : _b.includes(message.guild.id)))
            return;
        args = args.slice(1);
        let execute = command.execute({
            args,
            client: this._client,
            interaction: null,
            instance: this._instance,
            message,
            member: message.member,
            guild: message.guild,
            channel: message.channel,
            author: message.member.user,
        });
        if (execute instanceof Promise)
            execute = await execute;
        this._replyFromCallback(execute, message, this._client, command);
    }
    _replyFromCallback(reply, msgOrInter, client, command) {
        if (!reply)
            return;
        else if (reply instanceof discord_js_1.EmbedBuilder) {
            return msgOrInter
                .reply({
                embeds: [reply],
            })
                .catch((e) => {
                if (msgOrInter.editReply) {
                    msgOrInter.editReply(reply).catch((e) => {
                        console.log(e);
                        client.error(`Failed to reply. Command: ${command.names[0]}`);
                    });
                }
                else {
                    console.log(e);
                    client.error(`Failed to reply. Command: ${command.names[0]}`);
                }
            });
        }
        else if (typeof reply == "string") {
            return msgOrInter.reply(reply).catch((e) => {
                if (msgOrInter.editReply) {
                    msgOrInter.editReply(reply).catch((e) => {
                        console.log(e);
                        client.error(`Failed to reply. Command: ${command.names[0]}`);
                    });
                }
                else {
                    console.log(e);
                    client.error(`Failed to reply. Command: ${command.names[0]}`);
                }
            });
        }
        else {
            return msgOrInter.reply(reply).catch((e) => {
                if (msgOrInter.editReply) {
                    msgOrInter.editReply(reply).catch((e) => {
                        console.log(e);
                        client.error(`Failed to reply. Command: ${command.names[0]}`);
                    });
                }
                else {
                    console.log(e);
                    client.error(`Failed to reply. Command: ${command.names[0]}`);
                }
            });
        }
    }
}
exports.default = CommandHandler;
