// db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;

/* =========================
   models/User.js
========================= */
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  tonAddress: { type: String },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

export const User = mongoose.model("User", UserSchema);

/* =========================
   models/Account.js
========================= */
const AccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accountNumber: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ["SOM", "HN", "SAVINGS", "BONUS"],
    required: true,
  },
  balance: { type: Number, default: 0 }, // HN yoki so'm
}, { timestamps: true });

export const Account = mongoose.model("Account", AccountSchema);

/* =========================
   models/Transaction.js
========================= */
const TransactionSchema = new mongoose.Schema({
  fromAccount: { type: String },
  toAccount: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ["HN", "SOM"], required: true },
  rate: { type: Number }, // HN->SOM kurs
  type: {
    type: String,
    enum: ["TOPUP", "WITHDRAW", "P2P", "SAVINGS", "BONUS"],
  },
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "REJECTED"],
    default: "PENDING",
  },
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", TransactionSchema);

/* =========================
   models/Rate.js
========================= */
const RateSchema = new mongoose.Schema({
  pair: { type: String, default: "HN/SOM" },
  rate: { type: Number, default: 1200 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Rate = mongoose.model("Rate", RateSchema);


/* =========================
   QO‘SHIMCHA API: KONVERTATSIYA, JAMG‘ARMA, BONUS, TARIX
========================= */

// 1️⃣ HN -> SO‘M yoki SO‘M -> HN konvertatsiya
app.post("/api/convert", async (req, res) => {
  const { fromType, toType, amount, userId } = req.body;
  const rateDoc = await Rate.findOne({ pair: "HN/SOM" });
  const rate = rateDoc?.rate || 1200;

  const fromAccount = await Account.findOne({ userId, type: fromType });
  const toAccount = await Account.findOne({ userId, type: toType });

  if (!fromAccount || !toAccount) return res.status(400).json({ error: "Hisob topilmadi" });
  if (fromAccount.balance < amount) return res.status(400).json({ error: "Balans yetarli emas" });

  let convertedAmount = amount;
  if (fromType === "HN" && toType === "SOM") convertedAmount = amount * rate;
  if (fromType === "SOM" && toType === "HN") convertedAmount = amount / rate;

  fromAccount.balance -= amount;
  toAccount.balance += convertedAmount;

  await fromAccount.save();
  await toAccount.save();

  await Transaction.create({
    fromAccount: fromAccount.accountNumber,
    toAccount: toAccount.accountNumber,
    amount,
    currency: fromType,
    rate,
    type: "CONVERT",
    status: "COMPLETED",
  });

  res.json({ message: "Konvertatsiya bajarildi" });
});

// 2️⃣ Jamg‘arma ochish / to‘ldirish
app.post("/api/savings", async (req, res) => {
  const { userId, amount } = req.body;
  const main = await Account.findOne({ userId, type: "HN" });
  const savings = await Account.findOne({ userId, type: "SAVINGS" });

  if (main.balance < amount) return res.status(400).json({ error: "Balans yetarli emas" });

  main.balance -= amount;
  savings.balance += amount;

  await main.save();
  await savings.save();

  await Transaction.create({
    fromAccount: main.accountNumber,
    toAccount: savings.accountNumber,
    amount,
    currency: "HN",
    type: "SAVINGS",
    status: "COMPLETED",
  });

  res.json({ message: "Jamg‘arma to‘ldirildi" });
});

// 3️⃣ Bonusni asosiy balansga o‘tkazish (100 HN)
app.post("/api/bonus/transfer", async (req, res) => {
  const { userId } = req.body;
  const bonus = await Account.findOne({ userId, type: "BONUS" });
  const main = await Account.findOne({ userId, type: "HN" });

  if (bonus.balance < 100) return res.status(400).json({ error: "Bonus yetarli emas" });

  bonus.balance -= 100;
  main.balance += 100;

  await bonus.save();
  await main.save();

  await Transaction.create({
    fromAccount: bonus.accountNumber,
    toAccount: main.accountNumber,
    amount: 100,
    currency: "HN",
    type: "BONUS",
    status: "COMPLETED",
  });

  res.json({ message: "Bonus o‘tkazildi" });
});

// 4️⃣ Amaliyotlar tarixi (monitoring)
app.get("/api/transactions/:userId", async (req, res) => {
  const accounts = await Account.find({ userId: req.params.userId });
  const numbers = accounts.map(a => a.accountNumber);

  const history = await Transaction.find({
    $or: [
      { fromAccount: { $in: numbers } },
      { toAccount: { $in: numbers } },
    ],
  }).sort({ createdAt: -1 });

  res.json(history);
});
