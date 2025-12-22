const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* ================== SOZLAMALAR ================== */
const DAILY_QUESTION_LIMIT = 100;
const DAILY_WRONG_LIMIT = 10;
const EXTRA_WRONG_PRICE = 5; // 5 token = +5 xato
const BOT_TOKEN = process.env.BOT_TOKEN;

/* ================== SOXTADB ================== */
const users = {};

/* ================== YORDAMCHI ================== */
function today() {
  return new Date().toISOString().slice(0, 10);
}

function initUser(userId) {
  if (!users[userId]) {
    users[userId] = {
      tokens: 0,
      stats: {
        date: today(),
        answered: 0,
        wrong: 0,
        extraWrong: 0
      }
    };
  }

  if (users[userId].stats.date !== today()) {
    users[userId].stats = {
      date: today(),
      answered: 0,
      wrong: 0,
      extraWrong: 0
    };
  }

  return users[userId];
}

/* ================== TELEGRAM AUTH ================== */
function verifyTelegramInitData(initData) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([k,v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = crypto
    .createHash("sha256")
    .update(BOT_TOKEN)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return calculatedHash === hash;
}

function telegramAuth(req, res, next) {
  const { initData } = req.body;

  if (!initData) {
    return res.status(401).json({ error: "initData yo‘q" });
  }

  if (!verifyTelegramInitData(initData)) {
    return res.status(403).json({ error: "Telegram tekshiruvdan o‘tmadi" });
  }

  const params = new URLSearchParams(initData);
  const user = JSON.parse(params.get("user"));
  req.userId = user.id;

  next();
}

/* ================== SAVOLLAR ================== */
const questions = [
  {
    id: 1,
    question: "2 + 2 = ?",
    options: ["3", "4", "5", "6"],
    correct: "4"
  },
  {
    id: 2,
    question: "5 × 3 = ?",
    options: ["15", "10", "20", "8"],
    correct: "15"
  }
];

/* ================== ROUTES ================== */

// Savol olish
app.post("/question", telegramAuth, (req, res) => {
  const user = initUser(req.userId);

  if (user.stats.answered >= DAILY_QUESTION_LIMIT) {
    return res.status(403).json({ error: "Kunlik savollar limiti tugadi" });
  }

  const q = questions[Math.floor(Math.random() * questions.length)];

  res.json({
    id: q.id,
    question: q.question,
    options: q.options,
    answered: user.stats.answered,
    limit: DAILY_QUESTION_LIMIT,
    wrong: user.stats.wrong,
    maxWrong: DAILY_WRONG_LIMIT + user.stats.extraWrong
  });
});

// Javob yuborish
app.post("/answer", telegramAuth, (req, res) => {
  const { questionId, answer } = req.body;
  const user = initUser(req.userId);

  const q = questions.find(q => q.id === questionId);
  if (!q) return res.status(404).json({ error: "Savol topilmadi" });

  user.stats.answered++;

  if (answer === q.correct) {
    user.tokens += 1;
    return res.json({
      correct: true,
      message: "To‘g‘ri! +1 token",
      tokens: user.tokens
    });
  } else {
    user.stats.wrong++;
    const maxWrong = DAILY_WRONG_LIMIT + user.stats.extraWrong;

    if (user.stats.wrong > maxWrong) {
      return res.status(403).json({ error: "Xato javoblar limiti tugadi" });
    }

    return res.json({
      correct: false,
      message: "Noto‘g‘ri javob"
    });
  }
});

// Qo‘shimcha xato sotib olish
app.post("/buy-extra-wrong", telegramAuth, (req, res) => {
  const user = initUser(req.userId);

  if (user.tokens < EXTRA_WRONG_PRICE) {
    return res.status(403).json({ error: "Token yetarli emas" });
  }

  user.tokens -= EXTRA_WRONG_PRICE;
  user.stats.extraWrong += 5;

  res.json({
    message: "+5 ta qo‘shimcha xato imkon olindi",
    tokens: user.tokens
  });
});

/* ================== START ================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server ishga tushdi:", PORT);
});
