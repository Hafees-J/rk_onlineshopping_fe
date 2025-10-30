import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  CircularProgress,
  Button,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Collapse,
} from "@mui/material";
import { ExpandMore, ExpandLess, Refresh } from "@mui/icons-material";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function OrderManagementPage() {
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateType, setUpdateType] = useState(""); // "status" or "payment"
  const [newValue, setNewValue] = useState("");
  const [statusChoices, setStatusChoices] = useState({});
  const [paymentChoices, setPaymentChoices] = useState({});

  // 🔹 Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/orders/orders/", {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch Choices from Backend
  const fetchChoices = async () => {
    try {
      const res = await axiosInstance.get("/orders/orders/status-choices/", {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      setStatusChoices(res.data.order_status_choices || {});
      setPaymentChoices(res.data.payment_status_choices || {});
    } catch (err) {
      console.error("Failed to fetch choices", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchChoices();
  }, []);

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleOpenDialog = (order, type) => {
    setSelectedOrder(order);
    setUpdateType(type);
    setNewValue("");
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;

    const endpoint =
      updateType === "status"
        ? `/orders/orders/${selectedOrder.id}/update-status/`
        : `/orders/orders/${selectedOrder.id}/update-payment-status/`;

    try {
      await axiosInstance.patch(
        endpoint,
        { [updateType === "status" ? "status" : "payment_status"]: newValue },
        {
          headers: { Authorization: `Bearer ${auth.access}` },
        }
      );
      setOpenDialog(false);
      fetchOrders();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, p: 3 }}>
      <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5" fontWeight={700} color="primary">
              Order Management
            </Typography>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchOrders}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Shop</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Payment Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <React.Fragment key={order.id}>
                        <TableRow hover>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell>{order.shop_name}</TableCell>
                          <TableCell>₹{order.total_price}</TableCell>
                          <TableCell>{order.status}</TableCell>
                          <TableCell>{order.payment_status}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ mr: 1 }}
                              onClick={() =>
                                handleOpenDialog(order, "status")
                              }
                            >
                              Update Status
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="secondary"
                              onClick={() =>
                                handleOpenDialog(order, "payment")
                              }
                            >
                              Update Payment
                            </Button>
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => toggleExpand(order.id)}>
                              {expandedRow === order.id ? (
                                <ExpandLess />
                              ) : (
                                <ExpandMore />
                              )}
                            </IconButton>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell
                            style={{
                              paddingBottom: 0,
                              paddingTop: 0,
                            }}
                            colSpan={7}
                          >
                            <Collapse
                              in={expandedRow === order.id}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box margin={2}>
                                <Typography
                                  variant="subtitle1"
                                  gutterBottom
                                  fontWeight={600}
                                >
                                  Items
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Item</TableCell>
                                      <TableCell>Qty</TableCell>
                                      <TableCell>Price</TableCell>
                                      <TableCell>Subtotal</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {order.items_details?.map((item) => (
                                      <TableRow key={item.id}>
                                        <TableCell>
                                          {item.shop_item_name}
                                        </TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>₹{item.price}</TableCell>
                                        <TableCell>₹{item.subtotal}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* 🔹 Dialog for Updating Status / Payment */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {updateType === "status"
            ? "Update Order Status"
            : "Update Payment Status"}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>
              {updateType === "status" ? "Order Status" : "Payment Status"}
            </InputLabel>
            <Select
              value={newValue}
              label={
                updateType === "status" ? "Order Status" : "Payment Status"
              }
              onChange={(e) => setNewValue(e.target.value)}
            >
              {updateType === "status"
                ? Object.entries(statusChoices).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))
                : Object.entries(paymentChoices).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={!newValue}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
