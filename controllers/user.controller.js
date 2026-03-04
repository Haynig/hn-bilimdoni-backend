import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { username, password, phone } = req.body;

    // Username tekshir
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username mavjud" });
    }

    // Phone tekshir (agar yuborilgan bo‘lsa)
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: "Telefon mavjud" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      phone: phone || undefined
    });

    res.status(201).json({
      message: "Ro'yxatdan o'tildi",
      userId: newUser._id
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({ message: "Ma'lumot allaqachon mavjud" });
    }

    res.status(500).json({ message: "Server xatoligi" });
  }
};
