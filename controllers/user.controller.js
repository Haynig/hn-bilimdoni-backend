import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req,res)=>{

try{

const {username,password} = req.body;

if(!username || !password){

return res.status(400).json({message:"Username va password kerak"});

}

const exist = await User.findOne({username});

if(exist){

return res.status(400).json({message:"Username mavjud"});

}

const hashed = await bcrypt.hash(password,10);

await User.create({

username,
password:hashed

});

res.json({message:"Ro'yxatdan o'tildi"});

}catch(err){

console.log(err);

res.status(500).json({message:"Server xato"});

}

};


export const login = async (req,res)=>{

try{

const {username,password} = req.body;

const user = await User.findOne({username});

if(!user){

return res.status(400).json({message:"User topilmadi"});

}

const match = await bcrypt.compare(password,user.password);

if(!match){

return res.status(400).json({message:"Parol xato"});

}

const token = jwt.sign(

{id:user._id},

process.env.JWT_SECRET,

{expiresIn:"7d"}

);

res.json({token});

}catch(err){

console.log(err);

res.status(500).json({message:"Server xato"});

}

};


export const me = async (req,res)=>{

const user = await User.findById(req.user.id);

res.json({

somBalance:user.somBalance,
hnBalance:user.hnBalance

});

};
