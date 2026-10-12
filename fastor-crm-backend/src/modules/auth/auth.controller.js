const authService = require("./auth.service");
const { registerSchema, loginSchema } = require("./auth.validation");
const AppError = require("../../utils/app-error");

function validate(schema, body) {
    const result = schema.safeParse(body);

    if (!result.success) {
        throw new AppError(
            "Invalid request data",
            400,
            "VALIDATION_ERROR"
        );
    }

    return result.data;
}

async function register(req, res, next) {
    try {
        const data = validate(registerSchema, req.body);
        const result = await authService.register(data);

        res.status(201).json({
            status: "success",
            message: "Account registered successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const data = validate(loginSchema, req.body);
        const result = await authService.login(data);

        res.status(200).json({
            status: "success",
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login };