import mongoose from "mongoose";

const rateSchema = new mongoose.Schema({
  pair: { type: String, default: "HN/SOM" },
  rate: { type: Number, default: 1200 }
}, { timestamps: true });

export default mongoose.model("Rate", rateSchema);
