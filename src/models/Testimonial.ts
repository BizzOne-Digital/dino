import mongoose, { Schema, type Model } from "mongoose";

export interface ITestimonial {
  _id: mongoose.Types.ObjectId;
  name: string;
  content: string;
  rating: number;
  isPlaceholder: boolean;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    isPlaceholder: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial ?? mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
