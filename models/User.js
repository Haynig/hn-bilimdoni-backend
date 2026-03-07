import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

username:{
type:String,
required:true,
unique:true
},
  
phone:{
type:String,
default:null,
sparse:true
},
  
password:{
type:String,
required:true
},

somBalance:{
type:Number,
default:0
},

hnBalance:{
type:Number,
default:0
}

},{timestamps:true});

export default mongoose.model("User",userSchema);
