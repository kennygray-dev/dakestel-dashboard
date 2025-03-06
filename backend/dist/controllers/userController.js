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
exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existingUser = yield userModel_1.default.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(400).json({ message: "User already exists. Please log in." });
            return;
        }
        // Create user
        const user = yield userModel_1.default.create({ name, email: normalizedEmail, password });
        res.status(201).json({
            message: "User registered successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = yield userModel_1.default.findOne({ email });
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
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials, please try again" });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ message: "Server error, please try again later" });
    }
});
exports.loginUser = loginUser;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = yield userModel_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});
exports.getUserProfile = getUserProfile;
