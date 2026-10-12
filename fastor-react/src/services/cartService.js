import axios from "axios";
import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

/**
 * POST /v1/pwa/user/cart
 * Requires Authorization: Bearer <jwt>
 * Body: { item_id: UUID, quantity: number(1-99), portion_id?: UUID | null }
 * Success 200: { status: 200, message: "Added to cart", data: { cart_id: UUID, item_count: number } }
 */
export async function addToCart({ token, item_id, quantity, portion_id = null } = {}) {
    try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const body = { item_id, quantity };
        if (portion_id) body.portion_id = portion_id;

        const res = await axios.post(
            `${BASE_URL}/v1/pwa/user/cart`,
            body,
            { headers, timeout: 15000 }
        );
        return { ok: true, status: res.status, data: res.data };
    } catch (err) {
        return normalizeError(err);
    }
}

function normalizeError(err) {
    if (err.response) {
        const d = err.response.data;
        let message = "Failed to add to cart.";
        if (typeof d === "string" && d.trim()) message = d;
        else if (d && typeof d === "object") {
            const keys = ["message", "error", "msg", "detail", "error_message"];
            for (const k of keys) {
                if (typeof d[k] === "string" && d[k].trim()) {
                    message = d[k];
                    break;
                }
            }
            if (d.data && typeof d.data.message === "string") message = d.data.message;
        }
        return { ok: false, status: err.response.status, message };
    }
    if (err.request) return { ok: false, status: 0, message: "Network error." };
    return { ok: false, status: -1, message: err.message || "Unexpected error." };
}
