import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function OrderPage() {
  const { auth } = useAuth();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axiosInstance.get(`/orders/orders/${id}/details/`, {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, auth]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!order) return null;

  // Convert backend strings to numbers
  const totalPrice = Number(order.total_price) || 0;
  const gst = Number(order.gst) || 0;
  const deliveryCharge = Number(order.delivery_charge) || 0;
  const finalAmount = totalPrice; // total_price already includes GST + delivery charge from backend

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3} textAlign="center">
        Order #{order.id}
      </Typography>

      <Box mb={3}>
        <Typography variant="h6">Customer Details</Typography>
        <Typography>Name: {order.customer_name}</Typography>
        <Typography>Email: {order.customer_email}</Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="h6">Shop</Typography>
        <Typography>{order.shop_name}</Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="h6">Delivery Address</Typography>
        {order.delivery_address_details ? (
          <Typography>
            {order.delivery_address_details.address_line}, {order.delivery_address_details.city},{" "}
            {order.delivery_address_details.state}, {order.delivery_address_details.postal_code}
          </Typography>
        ) : (
          <Typography>N/A</Typography>
        )}
      </Box>

      <Box mb={3}>
        <Typography variant="h6">Items</Typography>
        {order.items.map((item) => (
          <Card key={item.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography>{item.shop_item_name}</Typography>
              <Typography>Quantity: {item.quantity}</Typography>
              <Typography>Price: ₹{Number(item.price).toFixed(2)}</Typography>
              <Typography>GST: ₹{Number(item.gst).toFixed(2)}</Typography>
              <Typography>
                Subtotal: ₹{(Number(item.price) * item.quantity).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box mt={3} p={2} border="1px solid #ccc" borderRadius={2}>
        <Typography variant="h6">Summary</Typography>
        <Typography>Total Price (including GST & Delivery): ₹{finalAmount.toFixed(2)}</Typography>
        <Typography>Breakdown - GST: ₹{gst.toFixed(2)}, Delivery: ₹{deliveryCharge.toFixed(2)}</Typography>
      </Box>

      <Box mt={3}>
        <Typography>Status: {order.status}</Typography>
        <Typography>Payment Status: {order.payment_status}</Typography>
        <Typography>Created At: {new Date(order.created_at).toLocaleString()}</Typography>
      </Box>
    </Box>
  );
}
