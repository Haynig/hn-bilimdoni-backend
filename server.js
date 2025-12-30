import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* =======================
   MongoDB ulanish
======================= */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB ulandi"))
.catch(err => console.log("Mongo error:", err));

/* =======================
   User Schema
======================= */
const userSchema = new mongoose.Schema({
  telegramId: { type: String, unique: true },

  walletAddress: { type: String, default: null },

  dailyQuestions: { type: Number, default: 0 },
  dailyErrors: { type: Number, default: 0 },

  tokens: { type: Number, default: 0 },

  lastReset: { type: Date, default: Date.now }
});

/* =======================
   Kunlik reset funksiyasi
======================= */
function resetIfNewDay(user) {
  const now = new Date();
  const last = new Date(user.lastReset);

  if (now.toDateString() !== last.toDateString()) {
    user.dailyQuestions = 0;
    user.dailyErrors = 0;
    user.lastReset = now;
  }
}

/* =======================
   Savol yuborish API
======================= */
app.post("/ask", async (req, res) => {
  try {
    const { telegramId, isCorrect } = req.body;

    if (!telegramId) {
      return res.status(400).json({ message: "telegramId yo‘q" });
    }

    let user = await User.findOne({ telegramId });
    if (!user) {
      user = await User.create({ telegramId });
    }

    resetIfNewDay(user);

    // 1️⃣ Kunlik savol limiti
    if (user.dailyQuestions >= 100) {
      return res.status(403).json({
        message: "Kunlik 100 ta savol limiti tugadi"
      });
    }

    // 2️⃣ Xato limiti
    if (!isCorrect && user.dailyErrors >= 10) {
      return res.status(403).json({
        message: "Xato javoblar limiti tugadi. Token orqali oching"
      });
    }

    // Hisoblash
    user.dailyQuestions += 1;

    if (!isCorrect) {
      user.dailyErrors += 1;
    }

    await user.save();

    res.json({
      success: true,
      dailyQuestions: user.dailyQuestions,
      dailyErrors: user.dailyErrors,
      tokens: user.tokens
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server xatosi" });
  }
});

/* =======================
   Token orqali xato sotib olish
======================= */
app.post("/buy-errors", async (req, res) => {
  try {
    const { telegramId } = req.body;

    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ message: "User topilmadi" });
    }

    // 5 token = 5 ta xato imkoniyati
    if (user.tokens < 5) {
      return res.status(403).json({
        message: "Token yetarli emas"
      });
    }

    user.tokens -= 5;
    user.dailyErrors -= 5;

    if (user.dailyErrors < 0) {
      user.dailyErrors = 0;
    }

    await user.save();

    res.json({
      success: true,
      dailyErrors: user.dailyErrors,
      tokens: user.tokens
    });

  } catch (err) {
    res.status(500).json({ message: "Server xatosi" });
  }
});

/* =======================
   User holatini olish
======================= */
app.get("/status/:telegramId", async (req, res) => {
  const user = await User.findOne({ telegramId: req.params.telegramId });
  if (!user) return res.json(null);

  resetIfNewDay(user);
  await user.save();

  res.json({
    dailyQuestions: user.dailyQuestions,
    dailyErrors: user.dailyErrors,
    tokens: user.tokens
  });
});

/* =======================
   Server start
======================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server ishga tushdi:", PORT);
});
