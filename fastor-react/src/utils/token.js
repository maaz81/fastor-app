/**
 * Token storage utilities.
 *
 * Backend login response shape (POST /v1/pwa/user/login):
 *   { status: 200, data: { token: "<jwt>", user: { id, phone, dial_code } } }
 *
 * We persist:
 *   - "fastor_token"  → raw JWT string (persists across tabs/refreshes)
 *   - "fastor_user"   → serialised user object
 */

const TOKEN_KEY = "fastor_token";
const USER_KEY = "fastor_user";

/**
 * Persist the JWT and user from the login response.
 * @param {{ data: { token: string, user: object } }} loginResponseData
 */
export function storeAuthData(loginResponseData) {
    try {
        const token = loginResponseData?.data?.token;
        const user = loginResponseData?.data?.user;
        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (_) { /* storage unavailable */ }
}

/**
 * Returns the stored JWT string, or null if not found.
 */
export function getStoredToken() {
    try {
        return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
        return null;
    }
}

/**
 * Returns the stored user object, or null if not found.
 */
export function getStoredUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Clears the stored token and user (logout).
 */
export function clearAuthData() {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    } catch (_) { /* ignore */ }
}