import axios from "axios";
//  this the main service for making API calls to the backend. It is configured with the base URL of the backend API and automatically attaches the access token from localStorage to each request if it exists. This allows for seamless authentication when making requests to protected endpoints.
export const api = axios.create({
  baseURL:
    import.meta.env.BACKEND_API_URL ||
    "https://pro-crm-backend.onrender.com/api/crm",
  // "http://localhost:5000/api/crm",
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
