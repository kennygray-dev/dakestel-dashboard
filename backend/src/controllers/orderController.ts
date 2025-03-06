import { Request, Response } from "express";
import Order, { IOrder } from "../models/orderModel";
import Product from "../models/productModel";

// Create a new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
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
    const existingProducts = await Product.find({ _id: { $in: productIds } });

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
    const newOrder: IOrder = new Order({
      customerName,
      customerEmail,
      customerPhone,
      products,
      totalAmount,
      status: status || "pending", // Default to "pending" if not provided
    });

    const savedOrder = await newOrder.save();

    // Populate product details in the response
    const populatedOrder = await Order.populate(savedOrder, { path: "products.product", select: "name" });

    res.status(201).json(populatedOrder);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error creating order", error: error.message });
    } else {
      res.status(500).json({ message: "Error creating order", error: "An unknown error occurred" });
    }
  }
};

// Get all orders

export const getOrders = async (req: Request, res: Response) => {
    try {
      const orders = await Order.find().populate("products.product"); 
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  };
  


// Get a single order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "products.product",
      select: "name", 
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.status(200).json(order);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching order", error: error.message });
    } else {
      res.status(500).json({ message: "Error fetching order", error: "An unknown error occurred" });
    }
  }
};

// Update an order by ID
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate({
      path: "products.product",
      select: "name", 
    });

    if (!updatedOrder) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error updating order", error: error.message });
    } else {
      res.status(500).json({ message: "Error updating order", error: "An unknown error occurred" });
    }
  }
};

// Delete an order by ID
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error deleting order", error: error.message });
    } else {
      res.status(500).json({ message: "Error deleting order", error: "An unknown error occurred" });
    }
  }
};

// Get popular orders (most ordered products)
export const getPopularOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const popularOrders = await Order.aggregate([
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
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching popular orders", error: error.message });
    } else {
      res.status(500).json({ message: "Error fetching popular orders", error: "An unknown error occurred" });
    }
  }
};

// Get order status summary
export const getOrderStatusSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const statusSummary = await Order.aggregate([
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
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching order status summary", error: error.message });
    } else {
      res.status(500).json({ message: "Error fetching order status summary", error: "An unknown error occurred" });
    }
  }
};

// Get total number of customers
export const getTotalNumberOfCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalCustomers = await Order.distinct("customerEmail");
    res.status(200).json({ totalCustomers: totalCustomers.length });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching total customers", error: error.message });
    } else {
      res.status(500).json({ message: "Error fetching total customers", error: "An unknown error occurred" });
    }
  }
};

// Get new vs returning customers
export const getNewVsReturningCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerOrders = await Order.aggregate([
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
      } else if (customer.orderCount > 1) {
        returningCustomers++;
      }
    });

    res.status(200).json({ newCustomers, returningCustomers });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching customer data", error: error.message });
    } else {
      res.status(500).json({ message: "Error fetching customer data", error: "An unknown error occurred" });
    }
  }
};

// Get total revenue
export const getTotalRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalRevenue = await Order.aggregate([
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

    res.status(200).json({ totalRevenue: totalRevenue[0]?.totalRevenue || 0 });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching total revenue", error: error.message });
    } else {
      res.status(500).json({ message: "Error fetching total revenue", error: "An unknown error occurred" });
    }
  }
};

// Get weekly sales
export const getWeeklySales = async (req: Request, res: Response): Promise<void> => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0); // Start of the current day
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of the current week (Sunday)

    const weeklySales = await Order.aggregate([
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

    res.status(200).json({ weeklySales: weeklySales[0]?.weeklySales || 0 });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching weekly sales", error: error.message });
    } else {
      res.status(500).json({ message: "Error fetching weekly sales", error: "An unknown error occurred" });
    }
  }
};

// Get total sales
export const getTotalSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalSales = await Order.countDocuments({ status: "completed" }); // Count completed orders
    res.status(200).json({ totalSales });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching total sales", error: error.message });
    } else {
      res.status(500).json({ message: "Error fetching total sales", error: "An unknown error occurred" });
    }
  }
};

// Get weekly sales data
export const getWeeklySalesData = async (req: Request, res: Response): Promise<void> => {
  try {
    const weeklySalesData = await Order.aggregate([
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
  } catch (error) {
    res.status(500).json({ message: "Error fetching weekly sales data", error });
  }
};