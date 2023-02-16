"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const guilds_1 = require("../../../controllers/guilds");
const isAuthenticated_1 = __importDefault(require("../../../middlewares/isAuthenticated"));
const router = (0, express_1.Router)();
router.get("/", isAuthenticated_1.default, guilds_1.getGuildsController);
router.get("/:id/permissions", isAuthenticated_1.default, guilds_1.getGuildPermissionsController);
router.get("/:id", isAuthenticated_1.default, guilds_1.getGuildController);
exports.default = router;
