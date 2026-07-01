import axios from "axios";
import notify from "./toast";

/**
 * Centralized Axios Instance with Interceptors
 * ----------------------------------------------
 * Use `api` instead of raw `axios` for all backend API calls.
 * - Automatically attaches the Authorization header from localStorage.
 * - Response interceptor catches HTTP errors and shows user-friendly toasts.
 * - No component needs to duplicate error-handling logic.
 *
 * NOTE: TMDB API calls should still use raw `axios` with { withCredentials: false }
 *       since they are third-party and should not have auth headers.
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (no response at all)
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        notify.error("Request timed out. Please try again.");
      } else if (!navigator.onLine) {
        notify.error("No internet connection.");
      } else {
        notify.error("Unable to connect to the server. Please try again.");
      }
      return Promise.reject(error);
    }

    const status = error.response.status;
    const serverMessage = error.response.data?.message || error.response.data?.error;

    // Map HTTP status codes to user-friendly messages
    // Components can still handle specific cases by catching the error
    // The interceptor provides a safety net for unhandled errors
    switch (status) {
      case 401:
        // Don't auto-toast for 401 — login/auth components handle this specifically
        break;
      case 403:
        notify.error("You don't have permission to perform this action.");
        break;
      case 404:
        // Silent — many 404s are expected (e.g., checking if item exists)
        break;
      case 409:
        notify.warning(serverMessage || "This action has already been performed.");
        break;
      case 422:
        notify.warning(serverMessage || "Please check your input and try again.");
        break;
      case 500:
        notify.error("Internal server error. Please try again later.");
        break;
      default:
        if (status >= 500) {
          notify.error("Server error. Please try again later.");
        }
        break;
    }

    return Promise.reject(error);
  }
);

export default api;
