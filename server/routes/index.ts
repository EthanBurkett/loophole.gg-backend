import auth from "./auth";
import discord from "./discord";
import { Router } from "express";
import caches from "./discord/caches";
import guilds from "./discord/guilds";
const router = Router();

router.use("/auth", auth);
router.use("/discord", discord);
router.use("/discord/caches", caches.Router);
router.use(
  "/discord/guilds",
  // (req, res, next) => setTimeout(() => next(), 1000),
  guilds
);
export default router;
