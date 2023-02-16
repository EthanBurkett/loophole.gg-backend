import { Schema, model } from "mongoose";

export interface Webhook {
  _id: string;
  guildId: string;
  channelId: string;
  webhook: string;
  createdBy: string;
}

const WebhookSchema = new Schema<Webhook>(
  {
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    webhook: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model<Webhook>("Webhook", WebhookSchema);
