import User from "../../models/User.js";
import Account from "../../models/Account.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Barcha maydonlarni to‘ldiring" });

    const exist = await User.findOne({ email });
    if (exist)
      return res.status(400).json({ error: "Email mavjud" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed
    });

    await Account.create({ userId: user._id });

    res.status(201).json({ message: "Ro‘yxatdan o‘tildi" });

  } catch (error) {
    res.status(500).json({ error: "Server xatosi" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "User topilmadi" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: "Parol noto‘g‘ri" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch {
    res.status(500).json({ error: "Server xatosi" });
  }
};
