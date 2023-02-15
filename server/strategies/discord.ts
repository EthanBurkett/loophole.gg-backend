import { Strategy } from "passport-discord";
import passport from "passport";
import config from "../!config";
import userModel from "../models/user.model";

passport.serializeUser((user: any, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userModel.findById(id);

    return user ? done(null, user) : done(null, null);
  } catch (e) {
    console.log(e);
    return done(e, undefined);
  }
});

passport.use(
  new Strategy(
    {
      clientID: config.Discord.clientID,
      clientSecret: config.Discord.clientSecret,
      callbackURL: config.Discord.redirectUri,
      scope: ["identify", "email", "guilds"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id: discordId } = profile;
      try {
        const existingUser = await userModel.findOneAndUpdate(
          { discordId },
          { accessToken, refreshToken },
          { new: true }
        );

        if (existingUser) return done(null, existingUser);

        const newUser = new userModel({
          discordId,
          accessToken,
          refreshToken,
        });
        const savedUser = await newUser.save();

        return done(null, savedUser);
      } catch (e) {
        console.log(e);
        done(e, undefined);
      }
    }
  )
);
