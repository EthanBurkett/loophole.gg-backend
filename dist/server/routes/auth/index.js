"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const passport_1 = __importDefault(require("passport"));
const _config_1 = __importDefault(require("../../!config"));
router.get("/discord", passport_1.default.authenticate("discord"), (req, res) => {
    res.send(200);
});
router.get("/discord/redirect", passport_1.default.authenticate("discord"), (req, res) => {
    res.redirect(_config_1.default.clientUrl);
});
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        console.log(err);
    });
    res.redirect(_config_1.default.clientUrl);
});
router.get("/status", async (req, res) => {
    return req.user
        ? res.send(req.user)
        : res.status(401).json({ error: "Unauthorized" });
});
exports.default = router;
