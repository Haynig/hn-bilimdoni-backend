import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./db.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors({
origin:[
"https://haynig.github.io",
"http://localhost:5500"
]
}));

app.use(express.json());

app.get("/",(req,res)=>{
res.json({message:"HN Wallet API ishlayapti"});
});

app.use("/api/user",userRoutes);

const PORT = process.env.PORT || 10000;

app.listen(PORT,()=>{
console.log("Server ishlayapti "+PORT);
});
