const { z } = require("zod");

const registerSchema = z.object({
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().email().transform((value) =>
        value.toLowerCase()
    ),
    password: z.string().min(8).max(72),
});

const loginSchema = z.object({
    email: z.string().trim().email().transform((value) =>
        value.toLowerCase()
    ),
    password: z.string().min(1).max(72),
});

module.exports = { registerSchema, loginSchema };