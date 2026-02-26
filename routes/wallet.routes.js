import express from "express";
import jwt from "jsonwebtoken";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

function auth(req,res,next){
  const token = req.headers.authorization?.split(" ")[1];
  if(!token) return res.status(401).json({message:"No token"});
  const decoded = jwt.verify(token,process.env.JWT_SECRET);
  req.userId = decoded.id;
  next();
}

router.get("/balance", auth, async (req,res)=>{
  const accounts = await Account.find({ userId:req.userId });
  const data = {};
  accounts.forEach(a=> data[a.type]=a.balance );
  res.json(data);
});

router.post("/deposit", auth, async (req,res)=>{
  const { type, amount } = req.body;
  const acc = await Account.findOne({ userId:req.userId,type });
  acc.balance += amount;
  await acc.save();
  await Transaction.create({ userId:req.userId,toType:type,amount,type:"DEPOSIT" });
  res.json({ message:"Deposit ok" });
});

router.post("/convert", auth, async (req,res)=>{
  const { fromType,toType,amount,rate } = req.body;

  const from = await Account.findOne({ userId:req.userId,type:fromType });
  const to = await Account.findOne({ userId:req.userId,type:toType });

  if(from.balance < amount) return res.status(400).json({message:"Balans yetarli emas"});

  const converted = fromType==="HN" ? amount*rate : amount/rate;

  from.balance -= amount;
  to.balance += converted;

  await from.save();
  await to.save();

  res.json({ message:"Convert ok" });
});

export default router;
