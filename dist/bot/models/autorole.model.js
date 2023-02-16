"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AutoRoleSchema = new mongoose_1.Schema({
    guildId: { type: String, required: true },
    roleId: { type: String, required: true },
}, {
    timestamps: true,
    versionKey: false,
});
exports.default = (0, mongoose_1.model)("AutoRole", AutoRoleSchema);
