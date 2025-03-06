"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/userRoutes.ts
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // Import the middleware
const router = express_1.default.Router();
router.post("/register", userController_1.registerUser);
router.post("/login", userController_1.loginUser);
router.get("/profile", authMiddleware_1.protect, userController_1.getUserProfile); // Use the middleware here
exports.default = router;
