"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklySalesData = exports.getTotalSales = exports.getWeeklySales = exports.getTotalRevenue = exports.getNewVsReturningCustomers = exports.getTotalNumberOfCustomers = exports.getOrderStatusSummary = exports.getPopularOrders = exports.deleteOrder = exports.updateOrder = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const orderModel_1 = __importDefault(require("../models/orderModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
// Create a new order
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerName, customerEmail, customerPhone, products, totalAmount, status } = req.body;
        // Validate required fields
        if (!customerName || !customerEmail || !customerPhone || !products || !totalAmount) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        // Validate products array
        if (!Array.isArray(products) || products.length === 0) {
            res.status(400).json({ message: "Products must be a non-empty array" });
            return;
        }
        // Validate product IDs
        const productIds = products.map((item) => item.product);
        const existingProducts = yield productModel_1.default.find({ _id: { $in: productIds } });
        if (existingProducts.length !== productIds.length) {
            res.status(400).json({ message: "One or more product IDs are invalid" });
            return;
        }
        // Validate status (if provided)
        if (status && !["pending", "completed"].includes(status)) {
            res.status(400).json({ message: "Invalid status. Must be 'pending' or 'completed'" });
            return;
        }
        // Create the new order
        const newOrder = new orderModel_1.default({
            customerName,
            customerEmail,
            customerPhone,
            products,
            totalAmount,
            status: status || "pending", // Default to "pending" if not provided
        });
        const savedOrder = yield newOrder.save();
        // Populate product details in the response
        const populatedOrder = yield orderModel_1.default.populate(savedOrder, { path: "products.product", select: "name" });
        res.status(201).json(populatedOrder);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error creating order", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error creating order", error: "An unknown error occurred" });
        }
    }
});
exports.createOrder = createOrder;
// Get all orders
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield orderModel_1.default.find().populate("products.product");
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});
exports.getOrders = getOrders;
// Get a single order by ID
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield orderModel_1.default.findById(req.params.id).populate({
            path: "products.product",
            select: "name",
        });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        res.status(200).json(order);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error fetching order", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error fetching order", error: "An unknown error occurred" });
        }
    }
});
exports.getOrderById = getOrderById;
// Update an order by ID
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedOrder = yield orderModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate({
            path: "products.product",
            select: "name",
        });
        if (!updatedOrder) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        res.status(200).json(updatedOrder);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error updating order", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error updating order", error: "An unknown error occurred" });
        }
    }
});
exports.updateOrder = updateOrder;
// Delete an order by ID
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedOrder = yield orderModel_1.default.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        res.status(200).json({ message: "Order deleted successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error deleting order", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error deleting order", error: "An unknown error occurred" });
        }
    }
});
exports.deleteOrder = deleteOrder;
// Get popular orders (most ordered products)
const getPopularOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const popularOrders = yield orderModel_1.default.aggregate([
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product",
                    totalQuantity: { $sum: "$products.quantity" }, // Sum quantities for each product
                },
            },
            { $sort: { totalQuantity: -1 } }, // Sort by most ordered
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            { $unwind: "$productDetails" }, // Convert productDetails array into an object
            {
                $project: {
                    _id: 0,
                    productId: "$productDetails._id",
                    name: "$productDetails.name",
                    imageUrl: "$productDetails.imageUrl", // Include image URL
                    totalQuantity: 1,
                },
            },
        ]);
        res.status(200).json(popularOrders);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error fetching popular orders", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error fetching popular orders", error: "An unknown error occurred" });
        }
    }
});
exports.getPopularOrders = getPopularOrders;
// Get order status summary
const getOrderStatusSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const statusSummary = yield orderModel_1.default.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        const formattedSummary = statusSummary.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
        res.status(200).json(formattedSummary);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error fetching order status summary", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error fetching order status summary", error: "An unknown error occurred" });
        }
    }
});
exports.getOrderStatusSummary = getOrderStatusSummary;
// Get total number of customers
const getTotalNumberOfCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalCustomers = yield orderModel_1.default.distinct("customerEmail");
        res.status(200).json({ totalCustomers: totalCustomers.length });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error fetching total customers", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error fetching total customers", error: "An unknown error occurred" });
        }
    }
});
exports.getTotalNumberOfCustomers = getTotalNumberOfCustomers;
// Get new vs returning customers
const getNewVsReturningCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerOrders = yield orderModel_1.default.aggregate([
            {
                $group: {
                    _id: "$customerEmail",
                    orderCount: { $sum: 1 },
                },
            },
        ]);
        let newCustomers = 0;
        let returningCustomers = 0;
        customerOrders.forEach((customer) => {
            if (customer.orderCount === 1) {
                newCustomers++;
            }
            else if (customer.orderCount > 1) {
                returningCustomers++;
            }
        });
        res.status(200).json({ newCustomers, returningCustomers });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error fetching customer data", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error fetching customer data", error: "An unknown error occurred" });
        }
    }
});
exports.getNewVsReturningCustomers = getNewVsReturningCustomers;
// Get total revenue
const getTotalRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const totalRevenue = yield orderModel_1.default.aggregate([
            {
                $match: { status: "completed" }, // Filter only completed orders
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" }, // Sum the totalAmount of all completed orders
                },
            },
        ]);
        res.status(200).json({ totalRevenue: ((_a = totalRevenue[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0 });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error fetching total revenue", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error fetching total revenue", error: "An unknown error occurred" });
        }
    }
});
exports.getTotalRevenue = getTotalRevenue;
// Get weekly sales
const getWeeklySales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0); // Start of the current day
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of the current week (Sunday)
        const weeklySales = yield orderModel_1.default.aggregate([
            {
                $match: {
                    status: "completed", // Filter only completed orders
                    createdAt: { $gte: startOfWeek }, // Filter orders created this week
                },
            },
            {
                $group: {
                    _id: null,
                    weeklySales: { $sum: "$totalAmount" }, // Sum the totalAmount of completed orders this week
                },
            },
        ]);
        res.status(200).json({ weeklySales: ((_a = weeklySales[0]) === null || _a === void 0 ? void 0 : _a.weeklySales) || 0 });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error fetching weekly sales", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error fetching weekly sales", error: "An unknown error occurred" });
        }
    }
});
exports.getWeeklySales = getWeeklySales;
// Get total sales
const getTotalSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalSales = yield orderModel_1.default.countDocuments({ status: "completed" }); // Count completed orders
        res.status(200).json({ totalSales });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error fetching total sales", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error fetching total sales", error: "An unknown error occurred" });
        }
    }
});
exports.getTotalSales = getTotalSales;
// Get weekly sales data
const getWeeklySalesData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const weeklySalesData = yield orderModel_1.default.aggregate([
            {
                $match: { status: "completed" }, // Filter only completed orders
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" }, // Group by year
                        week: { $week: "$createdAt" }, // Group by week
                    },
                    totalSales: { $sum: "$totalAmount" }, // Sum sales for the week
                },
            },
            {
                $sort: { "_id.year": 1, "_id.week": 1 }, // Sort by year and week
            },
            {
                $project: {
                    _id: 0,
                    week: {
                        $concat: [
                            { $toString: "$_id.year" },
                            "-W",
                            { $toString: "$_id.week" },
                        ],
                    },
                    totalSales: 1,
                },
            },
        ]);
        res.status(200).json(weeklySalesData);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching weekly sales data", error });
    }
});
exports.getWeeklySalesData = getWeeklySalesData;
