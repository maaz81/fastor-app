const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../../config/database");
const env = require("../../config/env");
const AppError = require("../../utils/app-error");

function createToken(employee) {
    return jwt.sign(
        { role: employee.role },
        env.JWT_SECRET,
        {
            subject: employee.id,
            expiresIn: env.JWT_EXPIRES_IN,
        }
    );
}

function formatEmployee(employee) {
    return {
        id: employee.id,
        fullName: employee.full_name,
        email: employee.email,
        role: employee.role,
        createdAt: employee.created_at,
    };
}

async function register({ fullName, email, password }) {
    const passwordHash = await bcrypt.hash(password, 12);

    try {
        const result = await pool.query(
            `INSERT INTO employees (full_name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, full_name, email, role, created_at`,
            [fullName, email, passwordHash]
        );

        const employee = result.rows[0];

        return {
            employee: formatEmployee(employee),
            token: createToken(employee),
        };
    } catch (error) {
        if (error.code === "23505") {
            throw new AppError(
                "An account with this email already exists",
                409,
                "EMAIL_ALREADY_EXISTS"
            );
        }

        throw error;
    }
}

async function login({ email, password }) {
    const result = await pool.query(
        `SELECT id, full_name, email, password_hash, role, created_at
         FROM employees
         WHERE email = $1`,
        [email]
    );

    const employee = result.rows[0];

    if (!employee || !(await bcrypt.compare(password, employee.password_hash))) {
        throw new AppError(
            "Invalid email or password",
            401,
            "INVALID_CREDENTIALS"
        );
    }

    return {
        employee: formatEmployee(employee),
        token: createToken(employee),
    };
}

module.exports = { register, login };