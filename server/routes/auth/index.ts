import { Router } from "express";
const router = Router();
import passport from "passport";
import config from "../../!config";

router.get("/discord", passport.authenticate("discord"), (req, res) => {
  res.send(200);
});

router.get(
  "/discord/redirect",
  passport.authenticate("discord"),
  (req, res) => {
    res.redirect(config.clientUrl);
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
  });
  res.redirect(config.clientUrl);
});

router.get("/status", async (req, res) => {
  return req.user
    ? res.send(req.user)
    : res.status(401).json({ error: "Unauthorized" });
});
export default router;
