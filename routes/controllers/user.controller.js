import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Account from "../models/Account.js";
import { generateAccountNumber } from "../utils/accountNumber.js";

export const register = async (req,res)=>{
  const { name,email,password } = req.body;

  const exist = await User.findOne({ email });
  if(exist) return res.status(400).json({ message:"User mavjud" });

  const hash = await bcrypt.hash(password,10);
  const user = await User.create({ name,email,password:hash });

  const types = [
    {type:"HN",prefix:"HN"},
    {type:"SOM",prefix:"SM"},
    {type:"SAVINGS",prefix:"SV"},
    {type:"BONUS",prefix:"BN"}
  ];

  for(const acc of types){
    await Account.create({
      userId:user._id,
      type:acc.type,
      accountNumber:generateAccountNumber(acc.prefix),
      balance:0
    });
  }

  res.json({ message:"Ro'yxatdan o'tdi" });
};

export const login = async (req,res)=>{
  const { email,password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(400).json({ message:"User topilmadi" });

  const ok = await bcrypt.compare(password,user.password);
  if(!ok) return res.status(400).json({ message:"Password xato" });

  const token = jwt.sign({ id:user._id },process.env.JWT_SECRET);
  res.json({ token });
};
