import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  fromType: String,
  toType: String,
  amount: Number,
  type: String
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
