import User from "../models/User.js";
import Transaction from "../models/Transaction.js";


// BALANCE KO'RISH
export const getBalance = async (req,res)=>{

try{

const user = await User.findById(req.user.id);

res.json({
som:user.somBalance,
hn:user.hnBalance
});

}catch(error){

res.status(500).json({message:"Server xatosi"});

}

};




// DEPOSIT
export const deposit = async (req,res)=>{

try{

const {amount} = req.body;

const user = await User.findById(req.user.id);

user.hnBalance += Number(amount);

await user.save();

await Transaction.create({
user:user._id,
type:"deposit",
amount
});

res.json({message:"Deposit muvaffaqiyatli"});

}catch(error){

res.status(500).json({message:"Server xatosi"});

}

};




// WITHDRAW
export const withdraw = async (req,res)=>{

try{

const {amount} = req.body;

const user = await User.findById(req.user.id);

if(user.hnBalance < amount){
return res.json({message:"Balans yetarli emas"});
}

user.hnBalance -= Number(amount);

await user.save();

await Transaction.create({
user:user._id,
type:"withdraw",
amount
});

res.json({message:"Pul chiqarildi"});

}catch(error){

res.status(500).json({message:"Server xatosi"});

}

};




// TRANSFER
export const transfer = async (req,res)=>{

try{

const {username,amount} = req.body;

const sender = await User.findById(req.user.id);

const receiver = await User.findOne({username});

if(!receiver){
return res.json({message:"User topilmadi"});
}

if(sender.hnBalance < amount){
return res.json({message:"Balans yetarli emas"});
}

sender.hnBalance -= Number(amount);
receiver.hnBalance += Number(amount);

await sender.save();
await receiver.save();

await Transaction.create({
user:sender._id,
type:"transfer",
amount
});

res.json({message:"Transfer bajarildi"});

}catch(error){

res.status(500).json({message:"Server xatosi"});

}

};




// TRANSACTION HISTORY
export const getTransactions = async (req,res)=>{

try{

const tx = await Transaction
.find({user:req.user.id})
.sort({createdAt:-1});

res.json(tx);

}catch(error){

res.status(500).json({message:"Server xatosi"});

}

};
