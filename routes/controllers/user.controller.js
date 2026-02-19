export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // vaqtinchalik oddiy javob
    res.status(200).json({
      success: true,
      message: "Foydalanuvchi ro'yxatdan o'tdi",
      user: { username }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    res.status(200).json({
      success: true,
      message: "Login muvaffaqiyatli",
      user: { username }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
