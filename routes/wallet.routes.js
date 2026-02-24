import express from "express";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/balance", auth, async (req, res) => {
  const account = await Account.findOne({ userId: req.userId });
  res.json({ balance: account.balance });
});

router.post("/deposit", auth, async (req, res) => {
  const { amount } = req.body;

  const account = await Account.findOne({ userId: req.userId });

  account.balance += Number(amount);
  await account.save();

  await Transaction.create({
    userId: req.userId,
    type: "deposit",
    amount
  });

  res.json({ message: "Pul qo‘shildi" });
});

router.post("/withdraw", auth, async (req, res) => {
  const { amount } = req.body;

  const account = await Account.findOne({ userId: req.userId });

  if (account.balance < amount)
    return res.status(400).json({ error: "Yetarli mablag‘ yo‘q" });

  account.balance -= Number(amount);
  await account.save();

  await Transaction.create({
    userId: req.userId,
    type: "withdraw",
    amount
  });

  res.json({ message: "Pul yechildi" });
});

export default router;
