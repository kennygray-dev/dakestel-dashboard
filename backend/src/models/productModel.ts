import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: "Home Care" | "Car Care"; // Enforce specific categories
  stock: number;
  imageUrl: string;
}

const productSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
      type: String, 
      required: true, 
      enum: ["Home Care", "Car Care"] 
    },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
      },
    ],
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", productSchema);