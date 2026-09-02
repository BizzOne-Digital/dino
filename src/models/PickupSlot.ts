import mongoose, { Schema, type Model } from "mongoose";

export interface IPickupSlot {
  _id: mongoose.Types.ObjectId;
  day: string;
  timeWindow: string;
  maxOrders: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PickupSlotSchema = new Schema<IPickupSlot>(
  {
    day: { type: String, required: true },
    timeWindow: { type: String, required: true },
    maxOrders: { type: Number, default: 20 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PickupSlot: Model<IPickupSlot> =
  mongoose.models.PickupSlot ?? mongoose.model<IPickupSlot>("PickupSlot", PickupSlotSchema);
