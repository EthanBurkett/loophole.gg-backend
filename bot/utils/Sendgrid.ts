import Global from "../../!global";
import sendgrid, { MailDataRequired } from "@sendgrid/mail";

export class Sendgrid {
  constructor() {
    sendgrid.setApiKey(Global.sendgrid.apiKey);
  }

  async sendEmail(email: MailDataRequired) {
    await sendgrid.send(email);
  }

  async sendOTP(
    to: string,
    templateData: {
      code: string;
      guildname: string;
      discordinvite: string;
    }
  ) {
    await sendgrid.send({
      from: `security@loophole.gg`,
      to,
      subject: `Loophole.gg Verification`,
      templateId: "d-0015073ddbb54914b8d50504c51dc1bd",
      dynamicTemplateData: templateData,
    });
  }
}
