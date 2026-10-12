const jwt = require("jsonwebtoken");
const { pool } = require("../../config/database");
const env = require("../../config/env"); const express = require("express");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const crypto = require("node:crypto");

const router = express.Router();

// Temporary in-memory OTP storage for local development.
// Replace with persistent storage and an SMS provider before production.
const otpStore = new Map();

const requestSchema = z.object({
    phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
    dial_code: z.literal("+91"),
});

const phoneLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    // Key by phone number when available so the limit is per-phone, not per-IP.
    // When phone is missing validation will reject the request anyway, so
    // using a static fallback key is safe here.
    keyGenerator: (req) => {
        const phone = req.body?.phone;
        return typeof phone === "string" && phone.trim() ? `phone:${phone.trim()}` : "unknown";
    },
    validate: { xForwardedForHeader: false },
    handler: (req, res) => {
        res.status(429).json({
            status: 429,
            message: "Too many requests. Try again later.",
            error: "RATE_LIMIT",
        });
    },
});

router.post("/register", phoneLimiter, (req, res) => {
    const parsed = requestSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 400,
            message: "Phone number or dial code is invalid",
            error: "INVALID_PHONE",
        });
    }

    const { phone, dial_code } = parsed.data;
    const key = `${dial_code}:${phone}`;
    const now = Date.now();
    const previous = otpStore.get(key);

    if (previous && now - previous.lastSentAt < 30_000) {
        return res.status(429).json({
            status: 429,
            message: "Please wait 30 seconds before requesting another OTP.",
            error: "RATE_LIMIT",
        });
    }

    // Six-digit OTP. Only its hash is stored.
    const otp = String(crypto.randomInt(100000, 1000000));
    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    otpStore.set(key, {
        otpHash,
        expiresAt: now + 5 * 60 * 1000,
        attempts: 0,
        lastSentAt: now,
    });

    // Development only: no real SMS is sent.
    if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV OTP] ${phone}: ${otp}`);
    }

    return res.status(200).json({
        status: 200,
        message:
            process.env.NODE_ENV === "production"
                ? "OTP sent successfully"
                : "Development OTP generated. SMS delivery is not configured.",
        data: {
            phone,
            otp,
        },
    });
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});

router.post("/login", loginLimiter, async (req, res, next) => {
    try {
        const schema = z.object({
            phone: z.string().regex(/^\d{10}$/),
            dial_code: z.literal("+91"),
            otp: z.string().regex(/^\d{6}$/),
        });

        const parsed = schema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                status: 400,
                message: "Phone number, dial code, or OTP is invalid",
                error: "INVALID_REQUEST",
            });
        }

        const { phone, dial_code, otp } = parsed.data;
        const key = `${dial_code}:${phone}`;
        const record = otpStore.get(key);

        if (!record || Date.now() > record.expiresAt) {
            otpStore.delete(key);

            return res.status(401).json({
                status: 401,
                message: "Invalid or expired OTP",
                error: "INVALID_OTP",
            });
        }

        if (record.attempts >= 5) {
            return res.status(429).json({
                status: 429,
                message: "Too many attempts. Request a new OTP later.",
                error: "TOO_MANY_ATTEMPTS",
            });
        }

        const suppliedHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        if (suppliedHash !== record.otpHash) {
            record.attempts += 1;

            return res.status(
                record.attempts >= 5 ? 429 : 401
            ).json({
                status: record.attempts >= 5 ? 429 : 401,
                message: record.attempts >= 5
                    ? "Too many attempts. Request a new OTP later."
                    : "Invalid or expired OTP",
                error: record.attempts >= 5
                    ? "TOO_MANY_ATTEMPTS"
                    : "INVALID_OTP",
            });
        }

        const result = await pool.query(
            `INSERT INTO customers (phone, dial_code)
             VALUES ($1, $2)
             ON CONFLICT (phone, dial_code)
             DO UPDATE SET updated_at = NOW()
             RETURNING id, phone, dial_code`,
            [phone, dial_code]
        );

        const customer = result.rows[0];

        const token = jwt.sign(
            { role: "CUSTOMER", phone: customer.phone },
            env.JWT_SECRET,
            {
                subject: customer.id,
                expiresIn: env.JWT_EXPIRES_IN,
            }
        );

        // OTP can no longer be reused after successful verification.
        otpStore.delete(key);

        return res.status(200).json({
            status: 200,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: customer.id,
                    phone: customer.phone,
                    dial_code: customer.dial_code,
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = { router, otpStore };