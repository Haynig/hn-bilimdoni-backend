import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

/* ======================
   SAVOLLAR BAZASI
====================== */
const questions = [
  {
    id: 1,
    question: "O‘zbekiston poytaxti qaysi shahar?",
    variants: ["Samarqand", "Buxoro", "Toshkent", "Xiva"],
    correctIndex: 2
  },
  {
    id: 2,
    question: "5 × 6 nechiga teng?",
    variants: ["11", "30", "56", "20"],
    correctIndex: 1
  },
  {
    id: 3,
    question: "HTML nimaning qisqartmasi?",
    variants: [
      "Hyper Tool Markup Language",
      "HyperText Markup Language",
      "HighText Machine Language",
      "Home Tool Markup Language"
    ],
    correctIndex: 1
  }
];

/* ======================
   USERLAR XOTIRASI
====================== */
const users = {};
/*
users[tg_id] = {
  usedToday: 0,
  wrongToday: 0,
  tokens: 0,
  lastReset: timestamp,
  currentQuestionId: null
}
*/

function resetIfNewDay(user) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  if (!user.lastReset || now - user.lastReset > oneDay) {
    user.usedToday = 0;
    user.wrongToday = 0;
    user.lastReset = now;
  }
}

/* ======================
   SAVOL OLISH
====================== */
app.get("/question", (req, res) => {
  const tg_id = req.query.tg_id;
  if (!tg_id) return res.json({ error: "tg_id yo‘q" });

  if (!users[tg_id]) {
    users[tg_id] = {
      usedToday: 0,
      wrongToday: 0,
      tokens: 0,
      lastReset: Date.now(),
      currentQuestionId: null
    };
  }

  const user = users[tg_id];
  resetIfNewDay(user);

  if (user.usedToday >= 100) {
    return res.json({ error: "❌ Kunlik savol limiti tugadi" });
  }

  if (user.wrongToday >= 10) {
    return res.json({
      error: "❌ Xato javoblar limiti tugadi. Token bilan ochish mumkin"
    });
  }

  const q = questions[Math.floor(Math.random() * questions.length)];

  user.currentQuestionId = q.id;
  user.usedToday++;

  res.json({
    questionId: q.id,
    question: q.question,
    variants: q.variants,
    leftToday: 100 - user.usedToday,
    wrongLeft: 10 - user.wrongToday,
    tokens: user.tokens
  });
});

/* ======================
   JAVOB TEKSHIRISH
====================== */
app.post("/answer", (req, res) => {
  const { tg_id, questionId, answerIndex } = req.body;

  if (!tg_id || questionId === undefined || answerIndex === undefined) {
    return res.json({ error: "Ma’lumot yetarli emas" });
  }

  const user = users[tg_id];
  const q = questions.find(q => q.id === questionId);

  if (!user || !q || user.currentQuestionId !== questionId) {
    return res.json({ error: "Savol mos kelmadi" });
  }

  const correct = Number(answerIndex) === q.correctIndex;

  if (correct) {
    user.tokens += 1; // 🎯 1 token ball
  } else {
    user.wrongToday += 1;
  }

  res.json({
    correct,
    correctAnswer: q.variants[q.correctIndex],
    message: correct ? "✅ To‘g‘ri javob" : "❌ Xato javob",
    tokens: user.tokens,
    wrongLeft: 10 - user.wrongToday
  });
});

/* ======================
   TOKEN BILAN XATO LIMIT OCHISH
====================== */
app.post("/use-token", (req, res) => {
  const { tg_id } = req.body;

  if (!users[tg_id]) {
    return res.json({ error: "Foydalanuvchi topilmadi" });
  }

  const user = users[tg_id];

  if (user.tokens < 5) {
    return res.json({
      error: "❌ Yetarli token yo‘q (kamida 5 ta kerak)"
    });
  }

  user.tokens -= 5;
  user.wrongToday = 0;

  res.json({
    success: true,
    message: "✅ Xato javoblar limiti tiklandi",
    tokens: user.tokens
  });
});

/* ======================
   SERVER ISHGA TUSHADI
====================== */
app.listen(PORT, () => {
  console.log("Server ishga tushdi:", PORT);
});
