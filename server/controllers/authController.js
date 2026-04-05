const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { jwtSecret } = require("../config/env");

const generateToken = (userId) =>
  jwt.sign({ userId }, jwtSecret, { expiresIn: "7d" });

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedName = String(name || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || "");

  if (!normalizedName || !normalizedEmail || !normalizedPassword) {
    const error = new Error("Name, email, and password are required");
    error.statusCode = 400;
    throw error;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalizedEmail)) {
    const error = new Error("Please provide a valid email address");
    error.statusCode = 400;
    throw error;
  }

  if (normalizedPassword.length < 8) {
    const error = new Error("Password must be at least 8 characters long");
    error.statusCode = 400;
    throw error;
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    const error = new Error("Email already in use");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(normalizedPassword, 12);
  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
  });

  res.status(201).json({
    success: true,
    message: "Signup successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyStudyMinutes: user.dailyStudyMinutes,
      },
      token: generateToken(user._id),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || "");

  if (!normalizedEmail || !normalizedPassword) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(normalizedPassword, user.password);

  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyStudyMinutes: user.dailyStudyMinutes,
        streakCount: user.streakCount,
      },
      token: generateToken(user._id),
    },
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

module.exports = {
  signup,
  login,
  me,
};
