import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
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

  const taxableTotal = Number(order.taxable_total) || 0;
  const gst = Number(order.gst) || 0;
  const deliveryCharge = Number(order.delivery_charge) || 0;
  const totalPrice = Number(order.total_price) || 0;

  return (
    <Box p={4} maxWidth="900px" mx="auto" bgcolor="#fafafa" borderRadius={2}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" mb={2} align="center" fontWeight="bold">
          🧾 Invoice
        </Typography>
        <Typography align="center" color="text.secondary" mb={3}>
          Order #{order.id} | {new Date(order.created_at).toLocaleString()}
        </Typography>

        {/* --- Customer & Shop Info --- */}
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Customer Details
            </Typography>
            <Typography>{order.customer_name}</Typography>
            <Typography>{order.customer_email}</Typography>
          </Box>

          <Box textAlign="right">
            <Typography variant="subtitle1" fontWeight="bold">
              Shop
            </Typography>
            <Typography>{order.shop_name}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* --- Delivery Address --- */}
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight="bold">
            Delivery Address
          </Typography>
          {order.delivery_address_details ? (
            <Typography>
              {order.delivery_address_details.address_line},{" "}
              {order.delivery_address_details.city},{" "}
              {order.delivery_address_details.state} -{" "}
              {order.delivery_address_details.postal_code}
            </Typography>
          ) : (
            <Typography color="text.secondary">N/A</Typography>
          )}
        </Box>

        {/* --- Items Table --- */}
        <Table size="small" sx={{ border: "1px solid #ddd", borderRadius: 2 }}>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>#</strong></TableCell>
              <TableCell><strong>Item</strong></TableCell>
              <TableCell align="right"><strong>Qty</strong></TableCell>
              <TableCell align="right"><strong>Taxable (₹)</strong></TableCell>
              <TableCell align="right"><strong>GST (₹)</strong></TableCell>
              <TableCell align="right"><strong>Total (₹)</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.shop_item_name}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">
                  {Number(item.taxable_amount).toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {Number(item.gst).toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {(Number(item.price) * item.quantity).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* --- Summary Section --- */}
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Box width="350px">
            <Divider sx={{ mb: 1 }} />
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Taxable Total:</Typography>
              <Typography>₹{taxableTotal.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>GST:</Typography>
              <Typography>₹{gst.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Delivery Charge:</Typography>
              <Typography>₹{deliveryCharge.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography fontWeight="bold">Total Payable:</Typography>
              <Typography fontWeight="bold">₹{totalPrice.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* --- Status --- */}
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Typography>Status: {order.status}</Typography>
          <Typography>Payment: {order.payment_status}</Typography>
        </Box>
      </Paper>
    </Box>
  );
}
