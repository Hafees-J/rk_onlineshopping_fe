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
  Container,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import { Add, Remove, Delete, ShoppingCart, ArrowForward, ShoppingBag } from "@mui/icons-material";
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
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', pb: 5 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #c5455aff 0%, #b92222ff 100%)',
          py: 4,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
            <ShoppingCart sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                Shopping Cart
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#667eea' }} />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{ borderRadius: 3, mb: 3 }}
          >
            {error}
          </Alert>
        ) : cartItems.length === 0 ? (
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <ShoppingBag sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Add items to your cart to get started
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/customer-dashboard')}
              sx={{
                backgroundColor: '#667eea',
                fontWeight: 600,
                textTransform: 'none',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#5568d3',
                },
              }}
            >
              Browse Menu
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {cartItems.map((item) => (
                  <Card
                    key={item.id}
                    sx={{
                      borderRadius: 3,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                      {item.display_image ? (
                        <CardMedia
                          component="img"
                          sx={{
                            width: { xs: '100%', sm: 180 },
                            height: { xs: 180, sm: 160 },
                            objectFit: 'cover',
                          }}
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
                            width: { xs: '100%', sm: 180 },
                            height: { xs: 180, sm: 160 },
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

                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: '#2c3e50',
                              mb: 1,
                            }}
                          >
                            {item.shop_item_name || "Unnamed Item"}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: '#d32f2f',
                              mb: 1,
                            }}
                          >
                            ₹{item.price.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </CardContent>

                        <Divider />

                        <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              sx={{
                                backgroundColor: '#f5f5f5',
                                '&:hover': {
                                  backgroundColor: '#e0e0e0',
                                },
                                '&:disabled': {
                                  backgroundColor: '#f5f5f5',
                                  opacity: 0.5,
                                },
                              }}
                            >
                              <Remove />
                            </IconButton>
                            <Typography
                              sx={{
                                minWidth: 40,
                                textAlign: 'center',
                                fontWeight: 700,
                                fontSize: '1.1rem',
                              }}
                            >
                              {item.quantity}
                            </Typography>
                            <IconButton
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              sx={{
                                backgroundColor: '#f5f5f5',
                                '&:hover': {
                                  backgroundColor: '#e0e0e0',
                                },
                              }}
                            >
                              <Add />
                            </IconButton>
                          </Box>
                          <IconButton
                            onClick={() => handleDelete(item.id)}
                            sx={{
                              color: '#d32f2f',
                              '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                              },
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </CardActions>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  position: 'sticky',
                  top: 90,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    color: '#2c3e50',
                  }}
                >
                  Order Summary
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      ₹{totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="text.secondary">Delivery Fee</Typography>
                    <Typography sx={{ fontWeight: 600, color: '#6e706eff' }}>
                      TBD
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#d32f2f',
                      }}
                    >
                      ₹{totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={handleCheckout}
                  sx={{
                    backgroundColor: '#667eea',
                    fontWeight: 700,
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      backgroundColor: '#5568d3',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Proceed to Checkout
                </Button>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Chip
                    icon={<ShoppingCart />}
                    label="Secure Checkout"
                    size="small"
                    sx={{
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}
