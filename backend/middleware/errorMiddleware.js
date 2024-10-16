// Error Middleware to override express default error handler

const errorHandler = (err, req, res, next) => {
  // Check if there is a status code that is set like res.status(400)
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
};
