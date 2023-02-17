"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_discord_1 = require("passport-discord");
const passport_1 = __importDefault(require("passport"));
const _config_1 = __importDefault(require("../!config"));
const user_model_1 = __importDefault(require("../models/user.model"));
passport_1.default.serializeUser((user, done) => {
    return done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await user_model_1.default.findById(id);
        return user ? done(null, user) : done(null, null);
    }
    catch (e) {
        console.log(e);
        return done(e, undefined);
    }
});
passport_1.default.use(new passport_discord_1.Strategy({
    clientID: _config_1.default.Discord.clientID,
    clientSecret: _config_1.default.Discord.clientSecret,
    callbackURL: _config_1.default.Discord.redirectUri,
    scope: ["identify", "email", "guilds"],
}, async (accessToken, refreshToken, profile, done) => {
    const { id: discordId } = profile;
    try {
        const existingUser = await user_model_1.default.findOneAndUpdate({ discordId }, { accessToken, refreshToken }, { new: true });
        if (existingUser)
            return done(null, existingUser);
        const newUser = new user_model_1.default({
            discordId,
            accessToken,
            refreshToken,
            email: profile.email,
        });
        const savedUser = await newUser.save();
        return done(null, savedUser);
    }
    catch (e) {
        console.log(e);
        done(e, undefined);
    }
}));
