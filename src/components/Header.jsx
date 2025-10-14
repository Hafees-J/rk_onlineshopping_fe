import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Tooltip,
} from "@mui/material";
import { ShoppingCart, AccountCircle, Logout, Home } from "@mui/icons-material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { auth, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  // Fetch cart count (only for customers)
  useEffect(() => {
    if (auth?.access && auth.role === "customer") {
      axiosInstance
        .get("orders/cart/", {
          headers: { Authorization: `Bearer ${auth.access}` },
        })
        .then((res) => {
          console.log("Cart API response:", res.data);

          setCartCount(Array.isArray(res.data) ? res.data.length : 0);
        })
        .catch((err) => {
          console.error("Failed to load cart:", err);
          setCartCount(0);
        });
    }
  }, [auth]);

  // Logo redirect based on role
  const dashboardLink =
    auth?.role === "customer" ? "/customer-dashboard" : "/shopadmin-dashboard";

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left - Logo / Title */}
        <Box display="flex" alignItems="center">
          <Home sx={{ mr: 1, color: "primary.main" }} />
          <Typography
            variant="h6"
            component={Link}
            to={dashboardLink}
            sx={{
              textDecoration: "none",
              color: "text.primary",
              fontWeight: 600,
            }}
          >
            RK Online Shop
          </Typography>
        </Box>

        {/* Right - Profile / Cart / Logout */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Profile */}
          <Tooltip title="Profile">
            <IconButton
              component={Link}
              to="/profile"
              color="inherit"
              size="large"
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>

          {/* Cart only for customers */}
          {auth?.role === "customer" && (
            <Tooltip title="Cart">
              <IconButton
                component={Link}
                to="/cart"
                color="inherit"
                size="large"
              >
                <Badge badgeContent={cartCount} color="error" overlap="circular">
                  <ShoppingCart />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* Order History */}
          <Tooltip title="Order History">
            <IconButton
              component={Link}
              to="/order-history"
              color="inherit"
              size="large"
            >
              <ReceiptLongIcon />
            </IconButton>
          </Tooltip>

          {/* Logout */}
          <Tooltip title="Logout">
            <IconButton color="error" onClick={logout} size="large">
              <Logout />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
