import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.BACKEND_API_URL ||
    "https://pro-crm-backend.onrender.com/api/crm",
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
