import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "deposit",        // hisob to‘ldirish
        "withdraw",       // yechib olish
        "p2p_send",       // p2p jo‘natish
        "p2p_receive",    // p2p qabul
        "exchange_buy",   // HN sotib olish
        "exchange_sell",  // HN sotish
        "savings_in",     // jamg‘armaga o‘tkazish
        "savings_out",    // jamg‘armadan chiqarish
        "bonus_convert"   // bonusni asosiy balansga o‘tkazish
      ],
      required: true,
    },

    currency: {
      type: String,
      enum: ["UZS", "HN"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    rate: {
      type: Number,
      default: null, // HN ↔ so‘m kursi (masalan 1200)
    },

    fromAccount: {
      type: String,
      default: null, // 1991..., 1604..., 1999..., 9199...
    },

    toAccount: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
