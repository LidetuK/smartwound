import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";
import { User } from "../models/index.js";
import { sendEmail } from "../utils/mailer.js";

export const register = async (req, res) => {
  const { email, password, full_name, privacy_consent } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password_hash,
      full_name,
      privacy_consent,
      is_verified: true, // Auto-verify the user
    });

    res.status(201).json({
      message: "Registration successful. You can now log in.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Registration failed." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000
    });
    res.json({ token });
  } catch (error) {
    console.error("Error during login process:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Verification token is required." });
  }

  try {
    const user = await User.findOne({
      where: {
        verification_token: token,
        verification_token_expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token." });
    }

    user.is_verified = true;
    user.verification_token = null;
    user.verification_token_expires_at = null;
    await user.save();

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}; 