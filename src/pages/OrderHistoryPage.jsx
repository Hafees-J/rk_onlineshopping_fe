import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
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

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!orders.length) return <Typography>No orders found.</Typography>;

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3} textAlign="center">
        My Orders
      </Typography>

      {orders.map((order) => {
        const totalPrice = Number(order.total_price);
        const gst = Number(order.gst);
        const deliveryCharge = Number(order.delivery_charge);
        const finalAmount = totalPrice + deliveryCharge;

        return (
          <Card key={order.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Order #{order.id}</Typography>
              <Typography>Shop: {order.shop_name}</Typography>
              <Typography>Status: {order.status}</Typography>
              <Typography>Payment Status: {order.payment_status}</Typography>
              <Typography>
                Total: ₹{totalPrice.toFixed(2)} | GST: ₹{gst.toFixed(2)} | Delivery: ₹{deliveryCharge.toFixed(2)}
              </Typography>
              <Typography variant="subtitle2">
                Final Amount: ₹{finalAmount.toFixed(2)}
              </Typography>
              <Typography>
                Ordered At: {new Date(order.created_at).toLocaleString()}
              </Typography>
              <Box mt={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  View Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
