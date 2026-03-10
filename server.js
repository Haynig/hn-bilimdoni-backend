import express from "express";
import dotenv from "dotenv";

import connectDB from "./db.js";
import userRoutes from "./routes/user.routes.js";
import walletRoutes from "./routes/wallet.routes.js";

dotenv.config();

connectDB();

const app = express();

import cors from "cors";

app.use(cors({
origin:"*",
methods:["GET","POST","PUT","DELETE","OPTIONS"],
allowedHeaders:["Content-Type","Authorization"]
}));

app.use(express.json());

app.get("/",(req,res)=>{
res.json({message:"HN Wallet API ishlayapti"});
});

app.use("/api/user",userRoutes);

app.use("/api/wallet", walletRoutes);

const PORT = process.env.PORT || 10000;

app.listen(PORT,()=>{
console.log("Server ishlayapti "+PORT);
});
