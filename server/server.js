const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { corsOrigins, nodeEnv, port } = require("./config/env");
const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const progressRoutes = require("./routes/progressRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl/Postman/server-to-server) without an Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (nodeEnv !== "production" && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/progress", progressRoutes);

app.use(notFound);
app.use(errorHandler);

let server;

const startServer = async () => {
  await connectDB();
  server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down server`);
  if (server) {
    server.close(() => process.exit(0));
    return;
  }
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
