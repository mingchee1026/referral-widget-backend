import { Schema, model, Document, Types } from "mongoose";

export interface IReferralEvent extends Document {
  referrer: string;
  referee: string;
  brand: string;
  product: string;
  createdAt: Date;
}

const referralEventSchema = new Schema<IReferralEvent>({
  referrer: {
    type: String,
    required: true,
  },
  referee: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  product: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ReferralEvent = model<IReferralEvent>(
  "ReferralEvents",
  referralEventSchema
);
