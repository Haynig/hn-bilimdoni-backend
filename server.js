import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HN Bilimdoni backend ishlayapti ✅");
});

app.post("/verify", (req, res) => {
  const { tg_id, tx } = req.body;
  console.log("VERIFY:", tg_id, tx);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server ishga tushdi:", PORT);
});


