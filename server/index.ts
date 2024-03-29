import express from "express";
import https from "https";
import http from "http";
import chalk from "chalk";
import cors from "cors";
import routes from "./routes";
import config from "./!config";
import "./strategies/discord";
import global, { Production } from "../!global";
import session from "express-session";
import store from "connect-mongo";
import passport from "passport";
import fs from "fs";
import path from "path";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "https://loophole.gg",
      "https://www.loophole.gg",
      "http://localhost:3000",
      "https://discord.com",
    ],
    credentials: true,
  })
);

app.use(
  session({
    secret: config.cookieSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: false,
      domain: Production ? "loophole.gg" : "localhost",
      httpOnly: true,
      secure: Production,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: new store({ mongoUrl: global.mongo }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(Production ? "/" : "/v2", routes);

if (Production) {
  const sslServer = https.createServer(
    {
      key: fs.readFileSync(
        path.join("/etc/letsencrypt/live/api.loophole.gg", "privkey.pem")
      ),
      cert: fs.readFileSync(
        path.join("/etc/letsencrypt/live/api.loophole.gg", "cert.pem")
      ),
      ca: fs.readFileSync(
        path.join("/etc/letsencrypt/live/api.loophole.gg", "chain.pem")
      ),
    },
    app
  );

  sslServer.listen(443, () => {
    console.log(chalk.green("API is listening on port 443"));
  });
} else {
  app.listen(config.port, () => {
    console.log(chalk.green(`API is listening on port ${config.port}`));
  });
}
