import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Account from "../models/Account.js";

const router = express.Router();

// 🔢 random account number generator
const generateAccountNumber = (prefix) => {
  const random = Math.floor(100000000 + Math.random() * 900000000);
  return `${prefix} ${random}`;
};

// 👤 User yaratish
router.post("/create", async (req, res) => {
  try {
    const { fullName, phone, tonAddress } = req.body;

    // Telefon tekshirish
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: "Bu telefon bilan user mavjud" });
    }

    // 1️⃣ User yaratish
    const user = await User.create({
      fullName,
      phone,
      tonAddress,
    });

    // 2️⃣ 4 ta account yaratish
    const accounts = await Account.insertMany([
      {
        userId: user._id,
        type: "SOM",
        accountNumber: generateAccountNumber("1991"),
        balance: 0,
      },
      {
        userId: user._id,
        type: "HN",
        accountNumber: generateAccountNumber("1604"),
        balance: 0,
      },
      {
        userId: user._id,
        type: "SAVINGS",
        accountNumber: generateAccountNumber("1999"),
        balance: 0,
      },
      {
        userId: user._id,
        type: "BONUS",
        accountNumber: generateAccountNumber("9199"),
        balance: 0,
      },
    ]);

    res.status(201).json({
      message: "User va accountlar yaratildi ✅",
      user,
      accounts,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server xatosi" });
  }
});

export default router;
