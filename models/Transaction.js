import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  fromAccount: String,
  toAccount: String,
  amount: Number,
  currency: { type: String, enum: ["HN", "SOM"] },
  rate: Number,
  type: String,
  status: { type: String, default: "COMPLETED" }
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
