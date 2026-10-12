
const express = require("express");
const { pool } = require("../config/database");
const AppError = require("../utils/app-error");


const router = express.Router();

router.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Fastor CRM API is running",
    });
});

router.get("/health/db", async (req, res, next) => {
    try {
        const result = await pool.query("SELECT NOW() AS current_time");

        res.status(200).json({
            status: "success",
            message: "Database connection is healthy",
            data: result.rows[0],
        });
    } catch (error) {
        next(
            new AppError(
                "Database health check failed",
                503,
                "DATABASE_UNAVAILABLE"
            )
        );
    }
});

router.use(
    "/api/v1/auth",
    require("../modules/auth/auth.routes")
);

router.use(
    "/v1/pwa/user",
    require("../modules/pwa/otp.routes").router
);

router.use(
    "/v1/m",
    require("../modules/pwa/restaurant.routes")
);

router.use("/v1/m", require("../modules/pwa/item.routes"));
router.use(
    "/v1/pwa/user",
    require("../modules/pwa/cart.routes")
);

module.exports = router;
