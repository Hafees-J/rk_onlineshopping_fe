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
  Button,
  Container,
  Avatar,
  useScrollTrigger,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slide
} from "@mui/material";
import {
  ShoppingCart,
  AccountCircle,
  Logout,
  Home,
  Dashboard,
} from "@mui/icons-material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";
import arabiancafelogo from "../assets/arabiancafelogo.png"

export default function Header() {
  const { auth, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

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

  const dashboardLink =
    auth?.access
      ? auth.role === "customer"
        ? "/customer-dashboard"
        : "/shopadmin-dashboard"
      : "/customer-dashboard";

  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const handleLogoutClick = () => setOpenLogoutDialog(true);
  const handleCloseDialog = () => setOpenLogoutDialog(false);

  return (
    <AppBar
      position="sticky"
      elevation={trigger ? 4 : 0}
      sx={{
        backgroundColor: trigger ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1,
          }}
        >
          <Box
            component={Link}
            to={dashboardLink}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              textDecoration: "none",
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <Avatar
              src={arabiancafelogo}
              alt="Rajakumari Logo"
              sx={{
                width: 48,
                height: 48,
                border: '2px solid',
                borderColor: 'primary.main',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Typography
              variant="h5"
              sx={{
                color: '#d32f2f',
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'lowercase',
                fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              }}
            >
              rajakumari
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={3}>
            <Button
              component={Link}
              to={dashboardLink}
              startIcon={<Dashboard />}
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                px: 2,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Dashboard
            </Button>

            {auth?.access && (
            <Button
              component={Link}
              to="/profile"
              startIcon={<AccountCircle />}
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                px: 2,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Profile
            </Button>
            )}

            {auth?.role === "customer" && (
                <Button
                  component={Link}
                  to="/cart"
                  startIcon={
                    <Badge
                      badgeContent={cartCount}
                      color="error"
                      overlap="circular"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          minWidth: 20,
                          height: 20,
                        },
                      }}
                    >
                      <ShoppingCart sx={{ fontSize: 24 }} />
                    </Badge>
                  }
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Cart
                </Button>
            )}

            {auth?.access && (
              <Button
              component={Link}
              to="/order-history"
              startIcon={<ReceiptLongIcon />}
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                px: 2,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Order History
            </Button>
            )}

          {!auth?.access && (
            <Button
              component={Link}
              to="/login"
              startIcon={<AccountCircle />}
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                px: 2,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Sign In
            </Button>
          )}

          {auth?.access && (
            <>
              <Tooltip title="Logout" arrow>
                <IconButton
                  onClick={handleLogoutClick}
                  sx={{
                    color: '#d32f2f',
                    ml: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Logout sx={{ fontSize: 28 }} />
                </IconButton>
              </Tooltip>

              <Dialog open={openLogoutDialog} onClose={handleCloseDialog}>
                <DialogTitle>Confirm Logout</DialogTitle>

                <DialogContent>
                  <Typography>
                    Are you sure you want to logout?
                  </Typography>
                </DialogContent>

                <DialogActions>
                  <Button onClick={handleCloseDialog}>
                    Cancel
                  </Button>

                  <Button
                    onClick={() => {
                      logout();
                      handleCloseDialog();
                    }}
                    color="error"
                    variant="contained"
                  >
                    Logout
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
