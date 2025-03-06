import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: { product: mongoose.Types.ObjectId;  quantity: number }[];
  totalAmount: number;
  status: "pending" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        
      },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
