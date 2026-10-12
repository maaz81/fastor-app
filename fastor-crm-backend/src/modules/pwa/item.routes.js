const express = require("express");
const { pool } = require("../../config/database");
const customerAuth = require("../../middleware/customer-auth");
const AppError = require("../../utils/app-error");

const router = express.Router();

router.get("/item/:id", customerAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const itemResult = await pool.query(
            `SELECT id, name, description, image, base_price
             FROM items
             WHERE id = $1 AND is_active = TRUE`,
            [id]
        );

        if (itemResult.rowCount === 0) {
            throw new AppError("Item not found", 404, "ITEM_NOT_FOUND");
        }

        const item = itemResult.rows[0];

        const portionResult = await pool.query(
            `SELECT id, label, price
             FROM item_portions
             WHERE item_id = $1
             ORDER BY price ASC`,
            [item.id]
        );

        res.status(200).json({
            status: 200,
            message: "Success",
            data: {
                id: item.id,
                name: item.name,
                description: item.description,
                image: item.image,
                base_price: Number(item.base_price),
                portions: portionResult.rows.map((portion) => ({
                    id: portion.id,
                    label: portion.label,
                    price: Number(portion.price),
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;