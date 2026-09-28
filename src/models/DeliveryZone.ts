import mongoose, { Schema, type Model } from "mongoose";

export interface IDeliveryZone {
  _id: mongoose.Types.ObjectId;
  name: string;
  postalCodePrefixes: string[];
  fee: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryZoneSchema = new Schema<IDeliveryZone>(
  {
    name: { type: String, required: true },
    postalCodePrefixes: { type: [String], required: true },
    fee: { type: Number, default: 500 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DeliveryZone: Model<IDeliveryZone> =
  mongoose.models.DeliveryZone ??
  mongoose.model<IDeliveryZone>("DeliveryZone", DeliveryZoneSchema);
