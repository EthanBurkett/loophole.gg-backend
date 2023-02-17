"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _global_1 = __importDefault(require("../../!global"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(_global_1.default.sendgrid.apiKey);
exports.default = {
    send: (email) => mail_1.default
        .send(email)
        .then(() => ({
        success: true,
    }))
        .catch((e) => ({
        success: false,
        error: e,
    })),
};
