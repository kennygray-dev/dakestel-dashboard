import { Request, Response } from "express";
import Product from "../models/productModel";

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find(); // Fetch all products
    res.status(200).json(products);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching products", error: error.message });
    } else {
      res.status(500).json({ message: "Error fetching products", error: "An unknown error occurred" });
    }
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    } else {
      res.status(500).json({ message: "Server Error", error: "An unknown error occurred" });
    }
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !stock || !imageUrl) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Validate category
    if (!["Home Care", "Car Care"].includes(category)) {
      res.status(400).json({ message: "Invalid category. Must be 'Home Care' or 'Car Care'" });
      return;
    }

    // Create the new product
    const product = new Product({ name, description, price, category, stock, imageUrl });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: "Error creating product", error: error.message });
    } else {
      res.status(400).json({ message: "Error creating product", error: "An unknown error occurred" });
    }
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.body;

    // Validate category (if provided)
    if (category && !["Home Care", "Car Care"].includes(category)) {
      res.status(400).json({ message: "Invalid category. Must be 'Home Care' or 'Car Care'" });
      return;
    }

    // Update the product
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: "Error updating product", error: error.message });
    } else {
      res.status(400).json({ message: "Error updating product", error: "An unknown error occurred" });
    }
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    } else {
      res.status(500).json({ message: "Server Error", error: "An unknown error occurred" });
    }
  }
};

export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.status(200).json(products);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching products by category", error: error.message });
    } else {
      res.status(500).json({ message: "Error fetching products by category", error: "An unknown error occurred" });
    }
  }
};