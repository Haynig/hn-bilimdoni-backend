import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    balance: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);
