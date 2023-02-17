"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sendgrid = void 0;
const _global_1 = __importDefault(require("../../!global"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
class Sendgrid {
    constructor() {
        mail_1.default.setApiKey(_global_1.default.sendgrid.apiKey);
    }
    async sendEmail(email) {
        await mail_1.default.send(email);
    }
    async sendOTP(to, templateData) {
        await mail_1.default.send({
            from: `security@loophole.gg`,
            to,
            subject: `Loophole.gg Verification`,
            templateId: "d-0015073ddbb54914b8d50504c51dc1bd",
            dynamicTemplateData: templateData,
        });
    }
}
exports.Sendgrid = Sendgrid;
