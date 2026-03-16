import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

product:{
type:mongoose.Schema.Types.ObjectId,
ref:"Product"
},

amount:Number,

totalHN:Number,

status:{
type:String,
default:"pending"
}

},{timestamps:true});

export default mongoose.model("Order",orderSchema);
