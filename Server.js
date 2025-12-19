import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./users.db");

// DB
db.run(`
CREATE TABLE IF NOT EXISTS users (
  tg_id INTEGER PRIMARY KEY,
  daily_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  tokens INTEGER DEFAULT 0,
  last_reset TEXT
)
`);

function resetIfNeeded(user){
  const today = new Date().toISOString().slice(0,10);
  if(user.last_reset !== today){
    user.daily_count = 0;
    user.wrong_count = 0;
    user.last_reset = today;
  }
}

// CHECK
app.post("/check",(req,res)=>{
  const { tg_id, correct } = req.body;

  db.get("SELECT * FROM users WHERE tg_id=?", [tg_id], (e,user)=>{
    if(!user){
      user = { tg_id, daily_count:0, wrong_count:0, tokens:0, last_reset:null };
      db.run("INSERT INTO users (tg_id) VALUES (?)",[tg_id]);
    }

    resetIfNeeded(user);

    if(user.daily_count >= 100 && user.tokens <= 0)
      return res.json({ ok:false, reason:"DAILY_LIMIT" });

    if(!correct){
      user.wrong_count++;
      if(user.wrong_count >= 10 && user.tokens <= 0)
        return res.json({ ok:false, reason:"WRONG_LIMIT" });
    }

    user.daily_count++;

    db.run(
      "UPDATE users SET daily_count=?, wrong_count=?, last_reset=? WHERE tg_id=?",
      [user.daily_count, user.wrong_count, user.last_reset, tg_id]
    );

    res.json({ ok:true });
  });
});

// TOKEN
app.post("/use-token",(req,res)=>{
  const { tg_id } = req.body;

  db.get("SELECT * FROM users WHERE tg_id=?", [tg_id], (e,user)=>{
    if(!user || user.tokens <= 0)
      return res.json({ ok:false });

    user.tokens--;
    user.daily_count = Math.max(0, user.daily_count - 10);

    db.run(
      "UPDATE users SET tokens=?, daily_count=? WHERE tg_id=?",
      [user.tokens, user.daily_count, tg_id]
    );

    res.json({ ok:true });
  });
});

// TEST
app.get("/", (req,res)=> res.send("HN Bilimdoni API ishlayapti"));

app.listen(3000, ()=>console.log("Server 3000 portda"));

