import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function HSNPage() {
  const { auth } = useAuth();
  const [hsnList, setHsnList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: null, hsncode: "", gst: "" });

  // Fetch HSNs
  useEffect(() => {
    fetchHSN();
  }, []);

  const fetchHSN = async () => {
    try {
      const res = await axiosInstance.get("/products/hsn/", {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      setHsnList(res.data);
    } catch (err) {
      console.error("Failed to fetch HSNs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (form.id) {
        await axiosInstance.put(`/products/hsn/${form.id}/`, form, {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
      } else {
        await axiosInstance.post("/products/hsn/", form, {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
      }
      setOpen(false);
      fetchHSN();
    } catch (err) {
      console.error("Failed to save HSN", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this HSN code?")) {
      try {
        await axiosInstance.delete(`/products/hsn/${id}/`, {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
        fetchHSN();
      } catch (err) {
        console.error("Failed to delete HSN", err);
      }
    }
  };

  const openAdd = () => {
    setForm({ id: null, hsncode: "", gst: "" });
    setOpen(true);
  };

  const openEdit = (hsn) => {
    setForm(hsn);
    setOpen(true);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 3 }}>
      <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5" fontWeight={700} color="primary">
              HSN Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openAdd}
              sx={{ borderRadius: 2 }}
            >
              Add HSN
            </Button>
          </Box>

          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>HSN Code</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>GST (%)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hsnList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No HSNs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    hsnList.map((hsn) => (
                      <TableRow key={hsn.id} hover>
                        <TableCell>{hsn.hsncode}</TableCell>
                        <TableCell>{hsn.gst}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => openEdit(hsn)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(hsn.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>
          {form.id ? "Edit HSN" : "Add New HSN"}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            label="HSN Code"
            value={form.hsncode}
            onChange={(e) => setForm({ ...form, hsncode: e.target.value })}
            fullWidth
          />
          <TextField
            label="GST (%)"
            type="number"
            value={form.gst}
            onChange={(e) => setForm({ ...form, gst: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {form.id ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
