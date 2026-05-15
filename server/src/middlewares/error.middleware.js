const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  // Reduce logging noise for normal auth errors (like missing token on public page)
  if (statusCode >= 500) {
    console.error(`[Error] ${error.message}`, error);
  } else if (process.env.NODE_ENV === "development" && statusCode !== 401) {
    // Only log 4xx errors in dev if they aren't routine 401 polls
    console.error(`[${statusCode}] ${error.message}`);
  }

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    errors: error.errors || null,

    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
    }),
  });
};

export default errorMiddleware;
