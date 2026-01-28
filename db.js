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
