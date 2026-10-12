const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/app-error");

function customerAuth(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return next(
            new AppError("Authentication required", 401, "UNAUTHORIZED")
        );
    }

    const token = authorization.slice(7).trim();

    if (!token) {
        return next(
            new AppError("Authentication required", 401, "UNAUTHORIZED")
        );
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET);

        if (payload.role !== "CUSTOMER" || !payload.sub) {
            throw new Error("Invalid customer token");
        }

        req.customer = {
            id: payload.sub,
            phone: payload.phone,
        };

        next();
    } catch {
        next(
            new AppError("Invalid or expired token", 401, "INVALID_TOKEN")
        );
    }
}

module.exports = customerAuth;