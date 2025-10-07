import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { auth } = useAuth(); // ✅ use your global auth context
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    address_line: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    latitude: "",
    longitude: "",
    is_default: false

  });

  useEffect(() => {
    if (!auth?.access) return;
    fetchAddresses();
  }, [auth]);

  const fetchAddresses = async () => {
    try {
      const res = await axiosInstance.get("users/addresses/", {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      setAddresses(res.data);
    } catch (err) {
      console.error("Error fetching addresses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (form.id) {
        await axiosInstance.put(`users/addresses/${form.id}/`, form, {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
      } else {
        await axiosInstance.post("users/addresses/", form, {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
      }
      setOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error("Error saving address", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this address?")) {
      await axiosInstance.delete(`users/addresses/${id}/`, {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      fetchAddresses();
    }
  };

  const handleSetDefault = async (id) => {
    await axiosInstance.patch(
      `users/addresses/${id}/`,
      { is_default: true },
      { headers: { Authorization: `Bearer ${auth.access}` } }
    );
    fetchAddresses();
  };

  const openAdd = () => {
    setForm({
      id: null,
      address_line: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      latitude: "",
      longitude: "",
      is_default: false

    });
    setOpen(true);
  };

  const openEdit = (addr) => {
    setForm(addr);
    setOpen(true);
  };

  if (loading) return <Typography sx={{ p: 3 }}>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
      {/* User Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={600}>
            Profile
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Username:</strong> {auth?.username}
          </Typography>
          <Typography variant="body1">
            <strong>Role:</strong> {auth?.role}
          </Typography>
        </CardContent>
      </Card>

      {/* Address Management */}
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5" fontWeight={600}>
              My Addresses
            </Typography>
            <Button variant="contained" onClick={openAdd}>
              + Add Address
            </Button>
          </Box>

          {addresses.length === 0 ? (
            <Typography color="text.secondary">No addresses added yet.</Typography>
          ) : (
            addresses.map((addr) => (
              <Box
                key={addr.id}
                sx={{
                  border: "1px solid",
                  borderColor: addr.is_default ? "success.main" : "grey.300",
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                }}
              >
                <Typography>{addr.address_line}</Typography>
                <Typography>
                  {addr.city}, {addr.state} {addr.postal_code}
                </Typography>
                <Typography>{addr.country}</Typography>
                <Typography>{addr.latitude},{addr.longitude}</Typography>

                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => openEdit(addr)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => handleDelete(addr.id)}
                  >
                    Delete
                  </Button>
                  {!addr.is_default && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => handleSetDefault(addr.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  {addr.is_default && (
                    <Typography color="success.main" fontWeight={500}>
                      Default
                    </Typography>
                  )}
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? "Edit Address" : "Add New Address"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Address Line"
            value={form.address_line}
            onChange={(e) => setForm({ ...form, address_line: e.target.value })}
            fullWidth
          />
          <TextField
            label="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            fullWidth
          />
          <TextField
            label="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            fullWidth
          />
          <TextField
            label="Postal Code"
            value={form.postal_code}
            onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
            fullWidth
          />
          <TextField
            label="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            fullWidth
          />
          <TextField
            label="Latitude"
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            fullWidth
          />
          <TextField
            label="Longitude"
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              />
            }
            label="Set as default"
          />
          <Button variant="contained" onClick={handleSubmit}>
            {form.id ? "Update" : "Add"}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
