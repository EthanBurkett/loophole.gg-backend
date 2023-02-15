import {
  ApplicationCommand,
  ApplicationCommandOptionData,
  Client,
  Collection,
} from "discord.js";
import fs from "fs";
import mongoose from "mongoose";
import p from "path";
import { Command, Settings } from "..";

export default class CommandLoader {
  private _settings: Settings;
  private _commands: Collection<string, Command>;
  private _client: Client<boolean>;
  constructor(client: Client<boolean>, settings: Settings) {
    this._settings = settings;
    this._client = client;
    this._commands = new Collection();
    this._load();

    this.checkUnusedSlash();
  }

  private _load() {
    const files = getAllFiles(this._settings.bot.commandsDir);

    for (const file of files) {
      const command = file.fileContents as Command;

      if (!command.names) {
        this._client.error(`Command "${file.name[0]}" does not have a name!`);
        process.exit(0);
      }

      if (command.testOnly && !this._settings.bot.testServers) {
        this._client.error(
          `Command "${file.name[0]}" is set to test only, but no test servers are provided!`
        );
        process.exit(0);
      }

      if (command.type == "slash" || command.type == "both") {
        if (this._settings.bot.testServers && command.testOnly) {
          this._settings.bot.testServers.map((server: string) => {
            this.create(
              command.names![0],
              command.description,
              command.options ? command.options : [],
              server
            );
          });
        } else {
          this.create(
            command.names![0],
            command.description,
            command.options!,
            undefined
          );
        }
      }

      this._commands.set(file.name[0], file.fileContents);
    }
  }

  private checkUnusedSlash() {
    this._client.log("Checking for unused slash commands...");
    const cmds = (async () =>
      await this._client.application?.commands.fetch().then((cmds) => {
        cmds.map((slash) => {
          const cmd = this._commands.find((cmd) =>
            cmd.names?.includes(slash.name)
          );
          if (!cmd) return;
          if (cmd.type == "legacy") {
            slash.delete();
            this._client.log(
              `Removing client slash command "${
                cmd.names![0]
              }" due to property "type" not including slash functionality.`
            );
          }
        });
      }))();

    this._client.guilds.cache.map(async (guild) => {
      await guild.commands.fetch();
      guild.commands.cache.map((slash) => {
        const cmd = this._commands.find((cmd) =>
          cmd.names?.includes(slash.name)
        );
        if (!cmd) return;
        if (cmd.type != "both" && cmd.type != "slash") {
          slash.delete();
          this._client.log(
            `Removing guild slash command "${
              cmd.names![0]
            }" due to property "type" not including slash functionality.`
          );
        }
      });
    });
  }

  public get commands() {
    return this._commands;
  }

  private didOptionsChange(
    command: ApplicationCommand,
    options: ApplicationCommandOptionData[] | any
  ): boolean {
    return (
      command.options?.filter((opt: any, index: any) => {
        return (
          opt?.required !== options[index]?.required &&
          opt?.name !== options[index]?.name &&
          opt?.options?.length !== options.length
        );
      }).length !== 0
    );
  }

  public getCommands(guildId?: string) {
    if (guildId) {
      return this._client.guilds.cache.get(guildId)?.commands;
    }

    return this._client.application?.commands;
  }

  public async create(
    name: string,
    description: string,
    options: ApplicationCommandOptionData[],
    guildId?: string
  ): Promise<ApplicationCommand<{}> | undefined> {
    let commands;

    if (guildId) {
      commands = this._client.guilds.cache.get(guildId)?.commands;
    } else {
      commands = this._client.application?.commands;
    }

    if (!commands) {
      return;
    }

    // @ts-ignore
    await commands.fetch();

    const cmd = commands.cache.find(
      (cmd) => cmd.name === name
    ) as ApplicationCommand;

    if (cmd) {
      const optionsChanged = this.didOptionsChange(cmd, options);

      if (
        (cmd.options &&
          cmd.description &&
          options &&
          cmd.options.length != options.length!) ||
        cmd.description !== description ||
        optionsChanged
      ) {
        this._client.log(
          `Updating${guildId ? " guild" : ""} slash command "${name}"`
        );

        return commands?.edit(cmd.id, {
          name,
          description,
          options,
        });
      }

      return Promise.resolve(cmd);
    }

    if (commands) {
      this._client.log(
        `Creating${guildId ? " guild" : ""} slash command "${name}"`
      );

      const newCommand = await commands.create({
        name,
        description,
        options,
      });

      return newCommand;
    }

    return Promise.resolve(undefined);
  }

  public async delete(
    commandId: string,
    guildId?: string
  ): Promise<ApplicationCommand<{}> | undefined> {
    const commands = this.getCommands(guildId);
    if (commands) {
      const cmd = commands.cache.get(commandId);
      if (cmd) {
        this._client.log(
          `Deleted${guildId ? " guild" : ""} slash command "${cmd.name}".`
        );

        cmd.delete();
      }
    }

    return Promise.resolve(undefined);
  }
}

const getAllFiles = (path: string, foldersOnly = false) => {
  const files = fs.readdirSync(path, {
    withFileTypes: true,
  });
  let filesFound: any[] = [];

  for (const file of files) {
    const filePath = p.join(path, file.name);

    if (file.isDirectory()) {
      if (foldersOnly) {
        filesFound.push({
          filePath,
          fileContents: file,
        });
      } else {
        filesFound = [...filesFound, ...getAllFiles(filePath)];
      }
      continue;
    }

    const L = filePath.replace(/\\/g, "/").replace(/\\\\/g, "/").split("/");
    let name = [L[L.length - 1].substring(0, L[L.length - 1].length - 3)];

    let fileContents = require(p.join(process.cwd(), filePath));
    if (fileContents.default) fileContents = fileContents.default;
    if (fileContents.names) {
      if (typeof fileContents.names === "string")
        fileContents.names = [fileContents.names];
      name = fileContents.names;
    } else if (fileContents.command) {
      fileContents.command({
        defaultCommands: {
          [name[0]]: {
            names: name,
          },
        },
      });
    } else {
      fileContents.names = name;
    }

    filesFound.push({
      filePath,
      name,
      fileContents: fileContents?.default || fileContents,
    });
  }

  return filesFound;
};
