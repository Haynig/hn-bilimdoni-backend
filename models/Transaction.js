import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String, 
    // TOPUP | WITHDRAW | P2P | CONVERT | BONUS | SAVINGS
    required: true
  },
  fromAccount: String,
  toAccount: String,
  amount: Number,
  currency: {
    type: String, // SOM | HN
    required: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
