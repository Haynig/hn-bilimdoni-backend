import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  tonAddress: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const User = mongoose.model("User", userSchema);
