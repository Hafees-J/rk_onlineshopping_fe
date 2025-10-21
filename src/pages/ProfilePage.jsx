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
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Edit, Save, LockReset } from "@mui/icons-material";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { auth } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    mobile_number: "",
  });

  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
  });

  const [form, setForm] = useState({
    id: null,
    address_line: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    latitude: "",
    longitude: "",
    is_default: false,
  });

  useEffect(() => {
    if (!auth?.access) return;
    fetchProfile();
    fetchAddresses();
  }, [auth]);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("users/profile/", {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

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

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put("users/profile/", profile, {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      alert("Profile updated successfully ✅");
    } catch (err) {
      console.error("Error updating profile", err);
      alert("Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.old_password || !passwords.new_password) {
      alert("Please fill in all fields");
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.patch("users/profile/change-password/", passwords, {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      alert("Password changed successfully ✅");
      setPasswords({ old_password: "", new_password: "" });
    } catch (err) {
      console.error("Error changing password", err);
      alert("Failed to change password ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSubmit = async () => {
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
      is_default: false,
    });
    setOpen(true);
  };

  const openEdit = (addr) => {
    setForm(addr);
    setOpen(true);
  };

  if (loading) return <Box sx={{ textAlign: "center", mt: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h4" fontWeight={700} textAlign="center" mb={3}>
        My Profile
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab label="Profile Info" />
          <Tab label="Change Password" />
          <Tab label="Addresses" />
        </Tabs>
        <Divider />

        {/* PROFILE TAB */}
        {tab === 0 && (
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <TextField
              label="Username"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Mobile Number"
              value={profile.mobile_number}
              onChange={(e) => setProfile({ ...profile, mobile_number: e.target.value })}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleProfileSave}
              disabled={saving}
              sx={{ mt: 2 }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        )}

        {/* PASSWORD TAB */}
        {tab === 1 && (
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <TextField
              label="Old Password"
              type="password"
              value={passwords.old_password}
              onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="New Password"
              type="password"
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              color="secondary"
              startIcon={<LockReset />}
              onClick={handlePasswordChange}
              disabled={saving}
              sx={{ mt: 2 }}
            >
              {saving ? "Changing..." : "Change Password"}
            </Button>
          </CardContent>
        )}

        {/* ADDRESS TAB */}
        {tab === 2 && (
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
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
                    transition: "0.3s",
                    "&:hover": { boxShadow: 3 },
                  }}
                >
                  <Typography fontWeight={500}>{addr.address_line}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {addr.city}, {addr.state} {addr.postal_code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {addr.country}
                  </Typography>

                  <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openEdit(addr)}
                      startIcon={<Edit />}
                    >
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
                        ✅ Default
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))
            )}
          </CardContent>
        )}
      </Card>

      {/* ADDRESS DIALOG */}
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
          <Button variant="contained" onClick={handleAddressSubmit}>
            {form.id ? "Update" : "Add"}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
