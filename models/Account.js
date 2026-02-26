import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["HN","SOM","SAVINGS","BONUS"] },
  accountNumber: { type: String, unique: true },
  balance: { type: Number, default: 0 }
});

export default mongoose.model("Account", accountSchema);
