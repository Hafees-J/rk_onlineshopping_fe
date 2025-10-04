import React from "react";
import { Typography, Button, Box, Stack } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  // Allowed roles for admin/shopadmin features
  const allowedRoles = ["superadmin", "shopadmin"];

  return (
    <Box textAlign="center" mt={10}>
      <Typography variant="h4" mb={2}>
        Welcome, {auth?.username || "User"}!
      </Typography>
      <Typography variant="subtitle1" mb={3}>
        Role: {auth?.role || "N/A"}
      </Typography>

      {allowedRoles.includes(auth?.role) ? (
        <Stack spacing={2} direction="column" alignItems="center" sx={{ mb: 3 }}>
          <Button variant="contained" onClick={() => navigate("/categories")}>
            Categories
          </Button>
          <Button variant="contained" onClick={() => navigate("/subcategories")}>
            Subcategories
          </Button>
          <Button variant="contained" onClick={() => navigate("/items")}>
            Items
          </Button>
          <Button variant="contained" onClick={() => navigate("/shopitems")}>
            Shop Items
          </Button>
          <Button variant="contained" onClick={() => navigate("/shopitemoffers")}>
            Shop Item Offers
          </Button>
        </Stack>
      ) : (
        <Typography variant="body1" sx={{ mb: 3 }}>
          You have limited access. Explore your dashboard features below.
        </Typography>
      )}

      <Button variant="contained" color="error" onClick={logout}>
        Logout
      </Button>
    </Box>
  );
}
