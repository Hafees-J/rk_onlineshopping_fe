import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Container,
  Paper,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import {
  History,
  Visibility,
  ShoppingBag,
  LocalShipping,
  CheckCircle,
  AccessTime,
  Cancel,
  Store,
  Receipt,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function OrderHistoryPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axiosInstance.get("/orders/orders/", {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [auth]);

  const getStatusColor = (status) => {
    const statusMap = {
      'pending': { color: '#ff9800', bg: '#fff3e0' },
      'confirmed': { color: '#2196f3', bg: '#e3f2fd' },
      'preparing': { color: '#9c27b0', bg: '#f3e5f5' },
      'ready': { color: '#00bcd4', bg: '#e0f7fa' },
      'out_for_delivery': { color: '#ff5722', bg: '#fbe9e7' },
      'delivered': { color: '#4caf50', bg: '#e8f5e9' },
      'cancelled': { color: '#f44336', bg: '#ffebee' },
    };
    return statusMap[status] || { color: '#757575', bg: '#f5f5f5' };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle sx={{ fontSize: 18 }} />;
      case 'cancelled':
        return <Cancel sx={{ fontSize: 18 }} />;
      case 'out_for_delivery':
        return <LocalShipping sx={{ fontSize: 18 }} />;
      default:
        return <AccessTime sx={{ fontSize: 18 }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', pb: 5 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #c5455aff 0%, #b92222ff 100%)',
          py: 5,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
            <History sx={{ fontSize: 50 }} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                Order History
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Track and manage all your orders
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {!orders.length ? (
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <ShoppingBag sx={{ fontSize: 100, color: '#e0e0e0', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
              No Orders Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start shopping to see your orders here
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/customer')}
              sx={{
                backgroundColor: '#667eea',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  backgroundColor: '#5568d3',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                },
              }}
            >
              Start Shopping
            </Button>
          </Paper>
        ) : (
          <Box>
            {orders.map((order) => {
              const totalPrice = Number(order.total_price);
              const gst = Number(order.gst);
              const deliveryCharge = Number(order.delivery_charge);
              const finalAmount = totalPrice;
              const statusStyle = getStatusColor(order.status);

              return (
                <Paper
                  key={order.id}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      backgroundColor: '#f8f9fa',
                      borderBottom: '1px solid #e0e0e0',
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Receipt sx={{ color: '#667eea', fontSize: 24 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                            Order #{order.id}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Store sx={{ fontSize: 18, color: '#757575' }} />
                          <Typography variant="body2" color="text.secondary">
                            {order.shop_name}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Chip
                          icon={getStatusIcon(order.status)}
                          label={order.status?.replace(/_/g, ' ').toUpperCase()}
                          sx={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            height: 32,
                            mb: 1,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Subtotal
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#2c3e50' }}>
                          ₹{totalPrice.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          GST
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#2c3e50' }}>
                          ₹{gst.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Delivery
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: deliveryCharge > 0 ? '#2c3e50' : '#4caf50',
                          }}
                        >
                          {deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Total Amount
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            color: '#d32f2f',
                          }}
                        >
                          ₹{finalAmount.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Payment Status
                        </Typography>
                        <Chip
                          label={order.payment_status?.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: order.payment_status === 'paid' ? '#e8f5e9' : '#fff3e0',
                            color: order.payment_status === 'paid' ? '#2e7d32' : '#f57c00',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Button
                        variant="contained"
                        endIcon={<Visibility />}
                        onClick={() => navigate(`/order/${order.id}`)}
                        sx={{
                          backgroundColor: '#667eea',
                          fontWeight: 700,
                          textTransform: 'none',
                          py: 1,
                          px: 3,
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                          '&:hover': {
                            backgroundColor: '#5568d3',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}
