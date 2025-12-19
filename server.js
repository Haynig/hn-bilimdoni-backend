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
    answer: "toshkent"
  },
  {
    id: 2,
    question: "5 × 6 nechiga teng?",
    answer: "30"
  },
  {
    id: 3,
    question: "HTML nimaning qisqartmasi?",
    answer: "hypertext markup language"
  }
];

/* ======================
   FOYDALANUVCHI MA’LUMOTI
====================== */
const users = {};
// users[tg_id] = {
//   usedToday: 0,
//   wrongToday: 0,
//   lastReset: timestamp,
//   currentQuestion: {}
// }

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
      lastReset: Date.now(),
      currentQuestion: null
    };
  }

  const user = users[tg_id];
  resetIfNewDay(user);

  if (user.usedToday >= 100) {
    return res.json({ error: "❌ Kunlik limit tugadi" });
  }

  if (user.wrongToday >= 10) {
    return res.json({
      error: "❌ Xato javoblar limiti tugadi. Token kerak"
    });
  }

  const q = questions[Math.floor(Math.random() * questions.length)];
  user.currentQuestion = q;
  user.usedToday++;

  res.json({
    question: q.question,
    leftToday: 100 - user.usedToday,
    wrongLeft: 10 - user.wrongToday
  });
});

/* ======================
   JAVOB TEKSHIRISH
====================== */
app.post("/answer", (req, res) => {
  const { tg_id, answer } = req.body;

  if (!tg_id || !answer) {
    return res.json({ error: "Ma’lumot yetarli emas" });
  }

  const user = users[tg_id];
  if (!user || !user.currentQuestion) {
    return res.json({ error: "Savol topilmadi" });
  }

  const correct =
    answer.trim().toLowerCase() ===
    user.currentQuestion.answer.toLowerCase();

  if (!correct) user.wrongToday++;

  res.json({
    correct,
    message: correct ? "✅ To‘g‘ri javob" : "❌ Xato javob",
    wrongLeft: 10 - user.wrongToday
  });
});

/* ======================
   TOKEN ORQALI LIMIT OCHISH (JOY)
====================== */
app.post("/buy-token", (req, res) => {
  const { tg_id } = req.body;
  if (!users[tg_id]) return res.json({ error: "User yo‘q" });

  users[tg_id].wrongToday = 0;

  res.json({
    success: true,
    message: "✅ Xato limiti tiklandi"
  });
});

/* ======================
   SERVER START
====================== */
app.listen(PORT, () => {
  console.log("Server ishga tushdi:", PORT);
});
