import { Schema, model } from "mongoose";

export interface IVerificationSettings {
  guildId: string;
  channelId: string;
  role: string;
}

export const VerificationSettingsSchema = new Schema<IVerificationSettings>(
  {
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    role: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model<IVerificationSettings>(
  "VerificationSettings",
  VerificationSettingsSchema
);
