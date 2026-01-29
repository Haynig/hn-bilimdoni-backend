import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    required: true
  },
  fromAccount: String,
  toAccount: String,
  amount: Number,
  currency: {
    type: String,
    enum: ["SOM", "HN"],
    required: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
