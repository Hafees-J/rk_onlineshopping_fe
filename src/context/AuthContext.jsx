import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    const shop_id = localStorage.getItem("shop_id");

    return access && refresh
      ? { access, refresh, role, username, shop_id }
      : null;
  });

  // Auto-refresh access token every 4 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axiosInstance.post("users/refresh/", { refresh });
          localStorage.setItem("access_token", res.data.access);
          setAuth((prev) => ({ ...prev, access: res.data.access }));
        } catch (err) {
          console.error("Token refresh failed", err);
          logout();
        }
      }
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axiosInstance.post("users/login/", { username, password });
      const { access, refresh, role, username: userName } = res.data;

      let shop_id = null;

      if (role === "shopadmin") {
        try {
          const shopRes = await axiosInstance.get("shops/my-shop/", {
            headers: { Authorization: `Bearer ${access}` },
          });
          shop_id = shopRes.data?.shop_id || null;
          localStorage.setItem("shop_id", shop_id);
        } catch (err) {
          console.error("Failed to fetch shop info", err);
        }
      }

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("role", role);
      localStorage.setItem("username", userName);

      setAuth({ access, refresh, role, username: userName, shop_id });
    } catch (err) {
      console.error("Login failed", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("shop_id");
    setAuth(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
