// const logger = require("./logger");
// const AppError = require("./appError");

// const handleCastErrorDB = (err) => {
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new AppError(message, 400);
// };

// const handleJWTError = () =>
//   new AppError("Invalid token. Please log in again!", 401);

// const handleJWTExpiredError = () =>
//   new AppError("Your token has expired! Please log in again.", 401);

// const handleDuplicateFieldsDB = (err) => {
//   const value = err.keyValue.name;
//   const message = `Duplicate field value: ${value}`;
//   return new AppError(message, 400);
// };

// const handleValidationErrorDB = (err) => {
//   const errors = Object.values(err.errors).map((el) => el.message);
//   const message = `Invalid input data. ${errors.join(". ")}`;
//   return new AppError(message, 400);
// };

// const sendErrorDev = (err, res) => {
//   logger.error(err);
//   res.status(err.statusCode).json({
//     status: err.status,
//     error: err,
//     message: err.message,
//     stack: err.stack,
//   });
// };

// const sendErrorProd = (err, res) => {
//   if (err.isOperational) {
//     logger.error(err);
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//   } else {
//     logger.error("ERROR 💥", err);
//     res.status(500).json({
//       status: "error",
//       message: "Something went very wrong!",
//     });
//   }
// };

// const errorHandlerMiddleware = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   if (process.env.NODE_ENV === "development") {
//     sendErrorDev(err, res);
//   } else if (process.env.NODE_ENV === "production") {
//     let error = { ...err };
//     error.message = err.message;

//     if (error.name === "CastError") error = handleCastErrorDB(error);
//     if (error.code === 11000) error = handleDuplicateFieldsDB(error);
//     if (error.name === "ValidationError") error = handleValidationErrorDB();
//     if (error.name === "JsonWebTokenError") error = handleJWTError();
//     if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

//     sendErrorProd(error, res);
//   } else {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//   }
// };

// module.exports = errorHandlerMiddleware;


const logger = require("./logger");
const AppError = require("./appError");

/* =======================
   ERROR TRANSFORMERS
======================= */

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value for ${field}: ${value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

/* =======================
   SEND ERROR (DEV)
======================= */

const sendErrorDev = (err, res) => {
  logger.error(err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

/* =======================
   SEND ERROR (PROD)
======================= */

const sendErrorProd = (err, res) => {
  // Operational, trusted error
  if (err.isOperational) {
    logger.error(err);

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or unknown error
  logger.error("UNEXPECTED ERROR 💥", err);

  res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

/* =======================
   GLOBAL ERROR HANDLER
======================= */

const errorHandlerMiddleware = (err, req, res, next) => {
  // Defaults
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // DEVELOPMENT
  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, res);
  }

  // PRODUCTION
  if (process.env.NODE_ENV === "production") {
    // Preserve error prototype & metadata
    let error = Object.create(err);
    error.message = err.message;

    // Mongo / Mongoose
    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }

    // JWT
    if (error.name === "JsonWebTokenError") {
      error = handleJWTError();
    }

    if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }

    return sendErrorProd(error, res);
  }

  // FALLBACK (should not happen)
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = errorHandlerMiddleware;