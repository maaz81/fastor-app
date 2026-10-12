import axios from "axios";
import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

/**
 * POST /v1/pwa/user/register
 * Body: { phone: "10-digit", dial_code: "+91" }
 * Success 200: { status: 200, message: string, data: { phone } }
 */
export async function registerUser({ phone, dial_code = "+91" }) {
    try {
        const res = await axios.post(
            `${BASE_URL}/v1/pwa/user/register`,
            { phone, dial_code },
            { headers: { "Content-Type": "application/json" }, timeout: 15000 }
        );
        return { ok: true, status: res.status, data: res.data };
    } catch (err) {
        return normalizeError(err);
    }
}

/**
 * POST /v1/pwa/user/login
 * Body: { phone, otp, dial_code }
 * Success 200: { status: 200, message: string, data: { token, user: { id, phone, dial_code } } }
 */
export async function loginUser({ phone, otp, dial_code = "+91" }) {
    try {
        const res = await axios.post(
            `${BASE_URL}/v1/pwa/user/login`,
            { phone, otp, dial_code },
            { headers: { "Content-Type": "application/json" }, timeout: 15000 }
        );
        return { ok: true, status: res.status, data: res.data };
    } catch (err) {
        return normalizeError(err);
    }
}

/**
 * Defensive error normalizer.
 */
function normalizeError(err) {
    if (err.response) {
        const d = err.response.data;
        let message = "Something went wrong. Please try again.";
        if (typeof d === "string" && d.trim()) message = d;
        else if (d && typeof d === "object") {
            const candidates = ["message", "error", "msg", "detail", "error_message"];
            for (const k of candidates) {
                if (typeof d[k] === "string" && d[k].trim()) {
                    message = d[k];
                    break;
                }
            }
            // Nested: data.message
            if (d.data && typeof d.data.message === "string") message = d.data.message;
        }
        return { ok: false, status: err.response.status, message };
    }
    if (err.request) {
        return { ok: false, status: 0, message: "Network error. Check your connection." };
    }
    return { ok: false, status: -1, message: err.message || "Unexpected error." };
}