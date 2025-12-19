// server.js — tiklangan va to'liq ishlaydigan backend
// Express + Telegram WebApp + TON Connect uchun

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

/***********************
 * SOZLAMALAR
 ***********************/
const DAILY_QUESTION_LIMIT = 100; // 1 sutkada jami savollar (to'g'ri + xato)
const DAILY_ERROR_LIMIT = 10;     // 1 sutkada xato javoblar
const EXTRA_ERROR_PACK = 5;       // token bilan olinadigan xato imkoniyati

/***********************
 * VAQT YORDAMCHI FUNKSIYALAR
 ***********************/
function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

/***********************
 * USER STORAGE (TEMP)
 * Keyinchalik MongoDB ga ko'chiriladi
 ***********************/
const users = {};

function getUser(userId) {
  if (!users[userId]) {
    users[userId] = {
      userId,
      wallet: null,
      tokens: 0,
      score: 0,
      stats: {
        date: todayKey(),
        questions: 0,
        errors: 0,
        extraErrors: 0
      }
    };
  }

  // yangi kun bo'lsa reset
  if (users[userId].stats.date !== todayKey()) {
    users[userId].stats = {
      date: todayKey(),
      questions: 0,
      errors: 0,
      extraErrors: 0
    };
  }

  return users[userId];
}

/***********************
 * SAVOLLAR (DEMO)
 ***********************/
const QUESTIONS = [ Rockaiut-code ]
  {
    id: 1,
    question: '2 + 2 = ?'
    ,options: ['3', '4', '5', '6'],
    correct: '4'
  },
  {
    id: 2,
    question: '5 * 3 = ?'
    ,options: ['15', '10', '20', '8'],
    correct: '15'
  }
];

function getRandomQuestion() {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
}

/***********************
 * ENDPOINTLAR
 ***********************/

// User info
app.post('/user', (req, res) => {
  const { userId } = req.body;
  const user = getUser(userId);
  res.json(user);
});

// Savol olish
app.post('/question', (req, res) => {
  const { userId } = req.body;
  const user = getUser(userId);

  if (user.stats.questions >= DAILY_QUESTION_LIMIT) {
    return res.status(403).json({ error: 'Kunlik savol limiti tugadi' });
  }

  user.stats.questions++;
  const q = getRandomQuestion();

  res.json({
    id: q.id,
    question: q.question,
    options: q.options
  });
});

// Javob yuborish
app.post('/answer', (req, res) => {
  const { userId, questionId, answer } = req.body;
  const user = getUser(userId);

  const q = QUESTIONS.find(q => q.id === questionId);
  if (!q) return res.status(404).json({ error: 'Savol topilmadi' });

  let correct = false;

  if (q.correct === answer) {
    correct = true;
    user.score += 1;
    user.tokens += 1;
  } else {
    if (user.stats.errors >= DAILY_ERROR_LIMIT + user.stats.extraErrors) {
      return res.status(403).json({ error: 'Xato limiti tugadi' });
    }
    user.stats.errors++;
  }

  res.json({
    correct,
    score: user.score,
    tokens: user.tokens,
    stats: user.stats
  });
});

// Token bilan xato limiti sotib olish
app.post('/buy-errors', (req, res) => {
  const { userId } = req.body;
  const user = getUser(userId);

  const price = 5; // 5 token

  if (user.tokens < price) {
    return res.status(403).json({ error: 'Token yetarli emas' });
  }

  user.tokens -= price;
  user.stats.extraErrors += EXTRA_ERROR_PACK;

  res.json({
    message: 'Xato limiti oshirildi',
    extraErrors: user.stats.extraErrors,
    tokens: user.tokens
  });
});

// Wallet ulash (TON Connect callback o'rniga demo)
app.post('/connect-wallet', (req, res) => {
  const { userId, wallet } = req.body;
  const user = getUser(userId);

  user.wallet = wallet;

  res.json({ success: true, wallet });
});

/***********************
 * SERVER START
 ***********************/
app.listen(PORT, () => {
  console.log('Server ishga tushdi: http://localhost:' + PORT);
});
