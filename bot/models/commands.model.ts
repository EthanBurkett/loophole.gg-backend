import { Schema, model } from "mongoose";

export interface Command {
  name: string;
}

const CommandSchema = new Schema<Command>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default model<Command>("commands", CommandSchema);
