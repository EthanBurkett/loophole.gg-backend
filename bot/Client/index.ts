import {
  APIGuild,
  ChatInputCommandInteraction,
  Client,
  Collection,
  EmbedBuilder,
  Guild,
  GuildMember,
  PermissionsString,
  TextBasedChannel,
  User,
} from "discord.js";
import CommandLoader from "./Handlers/commandLoader";
import chalk from "chalk";
import p from "path";
import fs from "fs";

declare module "discord.js" {
  interface Client {
    log: (...message: any[]) => void;
    error: (...message: any[]) => void;
    cache: {
      prefixes: Collection<string, string>;
      autoroles: AutoRole[];
      guilds: Collection<string, APIGuild>;
    };
  }
}

export default class CustomClient {
  private _settings: any;
  private _commands: Collection<string, Command>;
  private _commandLoader: CommandLoader;
  private _commandHandler: CommandHandler;

  constructor(settings: Settings) {
    this._settings = settings;
    this._settings.client.log = (...message: any[]) => {
      console.log(
        chalk.redBright.bold("Client Logs"),
        chalk.grey.bold("»"),
        ...message
      );
    };
    this._settings.client.error = (...message: any[]) => {
      console.log(
        chalk.bgRed.whiteBright.bold(" Error "),
        chalk.grey.bold("»"),
        ...message
      );
    };

    this._settings.client.cache = {
      prefixes: new Collection(),
      guilds: new Collection(),
    };

    if (this._settings.mongo) {
      this._mongo();
    }

    this._commandLoader = new CommandLoader(this._settings.client, settings);
    this._commands = this._commandLoader.commands;

    this._commandHandler = new CommandHandler(
      this._settings.client,
      this as any
    );

    if (this._settings.bot.eventsPath) {
      this._loadEvents();
    }

    this._settings.client.log(
      `${this._settings.client.user?.tag} is now ready.`
    );
  }

  public get commands() {
    return this._commands;
  }

  public get settings() {
    return this._settings;
  }

  public get cache() {
    return this._settings.client.cache;
  }

  private _loadEvents() {
    const eventFiles = getEventFiles(this._settings.bot.eventsPath);

    for (const file of eventFiles) {
      let event = require(p.join(process.cwd(), file.filePath));
      if (event.default) event = event.default;
      event(this._settings.client, this);
    }
  }

  private async _mongo() {
    mongoose.set("strictQuery", true);
    try {
      await mongoose.connect(
        `mongodb${this._settings.mongo?.uri.srv ? "+srv" : ""}://${
          this._settings.mongo?.uri.username
        }:${encodeURIComponent(this._settings.mongo?.uri.password)}@${
          this._settings.mongo?.uri.host
        }${
          this._settings.mongo?.uri.srv
            ? ``
            : `:${this._settings.mongo?.uri.port}`
        }/${this._settings.mongo?.uri.database}`,
        this._settings.mongo?.dbOptions
      );

      this._settings.client.log(`Connected to MongoDB.`);
    } catch (e: any) {
      this._settings.client.error(`Failed to connect to MongoDB: ${e}`);
      process.exit(0);
    }
  }
}

const getEventFiles = (path: string, foldersOnly = false) => {
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
        filesFound = [...filesFound, ...getEventFiles(filePath)];
      }
      continue;
    }

    const L = filePath.replace(/\\/g, "/").replace(/\\\\/g, "/").split("/");
    let name = [L[L.length - 1].substring(0, L[L.length - 1].length - 3)];

    let fileContents = require(p.join(process.cwd(), filePath));
    if (fileContents.default) fileContents = fileContents.default;

    filesFound.push({
      filePath,
      name,
      fileContents: fileContents?.default || fileContents,
    });
  }

  return filesFound;
};

// TYPINGS

import {
  Message,
  CacheType,
  ApplicationCommandOptionData,
  Embed,
  MessagePayload,
  MessageCreateOptions,
} from "discord.js";
import mongoose from "mongoose";
import CommandHandler from "./Handlers/commandHandler";
import { AutoRole } from "../models/autorole.model";

export interface CommandOptions {
  message: Message<boolean> | null;
  interaction: ChatInputCommandInteraction<CacheType> | null;
  args: (string | number | boolean | undefined)[] | undefined;
  instance: CustomClient;
  client: Client<boolean>;
  member: GuildMember;
  guild: Guild;
  channel: TextBasedChannel | null;
  author: User;
}

export enum CommandType {
  Legacy = "legacy",
  Slash = "slash",
  Both = "both",
}

export interface Command {
  names?: string[] | string;
  type: CommandType;
  description: string;
  usage?: string;
  permission?: PermissionsString;
  testOnly?: boolean;
  options?: ApplicationCommandOptionData[];
  execute(
    options: CommandOptions
  ): string | EmbedBuilder | MessagePayload | MessageCreateOptions | void;
}

export interface Settings {
  client: Client<boolean>;
  bot: {
    prefix?: string;
    commandsDir: string;
    testServers?: string[];
    eventsPath?: string;
  };
  events?: {
    [key: string]: (client: Client<boolean>, instance: CustomClient) => void;
  };
  defaultCommands?: {
    [key: string]: {
      names?: string;
      type?: CommandType;
      description?: string;
      usage?: string;
      permission?: PermissionsString;
      testOnly?: boolean;
      options?: ApplicationCommandOptionData[];
      execute?(
        options: CommandOptions
      ): string | Embed | MessagePayload | MessageCreateOptions | void;
    };
  };
  mongo?: {
    uri: {
      srv: boolean;
      username: string;
      password: string;
      host: string;
      database: string;
    };
    dbOptions?: mongoose.ConnectOptions;
  };
}
