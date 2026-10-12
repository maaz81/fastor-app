const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("./auth.controller");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many authentication attempts. Please try again later.",
        error: "AUTH_RATE_LIMIT",
    },
});

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);

module.exports = router;