import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["SOM", "HN", "SAVINGS", "BONUS"],
    required: true
  },
  accountNumber: { type: String, unique: true },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Account", accountSchema);
