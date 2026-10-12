const express = require("express");
const { z } = require("zod");
const { pool } = require("../../config/database");
const customerAuth = require("../../middleware/customer-auth");
const AppError = require("../../utils/app-error");

const router = express.Router();

const addToCartSchema = z.object({
    item_id: z.string().uuid(),
    quantity: z.coerce.number().int().min(1).max(99),
    portion_id: z.string().uuid().optional().nullable(),
});

router.post("/cart", customerAuth, async (req, res, next) => {
    const parsed = addToCartSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            status: 400,
            message: "Invalid item, quantity, or portion",
            error: "VALIDATION_ERROR",
        });
    }

    const { item_id, quantity, portion_id } = parsed.data;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const itemResult = await client.query(
            `SELECT id, base_price
             FROM items
             WHERE id = $1 AND is_active = TRUE`,
            [item_id]
        );

        if (itemResult.rowCount === 0) {
            throw new AppError("Item not found", 404, "ITEM_NOT_FOUND");
        }

        let portionPrice = 0;

        if (portion_id) {
            const portionResult = await client.query(
                `SELECT id, price
                 FROM item_portions
                 WHERE id = $1 AND item_id = $2`,
                [portion_id, item_id]
            );

            if (portionResult.rowCount === 0) {
                throw new AppError(
                    "Portion does not belong to this item",
                    400,
                    "INVALID_PORTION"
                );
            }

            portionPrice = Number(portionResult.rows[0].price);
        }

        const unitPrice =
            Number(itemResult.rows[0].base_price) + portionPrice;

        const cartResult = await client.query(
            `INSERT INTO carts (customer_id)
             VALUES ($1)
             ON CONFLICT (customer_id) WHERE status = 'ACTIVE'
             DO UPDATE SET updated_at = NOW()
             RETURNING id`,
            [req.customer.id]
        );

        const cartId = cartResult.rows[0].id;

        const existingResult = await client.query(
            `SELECT id, quantity
             FROM cart_items
             WHERE cart_id = $1
               AND item_id = $2
               AND portion_id IS NOT DISTINCT FROM $3::uuid
             LIMIT 1
             FOR UPDATE`,
            [cartId, item_id, portion_id || null]
        );

        if (existingResult.rowCount > 0) {
            const existing = existingResult.rows[0];
            const newQuantity = Number(existing.quantity) + quantity;

            if (newQuantity > 99) {
                throw new AppError(
                    "Maximum quantity per cart item is 99",
                    400,
                    "QUANTITY_LIMIT_EXCEEDED"
                );
            }

            await client.query(
                `UPDATE cart_items
                 SET quantity = $1, unit_price = $2, updated_at = NOW()
                 WHERE id = $3`,
                [newQuantity, unitPrice, existing.id]
            );
        } else {
            await client.query(
                `INSERT INTO cart_items
                    (cart_id, item_id, portion_id, quantity, unit_price)
                 VALUES ($1, $2, $3, $4, $5)`,
                [cartId, item_id, portion_id || null, quantity, unitPrice]
            );
        }

        const countResult = await client.query(
            `SELECT COALESCE(SUM(quantity), 0)::int AS item_count
             FROM cart_items
             WHERE cart_id = $1`,
            [cartId]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            status: 200,
            message: "Added to cart",
            data: {
                cart_id: cartId,
                item_count: countResult.rows[0].item_count,
            },
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => { });
        next(error);
    } finally {
        client.release();
    }
});

module.exports = router;