import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js";

import userRoutes from "./routes/user.routes.js";
import walletRoutes from "./routes/wallet.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    "https://haynig.github.io"
  ],
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "HN Wallet API working 🚀" });
});

app.use("/api/user", userRoutes);
app.use("/api/wallet", walletRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route topilmadi" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portda ishlayapti`);
});
