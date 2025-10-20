import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  CircularProgress,
  Grid,
  Alert,
  TextField,
  CardMedia,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCart = async () => {
    if (!auth?.access) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get("/orders/cart/", {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      setCartItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load cart", err);
      setError("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [auth]);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await axiosInstance.patch(
        `/orders/cart/${itemId}/`,
        { quantity: newQty },
        { headers: { Authorization: `Bearer ${auth.access}` } }
      );
      fetchCart();
    } catch (err) {
      console.error("Failed to update quantity", err);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await axiosInstance.delete(`/orders/cart/${itemId}/`, {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      setCartItems(cartItems.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error("Failed to delete item", err);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        My Cart
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : cartItems.length === 0 ? (
        <Typography>No items in your cart</Typography>
      ) : (
        <>
          <Grid container spacing={2} mb={4}>
            {cartItems.map((item) => (
              <Grid item key={item.id} xs={12} sm={6} md={4}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  {/* ✅ IMAGE SECTION */}
                  {item.display_image ? (
                  <CardMedia
                    component="img"
                    height="160"
                    image={
                      item.display_image?.startsWith("http")
                        ? item.display_image
                        : `http://127.0.0.1:8000${item.display_image}`
                    }
                    alt={item.shop_item_name}
                  />
                  ) : (
                    <Box
                      sx={{
                        height: 180,
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                        fontSize: 14,
                      }}
                    >
                      No Image
                    </Box>
                  )}

                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.shop_item_name || "Unnamed Item"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{item.price.toFixed(2)} × {item.quantity} = ₹
                      {(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <IconButton
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      size="small"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, Number(e.target.value))
                      }
                      sx={{ width: 60 }}
                    />
                    <IconButton
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                    >
                      <Add />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
            }}
          >
            <Typography variant="h6">
              Total: ₹{totalAmount.toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
