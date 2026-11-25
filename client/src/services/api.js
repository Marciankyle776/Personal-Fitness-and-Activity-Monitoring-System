import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // sends the HTTP-only auth cookie
  timeout: 20000,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    let payload = error.response?.data;
    if (typeof Blob !== "undefined" && payload instanceof Blob) {
      try { payload = JSON.parse(await payload.text()); } catch { payload = null; }
    }

    error.status = error.response?.status;
    error.fieldErrors = payload?.errors || [];
    error.userMessage =
      payload?.message ||
      (error.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : !error.response
        ? "Cannot reach the server. Check your connection and make sure the API is running."
        : "Something went wrong. Please try again.");

    const url = error.config?.url || "";
    if (error.status === 401 && !url.startsWith("/auth/")) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
