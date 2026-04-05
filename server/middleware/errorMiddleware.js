const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const normalizeMongooseError = (err) => {
  if (err?.name === "CastError") {
    return {
      statusCode: 400,
      message: "Invalid identifier format",
      code: "INVALID_IDENTIFIER",
    };
  }

  if (err?.name === "ValidationError") {
    return {
      statusCode: 400,
      message: Object.values(err.errors || {})
        .map((item) => item.message)
        .join(", "),
      code: "VALIDATION_ERROR",
    };
  }

  if (err?.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0] || "resource";
    return {
      statusCode: 409,
      message: `${duplicateField} already exists`,
      code: "DUPLICATE_RESOURCE",
    };
  }

  return null;
};

const defaultCodeByStatus = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  429: "RATE_LIMITED",
  500: "INTERNAL_SERVER_ERROR",
};

const errorHandler = (err, req, res, next) => {
  const normalizedDbError = normalizeMongooseError(err);
  const statusCode = normalizedDbError?.statusCode || err.statusCode || 500;
  const isOperational = Boolean(err.code) || statusCode < 500;
  const message =
    normalizedDbError?.message ||
    (statusCode >= 500 && !isOperational
      ? "Something went wrong, try again"
      : err.message || "Something went wrong, try again");

  res.status(statusCode).json({
    success: false,
    message,
    code:
      normalizedDbError?.code ||
      err.code ||
      defaultCodeByStatus[statusCode] ||
      "UNEXPECTED_ERROR",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
