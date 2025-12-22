// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ====== CONFIG ======
const DAILY_QUESTIONS = 100;
const DAILY_WRONG = 10;
const BASE_REWARD = 0.01;

// ====== DB CONNECT ======
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// ====== SCHEMAS ======
const User = mongoose.model("User", new mongoose.Schema({
  telegramId: Number,
  walletAddress: String,
  hnBalance: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  daily: {
    date: String,
    questionsUsed: { type: Number, default: 0 },
    wrongUsed: { type: Number, default: 0 },
    extraQuestions: { type: Number, default: 0 },
    extraWrong: { type: Number, default: 0 },
    questionPurchaseUsed: { type: Boolean, default: false }
  }
}));

const Question = mongoose.model("Question", new mongoose.Schema({
  question: String,
  options: [String],
  correct: String
}));

// ====== HELPERS ======
const today = () => new Date().toISOString().slice(0, 10);

async function getUser(tg_id) {
  let user = await User.findOne({ telegramId: tg_id });
  if (!user) {
    user = await User.create({
      telegramId: tg_id,
      daily: { date: today() }
    });
  }

  if (user.daily.date !== today()) {
    user.daily = {
      date: today(),
      questionsUsed: 0,
      wrongUsed: 0,
      extraQuestions: 0,
      extraWrong: 0,
      questionPurchaseUsed: false
    };
    user.streak = 0;
    await user.save();
  }

  return user;
}

// ====== ROUTES ======

app.get("/question", async (req, res) => {
  const tg_id = Number(req.query.tg_id);
  const user = await getUser(tg_id);

  const maxQ = DAILY_QUESTIONS + user.daily.extraQuestions;
  const maxW = DAILY_WRONG + user.daily.extraWrong;

  if (user.daily.questionsUsed >= maxQ) {
    return res.json({ blocked: true, message: "Kunlik savollar tugadi" });
  }

  if (user.daily.wrongUsed >= maxW) {
    return res.json({ blocked: true, message: "Xato limiti tugadi" });
  }

  const q = await Question.aggregate([{ $sample: { size: 1 } }]);

  res.json({
    question: q[0].question,
    options: q[0].options,
    used: user.daily.questionsUsed,
    wrong: user.daily.wrongUsed,
    streak: user.streak
  });
});

app.post("/answer", async (req, res) => {
  const { tg_id, answer, correct } = req.body;
  const user = await getUser(tg_id);

  user.daily.questionsUsed++;

  if (answer === correct) {
    user.streak++;
    const reward = BASE_REWARD * user.streak;
    user.hnBalance += reward;
    await user.save();
    return res.json({ message: `✅ +${reward.toFixed(2)} HN` });
  } else {
    user.streak = 0;
    user.daily.wrongUsed++;
    await user.save();
    return res.json({ message: "❌ Noto‘g‘ri" });
  }
});

// ====== MOCK PURCHASE ======
app.post("/buy", async (req, res) => {
  const { tg_id, type, amount } = req.body;
  const user = await getUser(tg_id);

  if (type === "wrong") user.daily.extraWrong += amount;
  if (type === "question") user.daily.extraQuestions += amount;

  await user.save();
  res.json({ message: "✅ Xarid muvaffaqiyatli" });
});

// ====== START ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
