import mongoose from "mongoose";

const rateSchema = new mongoose.Schema({
  rate: { type: Number, default: 1 }
});

export default mongoose.model("Rate", rateSchema);
