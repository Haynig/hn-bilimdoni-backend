import express from "express";

import {getProducts,buyProduct} from "../controllers/shop.controller.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/products",getProducts);

router.post("/buy",auth,buyProduct);

export default router;
