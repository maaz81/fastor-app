/**
 * Application API Base URL configuration.
 *
 * Priority:
 * 1. import.meta.env.VITE_API_URL (if specified in environment variables / Vercel dashboard)
 * 2. In production (e.g. Vercel deployment): https://fastor-app.onrender.com
 * 3. In local development: "" (empty string to use Vite dev proxy to localhost:5000)
 */
const rawUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = rawUrl
    ? rawUrl.replace(/\/+$/, "")
    : import.meta.env.DEV
    ? ""
    : "https://fastor-app.onrender.com";

export default API_BASE_URL;
