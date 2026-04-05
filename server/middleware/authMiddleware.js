const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { jwtSecret } = require("../config/env");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    const error = new Error("Authorization token missing");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name !== "JsonWebTokenError" && err.name !== "TokenExpiredError") {
      throw err;
    }

    const error = new Error("Invalid or expired token");
    error.statusCode = 401;
    throw error;
  }
});

module.exports = { protect };
