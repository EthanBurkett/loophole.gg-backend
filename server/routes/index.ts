import auth from "./auth";
import discord from "./discord";
import { Router } from "express";
import guilds from "./discord/guilds";
const router = Router();

router.use("/auth", auth);
router.use("/discord", discord);
router.use(
  "/discord/guilds",
  (req, res, next) => setTimeout(() => next(), 3000),
  guilds
);
export default router;
