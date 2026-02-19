import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import connectDB from "./db.js";
import User from "./models/User.js";
import Account from "./models/Account.js";
import Transaction from "./models/Transaction.js";
import Rate from "./models/Rate.js";

import walletRoutes from "./routes/wallet.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/wallet", walletRoutes);
app.use("/api/user", userRoutes);


/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.json({ message: "HN Wallet backend ishlayapti 🚀" });
});

/* =========================
   REGISTER
========================= */
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, phone, password } = req.body;

    const exists = await User.findOne({ phone });
    if (exists)
      return res.status(400).json({ error: "Telefon mavjud" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      phone,
      password: hashed
    });

    const time = Date.now();

    await Account.create([
      { userId: user._id, type: "SOM", accountNumber: "1991" + time },
      { userId: user._id, type: "HN", accountNumber: "1604" + time },
      { userId: user._id, type: "SAVINGS", accountNumber: "1999" + time },
      { userId: user._id, type: "BONUS", accountNumber: "9199" + time }
    ]);

    res.json({ message: "User yaratildi" });

  } catch (err) {
    res.status(500).json({ error: "Server xatosi" });
  }
});

/* =========================
   LOGIN
========================= */
app.post("/api/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user)
      return res.status(400).json({ error: "User topilmadi" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: "Parol noto‘g‘ri" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch {
    res.status(500).json({ error: "Server xatosi" });
  }
});

/* =========================
   CONVERT
========================= */
app.post("/api/convert", async (req, res) => {
  try {
    const { userId, fromType, toType, amount } = req.body;

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
      type: "CONVERT"
    });

    res.json({ message: "Konvertatsiya bajarildi" });

  } catch {
    res.status(500).json({ error: "Server xatosi" });
  }
});

/* ========================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portda ishlayapti`);
});
