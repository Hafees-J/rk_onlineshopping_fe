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
import axios from "axios";

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  // Fetch cart count
  useEffect(() => {
    if (token) {
      axios
        .get("/api/orders/cart/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setCartCount(res.data?.items?.length || 0))
        .catch(() => setCartCount(0));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left - Logo / Title */}
        <Box display="flex" alignItems="center">
          <Home sx={{ mr: 1, color: "primary.main" }} />
          <Typography
            variant="h6"
            component={Link}
            to="/customer-dashboard"
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

          <Tooltip title="Cart">
            <IconButton
              component={Link}
              to="/cart"
              color="inherit"
              size="large"
            >
              <Badge
                badgeContent={cartCount}
                color="error"
                overlap="circular"
              >
                <ShoppingCart />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton color="error" onClick={handleLogout} size="large">
              <Logout />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
