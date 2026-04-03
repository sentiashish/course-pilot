require("dotenv").config();

const requiredVariables = ["MONGODB_URI", "JWT_SECRET", "YOUTUBE_API_KEY"];
const missingVariables = requiredVariables.filter(
  (name) => !process.env[name] || !String(process.env[name]).trim()
);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVariables.join(", ")}`
  );
}

const parseCorsOrigins = () => {
  const rawOrigins = process.env.CORS_ORIGIN || process.env.CLIENT_ORIGIN || "";

  const configured = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaults = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];

  return [...new Set([...configured, ...defaults])];
};

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
  corsOrigins: parseCorsOrigins(),
};