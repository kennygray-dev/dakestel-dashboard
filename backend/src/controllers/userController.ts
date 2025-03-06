import { Request, Response } from "express";
import User from "../models/userModel"; 
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ message: "Please fill in all fields." });
      return;
    }

    // Convert email to lowercase to prevent case sensitivity issues
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ message: "User already exists. Please log in." });
      return;
    }

    // Create user
    const user = await User.create({ name, email: normalizedEmail, password });

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "User with this email does not exist" });
      return;
    }

    // Ensure the password exists before comparing
    if (!user.password) {
      res.status(500).json({ message: "User password is missing in the database" });
      return;
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials, please try again" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "1h" });

    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


