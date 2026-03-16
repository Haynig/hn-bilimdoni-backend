import { getHNtoUZS } from "../services/convert.service.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

export const buyProduct = async(req,res)=>{

const {productId,amount} = req.body;

const product = await Product.findById(productId);

const user = await User.findById(req.user.id);

const total = product.priceHN * amount;

if(user.hnBalance < total){
return res.json({message:"Token yetarli emas"});
}

user.hnBalance -= total;

await user.save();

await Order.create({
user:user._id,
product:productId,
amount,
totalHN:total
});

res.json({message:"Sotib olindi"});

};
