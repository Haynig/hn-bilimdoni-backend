import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./db.js";
import User from "./models/User.js";
import Account from "./models/Account.js";
import Transaction from "./models/Transaction.js";
import Rate from "./models/Rate.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.json({ status: "HN Wallet backend ishlayapti 🚀" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} da ishlayapti`);
});
