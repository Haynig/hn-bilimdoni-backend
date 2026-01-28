// server.js (Render deploy uchun tayyor)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import connectDB from './db.js';
import { User } from './models/User.js';
import { Account } from './models/Account.js';
import { Transaction } from './models/Transaction.js';
import { Rate } from './models/Rate.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB ulanish
connectDB();

const generateAccountNumber = (prefix) => {
  const random = Math.floor(100000000000 + Math.random() * 900000000000);
  return `${prefix}${random.toString().slice(0, 12)}`;
}

// Home test route
app.get('/', (req,res) => {
  res.json({status:'HN Wallet backend ishlayapti 🚀'});
});

// PORT Render talabiga mos
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ishga tushdi: ${PORT}`));
