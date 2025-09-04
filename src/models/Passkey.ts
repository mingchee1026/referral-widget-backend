import { Schema, model, Document, Types } from "mongoose";

export interface IPasskey extends Document {
  username: string;
  credentialID: string;
  credentialPublicKey: string; // Buffer;
  webAuthnUserID: string;
  counter: number;
  deviceType?: string;
  backedUpStatus?: boolean;
  transports?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const passkeySchema = new Schema<IPasskey>(
  {
    username: {
      type: String,
      required: true,
    },
    credentialID: {
      type: String,
      required: true,
      unique: true,
    },
    credentialPublicKey: {
      type: String, //Buffer,
      required: true,
    },
    webAuthnUserID: {
      type: String,
      required: true,
    },
    counter: {
      type: Number,
      required: true,
    },
    deviceType: {
      type: String,
    },
    backedUpStatus: {
      type: Boolean,
    },
    transports: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const Passkey = model<IPasskey>("Passkeys", passkeySchema);
