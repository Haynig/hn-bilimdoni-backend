import mongoose from "mongoose";

const rateSchema = new mongoose.Schema(
  {
    pair: { type: String, default: "HN/SOM" },
    rate: { type: Number, default: 1200 },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Rate = mongoose.model("Rate", rateSchema);
export default Rate;
