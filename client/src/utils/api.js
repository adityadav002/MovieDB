import axios from "axios";
import notify from "./toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
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

    switch (status) {
      case 401:
        notify.error("Session expired. Please login again.");
        window.dispatchEvent(new Event("unauthorized"));
        break;
      case 403:
        notify.error("You don't have permission to perform this action.");
        break;
      case 404:
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
