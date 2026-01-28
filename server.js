import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";

import { User } from "./models/User.js";
import { Account } from "./models/Account.js";
import { Transaction } from "./models/Transaction.js";
import { Rate } from "./models/Rate.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 MongoDB ulanish
connectDB();

// ==========================
// YORDAMCHI FUNKSIYALAR
// ==========================
const generateAccountNumber = (prefix) => {
  const random = Math.floor(100000000000 + Math.random() * 900000000000);
  return `${prefix}${random.toString().slice(0, 12)}`;
};

// ==========================
// API: SERVER TEKSHIRUV
// ==========================
app.get("/", (req, res) => {
  res.json({ status: "HN Wallet backend ishlayapti 🚀" });
});

// ==========================
// API: USER YARATISH
// ==========================
app.post("/api/users", async (req, res) => {
  try {
    const { fullName, phone, tonAddress } = req.body;

    const user = await User.create({
      fullName,
      phone,
      tonAddress,
    });

    // 4 ta hisob avtomatik yaratiladi
    const accounts = [
      {
        userId: user._id,
        type: "SOM",
        accountNumber: generateAccountNumber("1991"),
      },
      {
        userId: user._id,
        type: "HN",
        accountNumber: generateAccountNumber("1604"),
      },
      {
        userId: user._id,
        type: "SAVINGS",
        accountNumber: generateAccountNumber("1999"),
      },
      {
        userId: user._id,
        type: "BONUS",
        accountNumber: generateAccountNumber("9199"),
      },
    ];

    await Account.insertMany(accounts);

    res.json({
      message: "User va hisoblar yaratildi",
      user,
      accounts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// API: USER BALANSLARI
// ==========================
app.get("/api/accounts/:userId", async (req, res) => {
  try {
    const accounts = await Account.find({
      userId: req.params.userId,
    });

    const rate = await Rate.findOne({ pair: "HN/SOM" });

    res.json({
      rate: rate?.rate || 1200,
      accounts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// API: KURSNI OLISH
// ==========================
app.get("/api/rate", async (req, res) => {
  const rate = await Rate.findOne({ pair: "HN/SOM" });
  res.json({ rate: rate?.rate || 1200 });
});

// ==========================
// API: KURSNI O‘ZGARTIRISH (ADMIN)
// ==========================
app.post("/api/rate", async (req, res) => {
  const { rate, adminId } = req.body;

  const updated = await Rate.findOneAndUpdate(
    { pair: "HN/SOM" },
    { rate, updatedBy: adminId },
    { upsert: true, new: true }
  );

  res.json(updated);
});

// ==========================
// SERVER ISHGA TUSHADI
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`)
);
