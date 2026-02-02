import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    fromAccount: { type: String },
    toAccount: { type: String },
    amount: { type: Number, required: true },
    currency: {
      type: String,
      enum: ["HN", "SOM"],
      required: true,
    },
    rate: { type: Number },
    type: {
      type: String,
      enum: ["TOPUP", "WITHDRAW", "P2P", "SAVINGS", "BONUS", "CONVERT"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
