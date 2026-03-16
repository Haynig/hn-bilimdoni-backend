import express from "express";
import { getPrice } from "../controllers/shop.controller.js";

const router = express.Router();

router.get("/hn-price",getPrice);

export default router;
