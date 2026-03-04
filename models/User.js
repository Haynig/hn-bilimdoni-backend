import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    unique: true,
    sparse: true   // 🔥 MUHIM
  },

  uzsBalance: {
    type: Number,
    default: 0
  },

  hnBalance: {
    type: Number,
    default: 0
  },

  cashbackBalance: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);
