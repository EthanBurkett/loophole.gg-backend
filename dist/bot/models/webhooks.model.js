"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const WebhookSchema = new mongoose_1.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    webhook: { type: String, required: true },
    createdBy: { type: String, required: true },
}, {
    timestamps: true,
    versionKey: false,
});
exports.default = (0, mongoose_1.model)("Webhook", WebhookSchema);
