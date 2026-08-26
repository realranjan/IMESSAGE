import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? `${import.meta.env.VITE_API_URL}/api` : "/api",
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    if (window.Clerk && window.Clerk.session) {
      try {
        const token = await window.Clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error("Failed to get clerk token", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
