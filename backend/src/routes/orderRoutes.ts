import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getPopularOrders,
  getOrderStatusSummary,
  getTotalNumberOfCustomers,
  getNewVsReturningCustomers,
  getTotalRevenue,
  getWeeklySales,
  getTotalSales,
  getWeeklySalesData, 
} from "../controllers/orderController";

const router = express.Router();

// POST create a new order
router.post("/", createOrder);

// GET all orders
router.get("/", getOrders);

// GET popular orders (most ordered products)
router.get("/popular-orders", getPopularOrders);

// GET order status summary
router.get("/order-status-summary", getOrderStatusSummary);

// GET total number of customers
router.get("/total-customers", getTotalNumberOfCustomers);

// GET new vs returning customers
router.get("/new-returning-customers", getNewVsReturningCustomers);

// GET total revenue (completed orders only)
router.get("/total-revenue", getTotalRevenue);

// GET weekly sales (completed orders only)
router.get("/weekly-sales", getWeeklySales);

// GET total sales (completed orders only)
router.get("/total-sales", getTotalSales);

// GET weekly sales data (for the bar chart)
router.get("/weekly-sales-data", getWeeklySalesData); // Add the new route

// GET a single order by ID
router.get("/:id", getOrderById);

// PUT update an order by ID
router.put("/:id", updateOrder);

// DELETE an order by ID
router.delete("/:id", deleteOrder);


export default router;