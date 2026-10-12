import axios from "axios";

/**
 * All requests use relative URLs so they go through the Vite dev proxy
 * → http://localhost:5000 in development.
 */
const BASE_URL = "";

/**
 * GET /v1/m/restaurant?city_id=<cityId>
 * Requires Authorization: Bearer <jwt>
 * Success 200: { status: 200, message: string, data: Array<{ id, name, image, starting_price, rating, delivery_time, cuisine }> }
 */
export async function fetchRestaurants({ token, cityId = 118 } = {}) {
    try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await axios.get(`${BASE_URL}/v1/m/restaurant`, {
            params: { city_id: cityId },
            headers,
            timeout: 15000,
        });
        return { ok: true, status: res.status, data: res.data };
    } catch (err) {
        return normalizeError(err);
    }
}

/**
 * GET /v1/m/item/:id
 * Requires Authorization: Bearer <jwt>
 * Success 200: { status: 200, message: string, data: { id, name, description, image, base_price, portions: Array<{ id, label, price }> } }
 */
export async function fetchItem({ token, itemId } = {}) {
    try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await axios.get(`${BASE_URL}/v1/m/item/${itemId}`, {
            headers,
            timeout: 15000,
        });
        return { ok: true, status: res.status, data: res.data };
    } catch (err) {
        return normalizeError(err);
    }
}

function normalizeError(err) {
    if (err.response) {
        const d = err.response.data;
        let message = "Failed to load data.";
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