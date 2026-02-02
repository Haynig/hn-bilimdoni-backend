import express from "express";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import Rate from "../models/Rate.js";

const router = express.Router();

// 🔁 Konvertatsiya
router.post("/convert", async (req, res) => {
  const { fromType, toType, amount, userId } = req.body;

  const rateDoc = await Rate.findOne();
  const rate = rateDoc?.rate || 1200;

  const from = await Account.findOne({ userId, type: fromType });
  const to = await Account.findOne({ userId, type: toType });

  if (!from || !to)
    return res.status(400).json({ error: "Hisob topilmadi" });

  if (from.balance < amount)
    return res.status(400).json({ error: "Balans yetarli emas" });

  const converted =
    fromType === "HN" ? amount * rate : amount / rate;

  from.balance -= amount;
  to.balance += converted;

  await from.save();
  await to.save();

  await Transaction.create({
    fromAccount: from.accountNumber,
    toAccount: to.accountNumber,
    amount,
    currency: fromType,
    rate,
    type: "CONVERT",
    status: "COMPLETED",
  });

  res.json({ message: "Konvertatsiya bajarildi" });
});

export default router;
