export interface Product {
  product: string;
  quantity: number;
}

export interface OrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: Product[];
  totalAmount: number;
  status?: "pending" | "completed";
}

export interface Order extends OrderData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Revenue {
  totalRevenue: number;
}

export interface WeeklySales {
  weeklySales: number;
}

export interface TotalSales {
  totalSales: number;
}

