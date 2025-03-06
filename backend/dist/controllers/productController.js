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
exports.getProductsByCategory = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const productModel_1 = __importDefault(require("../models/productModel"));
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield productModel_1.default.find(); // Fetch all products
        res.status(200).json(products);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error fetching products", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error fetching products", error: "An unknown error occurred" });
        }
    }
});
exports.getProducts = getProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield productModel_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.json(product);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
        else {
            res.status(500).json({ message: "Server Error", error: "An unknown error occurred" });
        }
    }
});
exports.getProductById = getProductById;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const product = new productModel_1.default({ name, description, price, category, stock, imageUrl });
        const savedProduct = yield product.save();
        res.status(201).json(savedProduct);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Error creating product", error: error.message });
        }
        else {
            res.status(400).json({ message: "Error creating product", error: "An unknown error occurred" });
        }
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.body;
        // Validate category (if provided)
        if (category && !["Home Care", "Car Care"].includes(category)) {
            res.status(400).json({ message: "Invalid category. Must be 'Home Care' or 'Car Care'" });
            return;
        }
        // Update the product
        const product = yield productModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.json(product);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "Error updating product", error: error.message });
        }
        else {
            res.status(400).json({ message: "Error updating product", error: "An unknown error occurred" });
        }
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield productModel_1.default.findByIdAndDelete(req.params.id);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Server Error", error: error.message });
        }
        else {
            res.status(500).json({ message: "Server Error", error: "An unknown error occurred" });
        }
    }
});
exports.deleteProduct = deleteProduct;
const getProductsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.params;
        const products = yield productModel_1.default.find({ category });
        res.status(200).json(products);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error fetching products by category", error: error.message });
        }
        else {
            res.status(500).json({ message: "Error fetching products by category", error: "An unknown error occurred" });
        }
    }
});
exports.getProductsByCategory = getProductsByCategory;
