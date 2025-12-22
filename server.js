const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * ====== SOZLAMALAR ======
 */
const DAILY_QUESTION_LIMIT = 100;
const DAILY_WRONG_LIMIT = 10;
const EXTRA_WRONG_PRICE = 5; // 5 token = 5 ta xato imkon

/**
 * ====== SOXTALASHTIRILGAN DB ======
 * Keyinchalik Mongo / Postgres ga oson ko‘chadi
 */
const users = {};

/**
 * ====== YORDAMCHI FUNKSIYALAR ======
 */
function today() {
  return new Date().toISOString().slice(0, 10);
}

function initUser(userId) {
  if (!users[userId]) {
    users[userId] = {
      id: userId,
      tokens: 0,
      stats: {
        date: today(),
        answered: 0,
        wrong: 0,
        extraWrong: 0,
      },
    };
  }

  // Kun almashsa reset
  if (users[userId].stats.date !== today()) {
    users[userId].stats = {
      date: today(),
      answered: 0,
      wrong: 0,
      extraWrong: 0,
    };
  }

  return users[userId];
}

/**
 * ====== SAVOLLAR (MISOL) ======
 */
const questions = [
  {
    id: 1,
    question: "2 + 2 = ?",
    options: ["3", "4", "5", "6"],
    correct: "4",
  },
  {
    id: 2,
    question: "5 × 3 = ?",
    options: ["15", "10", "20", "8"],
    correct: "15",
  },
];

/**
 * ====== ROUTES ======
 */

// Holatni olish
app.post("/status", (req, res) => {
  const { userId } = req.body;
  const user = initUser(userId);

  res.json({
    tokens: user.tokens,
    answered: user.stats.answered,
    wrong: user.stats.wrong,
    remainingQuestions: DAILY_QUESTION_LIMIT - user.stats.answered,
    remainingWrong:
      DAILY_WRONG_LIMIT + user.stats.extraWrong - user.stats.wrong,
  });
});

// Savol olish
app.post("/question", (req, res) => {
  const { userId } = req.body;
  const user = initUser(userId);

  if (user.stats.answered >= DAILY_QUESTION_LIMIT) {
    return res.status(403).json({ error: "Kunlik savollar limiti tugadi" });
  }

  const q = questions[Math.floor(Math.random() * questions.length)];
  res.json(q);
});

// Javob yuborish
app.post("/answer", (req, res) => {
  const { userId, questionId, answer } = req.body;
  const user = initUser(userId);

  if (user.stats.answered >= DAILY_QUESTION_LIMIT) {
    return res.status(403).json({ error: "Savollar limiti tugadi" });
  }

  const q = questions.find((q) => q.id === questionId);
  if (!q) return res.status(404).json({ error: "Savol topilmadi" });

  user.stats.answered++;

  if (answer === q.correct) {
    user.tokens += 1; // To‘g‘ri javob = 1 token
    return res.json({ correct: true, tokens: user.tokens });
  } else {
    user.stats.wrong++;

    const maxWrong = DAILY_WRONG_LIMIT + user.stats.extraWrong;
    if (user.stats.wrong > maxWrong) {
      return res.status(403).json({
        error: "Xato javoblar limiti tugadi",
      });
    }

    return res.json({
      correct: false,
      remainingWrong: maxWrong - user.stats.wrong,
    });
  }
});

// Xato imkonini token evaziga sotib olish
app.post("/buy-extra-wrong", (req, res) => {
  const { userId } = req.body;
  const user = initUser(userId);

  if (user.tokens < EXTRA_WRONG_PRICE) {
    return res.status(403).json({ error: "Token yetarli emas" });
  }

  user.tokens -= EXTRA_WRONG_PRICE;
  user.stats.extraWrong += 5;

  res.json({
    message: "5 ta qo‘shimcha xato imkon sotib olindi",
    tokens: user.tokens,
    extraWrong: user.stats.extraWrong,
  });
});

/**
 * ====== SERVER ======
 */
const PORT = 3000;
app.listen(PORT, () => {
  console.log("✅ Server ishlayapti: http://localhost:" + PORT);
});
