import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  fromAccount: String,
  toAccount: String,
  amount: Number,
  currency: { type: String, enum: ["HN", "SOM"] },
  rate: Number,
  type: { type: String },
  status: { type: String, default: "COMPLETED" }
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
