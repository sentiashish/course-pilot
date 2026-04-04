const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = Boolean(err.code) || statusCode < 500;
  const message =
    statusCode >= 500 && !isOperational
      ? "Something went wrong, try again"
      : err.message || "Something went wrong, try again";

  res.status(statusCode).json({
    success: false,
    message,
    code: err.code || "UNEXPECTED_ERROR",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
