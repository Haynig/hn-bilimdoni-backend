import express from "express";
import dotenv from "dotenv";
import connectDB from "./db.js";

// routes
import walletRoutes from "./routes/wallet.routes.js";
import userRoutes from "./routes/user.routes.js";


dotenv.config();

// 🔗 MongoDB ulanish
connectDB();

const app = express();

// 🔧 middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌐 test route
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "HN Wallet backend ishlayapti 🚀",
    time: new Date(),
  });
});

// 💼 wallet API route’lar
app.use("/api/wallet", walletRoutes);
app.use("/api/user", userRoutes);


// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route topilmadi",
  });
});

// 🔥 error handler
app.use((err, req, res, next) => {
  console.error("Server xatosi:", err);
  res.status(500).json({
    error: "Server ichki xatosi",
  });
});

// 🚀 server start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portda ishlayapti`);
});
