import { Schema, model } from "mongoose";

export interface AutoRole {
  guildId: string;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
}

const AutoRoleSchema = new Schema<AutoRole>(
  {
    guildId: { type: String, required: true },
    roleId: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model<AutoRole>("AutoRole", AutoRoleSchema);
