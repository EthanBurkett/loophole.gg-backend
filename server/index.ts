import express from "express";
import { createServer } from "http";
import chalk from "chalk";
import cors from "cors";
import routes from "./routes";
import config from "./!config";
import "./strategies/discord";
import global from "../!global";
import session from "express-session";
import store from "connect-mongo";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "https://loophole.gg",
      "https://www.loophole.gg",
      "http://localhost:3000",
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
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: new store({ mongoUrl: global.mongo }),
  })
);

app.use("/v2", routes);

app.listen(config.port, () => {
  console.log(chalk.green(`Server listening on port ${config.port}`));
});
