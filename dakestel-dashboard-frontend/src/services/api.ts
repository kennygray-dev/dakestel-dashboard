import axios from "axios";
import { OrderData, Order, Revenue, WeeklySales, TotalSales } from "../types"; // Import types

const API_URL = "http://localhost:5000/api"; // Replace with your backend URL

// Fetch all orders
export const getOrders = async (): Promise<Order[]> => {
  const response = await axios.get(`${API_URL}/orders`);
  return response.data;
};

// Fetch a single order by ID
export const getOrderById = async (id: string): Promise<Order> => {
  const response = await axios.get(`${API_URL}/orders/${id}`);
  return response.data;
};

// Create a new order
export const createOrder = async (orderData: OrderData): Promise<Order> => {
  const response = await axios.post(`${API_URL}/orders`, orderData);
  return response.data;
};

// Fetch total revenue
export const getTotalRevenue = async (): Promise<Revenue> => {
  const response = await axios.get(`${API_URL}/orders/total-revenue`);
  return response.data;
};

// Fetch weekly sales
export const getWeeklySales = async (): Promise<WeeklySales> => {
  const response = await axios.get(`${API_URL}/orders/weekly-sales`);
  return response.data;
};

// Fetch total sales
export const getTotalSales = async (): Promise<TotalSales> => {
  const response = await axios.get(`${API_URL}/orders/total-sales`);
  return response.data;
};