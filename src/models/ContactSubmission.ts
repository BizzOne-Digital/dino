import mongoose, { Schema, type Model } from "mongoose";

export interface IContactSubmission {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type: "general" | "order_inquiry" | "product_request";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: String,
    subject: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["general", "order_inquiry", "product_request"],
      default: "general",
    },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const ContactSubmission: Model<IContactSubmission> =
  mongoose.models.ContactSubmission ??
  mongoose.model<IContactSubmission>("ContactSubmission", ContactSubmissionSchema);
