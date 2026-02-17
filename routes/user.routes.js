import express from "express";
import User from "../models/User.js";
import Account from "../models/Account.js";

const router = express.Router();

// 🆕 User yaratish
router.post("/create", async (req, res) => {
  try {
    const { fullName, phone, tonAddress } = req.body;

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: "Bu telefon raqam mavjud" });
    }

    const user = await User.create({
      fullName,
      phone,
      tonAddress
    });

    // 4 ta hisob yaratish
    const time = Date.now();

    await Account.create([
      {
        userId: user._id,
        type: "SOM",
        accountNumber: "1991" + time,
        balance: 0
      },
      {
        userId: user._id,
        type: "HN",
        accountNumber: "1604" + time,
        balance: 0
      },
      {
        userId: user._id,
        type: "SAVINGS",
        accountNumber: "1999" + time,
        balance: 0
      },
      {
        userId: user._id,
        type: "BONUS",
        accountNumber: "9199" + time,
        balance: 0
      }
    ]);

    res.json({
      message: "User yaratildi",
      userId: user._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// 📄 User balanslarini ko‘rish
router.get("/accounts/:userId", async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.params.userId });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: "Server xatosi" });
  }
});

export default router;
