import express from "express";

import {
deposit,
withdraw,
transfer,
getTransactions
} from "../controllers/wallet.controller.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/deposit",auth,deposit);

router.post("/withdraw",auth,withdraw);

router.post("/transfer",auth,transfer);

router.get("/transactions",auth,getTransactions);

export default router;
