import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";
import { connectCloudinary } from "./config/cloudinary.js";

import userRoutes from "./routes/user.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import refundRoutes from "./routes/refund.routes.js";
import supportRoutes from "./routes/support.routes.js";
import subscriberRoutes from "./routes/subscriber.routes.js";
import reviewRoutes from "./routes/review.routes.js";

dotenv.config();

const app = express();

await connectCloudinary();
connectDB();

// allow frontend origins
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("E-commerce API is running successfully 🚀");
});

// API routes
app.use("/images", express.static("uploads"));
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/refund", refundRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/subscriber", subscriberRoutes);
app.use("/api/review", reviewRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});