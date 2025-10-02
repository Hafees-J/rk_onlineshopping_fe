import axios from "axios";

const baseURL = "http://localhost:8000/api/";

const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// Attach access token before each request
axiosInstance.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access_token");
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh token on 401 responses
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refresh_token")
    ) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem("refresh_token");
        const res = await axios.post(`${baseURL}users/refresh/`, { refresh });
        const newAccess = res.data.access;
        localStorage.setItem("access_token", newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Refresh token invalid", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
