
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === "production";

    if (statusCode >= 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        status: "error",
        message:
            statusCode >= 500 && isProduction
                ? "Internal server error"
                : err.message || "Something went wrong",
        error: err.code || "INTERNAL_ERROR",
        ...(isProduction ? {} : { stack: err.stack }),
    });
}

module.exports = errorHandler;
