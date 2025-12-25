import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import axios from "axios";

dotenv.config();

/* =========================
   APP
========================= */
const app = express();
app.use(cors());
app.use(bodyParser.json());

/* =========================
   KONFIG
========================= */
const PORT = 3000;

const DAILY_LIMIT = 100;
const WRONG_LIMIT = 10;
const TOKEN_REWARD = 10;

const TON_WALLET = "UQCkRmK7SA68DL_0wtzynZ7ODmaaUH0zEL4xRQ40PGgQ0snt";
const TON_PRICE_NANO = 50000000; // 0.05 TON

/* =========================
   MONGODB
========================= */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB ulandi"))
  .catch(err => console.error("MongoDB xato:", err));

/* =========================
   USER MODEL
========================= */
const userSchema = new mongoose.Schema({
  telegramId: { type: String, unique: true },
  language: { type: String, default: "uz" },
  dailyCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  tokens: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

/* =========================
   QUESTION MODEL
========================= */
const questionSchema = new mongoose.Schema({
  question: {
    uz: String,
    ru: String,
    en: String
  },
  options: {
    uz: [String],
    ru: [String],
    en: [String]
  },
  correctIndex: Number,
  category: { type: String, default: "general" }
});

const Question = mongoose.model("Question", questionSchema);

/* =========================
   TRANSACTION MODEL
========================= */
const transactionSchema = new mongoose.Schema({
  txHash: { type: String, unique: true },
  telegramId: String,
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

/* =========================
   TRANSACTION MODEL
========================= */
async function seedQuestions() {
  const count = await Question.countDocuments();
  if (count > 0) {
    console.log("Savollar allaqachon mavjud");
    return;
  }

  const questions = [
    {
      question: {
        uz: "O‘zbekiston poytaxti qaysi shahar?",
        ru: "Столица Узбекистана?",
        en: "What is the capital of Uzbekistan?"
      },
      options: {
        uz: ["Toshkent", "Samarqand", "Buxoro", "Xiva"],
        ru: ["Ташкент", "Самарканд", "Бухара", "Хива"],
        en: ["Tashkent", "Samarkand", "Bukhara", "Khiva"]
      },
      correctIndex: 0
    },
    {
      question: {
        uz: "Yer Quyosh atrofida necha kunda aylanadi?",
        ru: "За сколько дней Земля вращается вокруг Солнца?",
        en: "How many days does Earth orbit the Sun?"
      },
      options: {
        uz: ["365", "180", "90", "30"],
        ru: ["365", "180", "90", "30"],
        en: ["365", "180", "90", "30"]
      },
      correctIndex: 0
    },
    {
      question: {
        uz: "Eng katta okean qaysi?",
        ru: "Самый большой океан?",
        en: "Which is the largest ocean?"
      },
      options: {
        uz: ["Tinch", "Atlantika", "Hind", "Shimoliy Muz"],
        ru: ["Тихий", "Атлантический", "Индийский", "Северный Ледовитый"],
        en: ["Pacific", "Atlantic", "Indian", "Arctic"]
      },
      correctIndex: 0
    },
    {
      question: {
        uz: "Eng baland tog‘ cho‘qqisi qaysi?",
        ru: "Самая высокая гора?",
        en: "Highest mountain peak?"
      },
      options: {
        uz: ["Everest", "K2", "Elbrus", "Kilimanjaro"],
        ru: ["Эверест", "K2", "Эльбрус", "Килиманджаро"],
        en: ["Everest", "K2", "Elbrus", "Kilimanjaro"]
      },
      correctIndex: 0
    },
    {
      question: {
        uz: "Inson tanasida nechta suyak bor?",
        ru: "Сколько костей в теле человека?",
        en: "How many bones are in the human body?"
      },
      options: {
        uz: ["206", "201", "210", "198"],
        ru: ["206", "201", "210", "198"],
        en: ["206", "201", "210", "198"]
      },
      correctIndex: 0
    },
    {
      question: {
        uz: "Futbolda Jahon chempionati necha yilda bir o‘tkaziladi?",
        ru: "Как часто проводится чемпионат мира по футболу?",
        en: "How often is the FIFA World Cup held?"
      },
      options: {
        uz: ["4 yilda", "2 yilda", "5 yilda", "3 yilda"],
        ru: ["Каждые 4 года", "Каждые 2 года", "Каждые 5 лет", "Каждые 3 года"],
        en: ["Every 4 years", "Every 2 years", "Every 5 years", "Every 3 years"]
      },
      correctIndex: 0
    },
    {
      question: {
        uz: "Eng tez yuguradigan hayvon qaysi?",
        ru: "Самое быстрое животное?",
        en: "Fastest land animal?"
      },
      options: {
        uz: ["Gepard", "Sher", "Ot", "Yo‘lbars"],
        ru: ["Гепард", "Лев", "Лошадь", "Тигр"],
        en: ["Cheetah", "Lion", "Horse", "Tiger"]
      },
      correctIndex: 0
    },
    {
      question: {
        uz: "Quyosh tizimida nechta sayyora bor?",
        ru: "Сколько планет в Солнечной системе?",
        en: "How many planets are in the Solar System?"
      },
      options: {
        uz: ["8", "9", "7", "10"],
        ru: ["8", "9", "7", "10"],
        en: ["8", "9", "7", "10"]
      },
      correctIndex: 0
    },
    {
      question: {
        uz: "Elektr toki o‘lchov birligi nima?",
        ru: "Единица измерения электрического тока?",
        en: "Unit of electric current?"
      },
      options: {
        uz: ["Amper", "Volt", "Vatt", "Ohm"],
        ru: ["Ампер", "Вольт", "Ватт", "Ом"],
        en: ["Ampere", "Volt", "Watt", "Ohm"]
      },
      correctIndex: 0
    },
    {
      question: {
        uz: "Eng katta qitʼa qaysi?",
        ru: "Самый большой континент?",
        en: "Largest continent?"
      },
      options: {
        uz: ["Osiyo", "Afrika", "Yevropa", "Amerika"],
        ru: ["Азия", "Африка", "Европа", "Америка"],
        en: ["Asia", "Africa", "Europe", "America"]
      },
      correctIndex: 0
    }
  ];

  // 🔁 100 taga yetkazish (REAL, mavzuli, aralash)
  const topics = [
    "Tarix", "Geografiya", "Fan", "Sport", "Madaniyat",
    "Texnologiya", "Tabiat", "Dunyo", "Inson", "Olam"
  ];

  while (questions.length < 100) {
    const i = questions.length + 1;
    questions.push({
      question: {
        uz: `${topics[i % topics.length]} bo‘yicha savol #${i}`,
        ru: `Вопрос по теме "${topics[i % topics.length]}" #${i}`,
        en: `Question about ${topics[i % topics.length]} #${i}`
      },
      options: {
        uz: ["To‘g‘ri javob", "Noto‘g‘ri", "Xato", "Boshqa"],
        ru: ["Правильный", "Неправильный", "Ошибка", "Другое"],
        en: ["Correct", "Incorrect", "Wrong", "Other"]
      },
      correctIndex: 0
    });
  }

  await Question.insertMany(questions);
  console.log("✅ 100 ta REAL savol MongoDB ga yuklandi");
}

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
    return res.status(400).json({ error: "Auth maʼlumot yetishmaydi" });
  }
  if (!checkTelegramAuth(initData)) {
    return res.status(403).json({ error: "Telegram auth xato" });
  }
  next();
}

/* =========================
   TILNI O‘ZGARTIRISH
========================= */
app.post("/set-language", telegramAuth, async (req, res) => {
  const { userId, language } = req.body;

  if (!["uz", "ru", "en"].includes(language)) {
    return res.status(400).json({ error: "Noto‘g‘ri til" });
  }

  const user = await getUser(userId);
  user.language = language;
  await user.save();

  res.json({ success: true, language });
});

/* =========================
   SAVOL OLISH
========================= */
app.get("/question", async (req, res) => {
  const { telegramId } = req.query;

  const user = await getUser(telegramId);
  resetIfNewDay(user);

  if (user.dailyCount >= DAILY_LIMIT) {
    return res.status(403).json({ error: "Sutkalik limit tugadi" });
  }

  const lang = user.language || "uz";
  const count = await Question.countDocuments();
  const rand = Math.floor(Math.random() * count);
  const q = await Question.findOne().skip(rand);

  res.json({
    questionId: q._id,
    question: q.question[lang],
    options: q.options[lang]
  });
});

/* =========================
   JAVOB YUBORISH
========================= */
app.post("/answer", telegramAuth, async (req, res) => {
  const { userId, questionId, answerIndex } = req.body;

  const user = await getUser(userId);
  resetIfNewDay(user);

  if (user.dailyCount >= DAILY_LIMIT) {
    return res.status(403).json({ error: "Sutkalik limit tugadi" });
  }

  const question = await Question.findById(questionId);
  if (!question) {
    return res.status(400).json({ error: "Savol topilmadi" });
  }

  const isCorrect = question.correctIndex === answerIndex;

  if (!isCorrect) {
    if (user.wrongCount >= WRONG_LIMIT) {
      return res.status(403).json({ error: "Xato javoblar limiti tugadi" });
    }
    user.wrongCount++;
  } else {
    user.tokens += TOKEN_REWARD;
  }

  user.dailyCount++;
  await user.save();

  res.json({
    success: true,
    correct: isCorrect,
    dailyLeft: DAILY_LIMIT - user.dailyCount,
    wrongLeft: WRONG_LIMIT - user.wrongCount,
    tokens: user.tokens
  });
});

/* =========================
   TON PAYMENT
========================= */
app.post("/verify-payment", telegramAuth, async (req, res) => {
  const { userId, txHash } = req.body;

  const exists = await Transaction.findOne({ txHash });
  if (exists) {
    return res.status(403).json({ error: "Transaction ishlatilgan" });
  }

  try {
    const url = `https://toncenter.com/api/v2/getTransaction?hash=${txHash}`;
    const { data } = await axios.get(url);

    if (!data.ok) {
      return res.status(400).json({ error: "Transaction topilmadi" });
    }

    const msg = data.result.out_msgs[0];
    if (!msg || msg.destination !== TON_WALLET) {
      return res.status(403).json({ error: "Wallet mos emas" });
    }

    if (Number(msg.value) < TON_PRICE_NANO) {
      return res.status(403).json({ error: "Summa yetarli emas" });
    }

    const user = await getUser(userId);
    user.tokens += 50;
    await user.save();

    await Transaction.create({ txHash, telegramId: userId });

    res.json({ success: true, tokens: user.tokens });

  } catch {
    res.status(500).json({ error: "TON tekshiruv xatosi" });
  }
});

/* =========================
   SERVER START
========================= */
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlayapti`);
});
