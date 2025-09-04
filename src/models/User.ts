import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  walletAddress: string;
  secretKey: string;
  referralCode: string;
  chainObjectId: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  secretKey: {
    type: String,
    required: true,
  },
  referralCode: {
    type: String,
    required: true,
    unique: true,
  },
  chainObjectId: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = model<IUser>("Users", userSchema);
