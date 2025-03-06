import { Request } from "express";
import { IUser } from "./models/userModel";

export interface CustomRequest extends Request {
  user?: IUser; // ✅ Only one declaration
}


export interface Product {
  _id: string;
  name: string;  // Ensure the name property exists
  quantity: number;
  price: number; 
}


export interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  status: "pending" | "completed";
  products: {
    product: {
      _id: string;
      name: string;
    } | string; 
    quantity: number;
  }[];
}

