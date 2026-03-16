import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

name:String,

description:String,

priceHN:Number,

images:[String],

stock:Number,

createdAt:{
type:Date,
default:Date.now
}

});

export default mongoose.model("Product",productSchema);
