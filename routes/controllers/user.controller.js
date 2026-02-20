import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { fullName, phone, password } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: "User allaqachon mavjud" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      phone,
      password: hashedPassword
    });

    res.json({
      message: "Ro'yxatdan o'tish muvaffaqiyatli",
      userId: user._id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server xatosi" });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Barcha maydonlarni to'ldiring" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ error: "User topilmadi" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Parol noto'g'ri" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login muvaffaqiyatli",
      token
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server xatosi" });
  }
};
