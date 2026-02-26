import mongoose from "mongoose";

const rateSchema = new mongoose.Schema({
  value: { type: Number, default: 1200 }
});

export default mongoose.model("Rate", rateSchema);
