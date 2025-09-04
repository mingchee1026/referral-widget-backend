import { Schema, model, Document, Types } from "mongoose";

export interface ILoginEvent extends Document {
  username: string;
  brand: string;
  createdAt: Date;
}

const loginEventSchema = new Schema<ILoginEvent>({
  username: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const LoginEvent = model<ILoginEvent>("LoginEvents", loginEventSchema);
