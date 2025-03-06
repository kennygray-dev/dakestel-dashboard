"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const router = express_1.default.Router();
// POST create a new order
router.post("/", orderController_1.createOrder);
// GET all orders
router.get("/", orderController_1.getOrders);
// GET popular orders (most ordered products)
router.get("/popular-orders", orderController_1.getPopularOrders);
// GET order status summary
router.get("/order-status-summary", orderController_1.getOrderStatusSummary);
// GET total number of customers
router.get("/total-customers", orderController_1.getTotalNumberOfCustomers);
// GET new vs returning customers
router.get("/new-returning-customers", orderController_1.getNewVsReturningCustomers);
// GET total revenue (completed orders only)
router.get("/total-revenue", orderController_1.getTotalRevenue);
// GET weekly sales (completed orders only)
router.get("/weekly-sales", orderController_1.getWeeklySales);
// GET total sales (completed orders only)
router.get("/total-sales", orderController_1.getTotalSales);
// GET weekly sales data (for the bar chart)
router.get("/weekly-sales-data", orderController_1.getWeeklySalesData); // Add the new route
// GET a single order by ID
router.get("/:id", orderController_1.getOrderById);
// PUT update an order by ID
router.put("/:id", orderController_1.updateOrder);
// DELETE an order by ID
router.delete("/:id", orderController_1.deleteOrder);
exports.default = router;
