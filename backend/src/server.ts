import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";

dotenv.config();
const app: Application = express();

// Middleware
app.use(express.json());
app.use(cors());

// Default route to check if the server is working
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

const PORT: string | number = process.env.PORT || 5000;



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

