import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* =========================
   KONFIG
========================= */
const PORT = 3000;

const DAILY_LIMIT = 100;
const WRONG_LIMIT = 10;

const TON_WALLET = "UQCkRmK7SA68DL_0wtzynZ7ODmaaUH0zEL4xRQ40PGgQ0snt";
const TON_PRICE_NANO = 50000000; // 0.05 TON
const TOKEN_REWARD = 10;

/* =========================
   MONGODB
========================= */
mongoose.connect(process.env.MONGO_URL);

const userSchema = new mongoose.Schema({
  telegramId: String,
  dailyCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  tokens: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

/* =========================
   YORDAMCHI FUNKSIYALAR
========================= */
function resetIfNewDay(user) {
  const now = new Date();
  if (now.toDateString() !== user.lastReset.toDateString()) {
    user.dailyCount = 0;
    user.wrongCount = 0;
    user.lastReset = now;
  }
}

async function getUser(telegramId) {
  let user = await User.findOne({ telegramId });
  if (!user) {
    user = await User.create({ telegramId });
  }
  return user;
}

/* =========================
   TELEGRAM AUTH
========================= */
function checkTelegramAuth(initData) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort()
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secret = crypto
    .createHash("sha256")
    .update(process.env.BOT_TOKEN)
    .digest();

  const hmac = crypto
    .createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");

  return hmac === hash;
}

function telegramAuth(req, res, next) {
  const { initData, userId } = req.body;

  if (!initData || !userId) {
    return res.status(400).json({ error: "Auth ma’lumot yetishmaydi" });
  }

  if (!checkTelegramAuth(initData)) {
    return res.status(403).json({ error: "Telegram auth xato" });
  }

  next();
}

/* =========================
   JAVOB YUBORISH
========================= */
app.post("/answer", telegramAuth, async (req, res) => {
  const { userId, isCorrect } = req.body;

  const user = await getUser(userId);
  resetIfNewDay(user);

  if (user.dailyCount >= DAILY_LIMIT) {
    return res.status(403).json({ error: "Sutkalik limit tugadi" });
  }

  if (!isCorrect) {
    if (user.wrongCount >= WRONG_LIMIT) {
      return res.status(403).json({
        error: "Xato javoblar limiti tugadi"
      });
    }
    user.wrongCount++;
  }

  user.dailyCount++;
  await user.save();

  res.json({
    success: true,
    dailyLeft: DAILY_LIMIT - user.dailyCount,
    wrongLeft: WRONG_LIMIT - user.wrongCount,
    tokens: user.tokens
  });
});

/* =========================
   TON PAYMENT VERIFICATION
========================= */
app.post("/verify-payment", telegramAuth, async (req, res) => {
  const { userId, txHash } = req.body;

  try {
    const url = `https://toncenter.com/api/v2/getTransaction?hash=${txHash}`;
    const { data } = await axios.get(url);

    if (!data.ok) {
      return res.status(400).json({ error: "Transaction topilmadi" });
    }

    const tx = data.result;
    const msg = tx.out_msgs[0];

    if (!msg || msg.destination !== TON_WALLET) {
      return res.status(403).json({ error: "Wallet mos emas" });
    }

    if (Number(msg.value) < TON_PRICE_NANO) {
      return res.status(403).json({ error: "Summa yetarli emas" });
    }

    const user = await getUser(userId);
    user.tokens += TOKEN_REWARD;
    await user.save();

    res.json({
      success: true,
      tokens: user.tokens
    });

  } catch (err) {
    res.status(500).json({ error: "TON tekshiruvda xatolik" });
  }
});

/* =========================
   SERVER START
========================= */
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlayapti`);
});
