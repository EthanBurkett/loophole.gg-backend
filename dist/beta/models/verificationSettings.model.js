"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationSettingsSchema = void 0;
const mongoose_1 = require("mongoose");
exports.VerificationSettingsSchema = new mongoose_1.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    role: { type: String, required: true },
}, {
    timestamps: true,
    versionKey: false,
});
exports.default = (0, mongoose_1.model)("VerificationSettings", exports.VerificationSettingsSchema);
