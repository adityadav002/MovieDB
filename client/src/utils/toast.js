import { toast, Slide } from "react-toastify";

/**
 * Centralized Notification Utility
 * ---------------------------------
 * Import `notify` anywhere in the app instead of using `toast` directly.
 * Every helper uses a `toastId` derived from the message to prevent
 * duplicate notifications when buttons are clicked rapidly.
 */

const defaultOptions = {
  position: "top-right",
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  transition: Slide,
};

/**
 * Generate a stable toastId from the message string.
 * This ensures the same message won't produce duplicate toasts.
 */
const getToastId = (message) => {
  if (typeof message !== "string") return undefined;
  return message.replace(/\s+/g, "-").toLowerCase().slice(0, 64);
};

const notify = {
  /**
   * ✅ Success notification (green accent)
   */
  success(message, options = {}) {
    const toastId = getToastId(message);
    if (toastId && toast.isActive(toastId)) return;
    toast.success(message, { ...defaultOptions, toastId, ...options });
  },

  /**
   * ❌ Error notification (red accent)
   */
  error(message, options = {}) {
    const toastId = getToastId(message);
    if (toastId && toast.isActive(toastId)) return;
    toast.error(message, { ...defaultOptions, toastId, ...options });
  },

  /**
   * ⚠️ Warning notification (orange accent)
   */
  warning(message, options = {}) {
    const toastId = getToastId(message);
    if (toastId && toast.isActive(toastId)) return;
    toast.warn(message, { ...defaultOptions, toastId, ...options });
  },

  /**
   * ℹ️ Info notification (blue accent)
   */
  info(message, options = {}) {
    const toastId = getToastId(message);
    if (toastId && toast.isActive(toastId)) return;
    toast.info(message, { ...defaultOptions, toastId, ...options });
  },

  /**
   * ⏳ Loading notification — returns the toastId so you can update/dismiss it later
   */
  loading(message, options = {}) {
    const toastId = getToastId(message);
    if (toastId && toast.isActive(toastId)) return toastId;
    return toast.loading(message, { ...defaultOptions, toastId, ...options });
  },

  /**
   * 🔄 Promise-based notification — shows loading → success/error automatically
   *
   * Usage:
   *   notify.promise(
   *     axios.post("/api/..."),
   *     {
   *       pending: "Loading...",
   *       success: "Done!",
   *       error: "Something went wrong.",
   *     }
   *   );
   */
  promise(promiseFn, messages, options = {}) {
    return toast.promise(promiseFn, messages, {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss(toastId) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  /**
   * Update an existing toast (useful for loading → success/error transitions)
   */
  update(toastId, options = {}) {
    toast.update(toastId, { ...defaultOptions, ...options });
  },
};

export default notify;
