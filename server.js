// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

/*
  Oddiy demo storage (real loyihada DB bo‘ladi)
*/
const users = {}; 
/*
users[userId] = {
  dailyCount: 0,
  wrongCount: 0,
  tokens: 0,
  lastReset: Date
}
*/

const DAILY_LIMIT = 100;   // to‘g‘ri + xato
const WRONG_LIMIT = 10;    // xato javoblar
const EXTRA_WRONG_PRICE = 5; // 5 token = 1 imkon

function resetIfNewDay(user) {
  const now = new Date();
  if (!user.lastReset || now.toDateString() !== user.lastReset.toDateString()) {
    user.dailyCount = 0;
    user.wrongCount = 0;
    user.lastReset = now;
  }
}

app.post("/answer", (req, res) => {
  const { userId, isCorrect } = req.body;

  if (!users[userId]) {
    users[userId] = {
      dailyCount: 0,
      wrongCount: 0,
      tokens: 0,
      lastReset: new Date()
    };
  }

  const user = users[userId];
  resetIfNewDay(user);

  if (user.dailyCount >= DAILY_LIMIT) {
    return res.status(403).json({ error: "Sutkalik limit tugadi" });
  }

  if (!isCorrect) {
    if (user.wrongCount >= WRONG_LIMIT) {
      return res.status(403).json({
        error: "Xato javoblar limiti tugadi. Token orqali sotib oling."
      });
    }
    user.wrongCount++;
  }

  user.dailyCount++;

  res.json({
    success: true,
    dailyLeft: DAILY_LIMIT - user.dailyCount,
    wrongLeft: WRONG_LIMIT - user.wrongCount
  });
});

/*
  Xato javob limiti sotib olish
*/
app.post("/buy-wrong", (req, res) => {
  const { userId } = req.body;
  const user = users[userId];

  if (!user) return res.status(404).json({ error: "User topilmadi" });

  if (user.tokens < EXTRA_WRONG_PRICE) {
    return res.status(403).json({ error: "Token yetarli emas" });
  }

  user.tokens -= EXTRA_WRONG_PRICE;
  user.wrongCount--;

  res.json({
    success: true,
    tokens: user.tokens,
    wrongLeft: WRONG_LIMIT - user.wrongCount
  });
});

/*
  Walletdan token qo‘shish (TON Connectdan keyin chaqiriladi)
*/
app.post("/add-tokens", (req, res) => {
  const { userId, amount } = req.body;

  if (!users[userId]) {
    users[userId] = {
      dailyCount: 0,
      wrongCount: 0,
      tokens: 0,
      lastReset: new Date()
    };
  }

  users[userId].tokens += amount;

  res.json({
    success: true,
    tokens: users[userId].tokens
  });
});

app.listen(3000, () => {
  console.log("Server 3000-portda ishlayapti");
});
