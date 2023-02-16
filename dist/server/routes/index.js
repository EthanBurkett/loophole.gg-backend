"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = __importDefault(require("./auth"));
const discord_1 = __importDefault(require("./discord"));
const express_1 = require("express");
const guilds_1 = __importDefault(require("./discord/guilds"));
const router = (0, express_1.Router)();
router.use("/auth", auth_1.default);
router.use("/discord", discord_1.default);
router.use("/discord/guilds", (req, res, next) => setTimeout(() => next(), 3000), guilds_1.default);
exports.default = router;
