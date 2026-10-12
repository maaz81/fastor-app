const express = require("express");
const { z } = require("zod");
const { pool } = require("../../config/database");
const customerAuth = require("../../middleware/customer-auth");
const AppError = require("../../utils/app-error");

const router = express.Router();

router.get("/restaurant", customerAuth, async (req, res, next) => {
    try {
        const parsed = z.object({
            city_id: z.string().trim().min(1).max(30),
        }).safeParse(req.query);

        if (!parsed.success) {
            throw new AppError(
                "city_id is required",
                400,
                "INVALID_CITY_ID"
            );
        }

        const { city_id } = parsed.data;

        const result = await pool.query(
            `SELECT
                id,
                name,
                image,
                starting_price,
                rating,
                delivery_time,
                cuisine
             FROM restaurants
             WHERE city_id = $1 AND is_active = TRUE
             ORDER BY name ASC`,
            [city_id]
        );

        const restaurants = result.rows.map((restaurant) => ({
            ...restaurant,
            starting_price: Number(restaurant.starting_price),
            rating: restaurant.rating === null
                ? null
                : Number(restaurant.rating),
        }));

        res.status(200).json({
            status: 200,
            message: "Success",
            data: restaurants,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;