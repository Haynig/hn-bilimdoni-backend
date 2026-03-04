import User from "../models/User.js";
import bcrypt from "bcryptjs";

// RO'YXATDAN O'TISH
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
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ma'lumot allaqachon mavjud" });
    }
    res.status(500).json({ message: "Server xatoligi" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { foydalanuvchi_nomi, parol } = req.body;

    if (!foydalanuvchi_nomi || !parol) {
      return res.status(400).json({ message: "Foydalanuvchi nomi va parol kerak." });
    }

    const user = await User.findOne({ username: foydalanuvchi_nomi }); // username bilan qidirish
    if (!user) {
      return res.status(400).json({ message: "Foydalanuvchi topilmadi." });
    }

    const parolMos = await bcrypt.compare(parol, user.password); // parol bilan solishtirish
    if (!parolMos) {
      return res.status(400).json({ message: "Parol noto‘g‘ri." });
    }

    res.status(200).json({ message: "Muvaffaqiyatli kirildi", userId: user._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server xatoligi" });
  }
};
