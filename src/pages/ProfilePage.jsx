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
  Container,
  Paper,
  Avatar,
  Grid,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Edit,
  Save,
  LockReset,
  Person,
  LocationOn,
  Security,
  Delete,
  Home,
  Work,
  CheckCircle,
  Close,
  AddLocation,
} from "@mui/icons-material";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { auth } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
    } catch (err) {
      console.error("Error updating profile", err);
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.old_password || !passwords.new_password) {
      setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.patch("users/profile/change-password/", passwords, {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      setSnackbar({ open: true, message: 'Password changed successfully', severity: 'success' });
      setPasswords({ old_password: "", new_password: "" });
    } catch (err) {
      console.error("Error changing password", err);
      setSnackbar({ open: true, message: 'Failed to change password', severity: 'error' });
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
        setSnackbar({ open: true, message: 'Address updated successfully', severity: 'success' });
      } else {
        await axiosInstance.post("users/addresses/", form, {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
        setSnackbar({ open: true, message: 'Address added successfully', severity: 'success' });
      }
      setOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error("Error saving address", err);
      setSnackbar({ open: true, message: 'Failed to save address', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this address?")) {
      try {
        await axiosInstance.delete(`users/addresses/${id}/`, {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
        setSnackbar({ open: true, message: 'Address deleted successfully', severity: 'success' });
        fetchAddresses();
      } catch (err) {
        console.error("Error deleting address", err);
        setSnackbar({ open: true, message: 'Failed to delete address', severity: 'error' });
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosInstance.patch(
        `users/addresses/${id}/`,
        { is_default: true },
        { headers: { Authorization: `Bearer ${auth.access}` } }
      );
      setSnackbar({ open: true, message: 'Default address updated', severity: 'success' });
      fetchAddresses();
    } catch (err) {
      console.error("Error setting default address", err);
      setSnackbar({ open: true, message: 'Failed to update default address', severity: 'error' });
    }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#667eea' }} />
      </Box>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'white' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                backgroundColor: 'rgba(255,255,255,0.2)',
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {profile.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                My Profile
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage your account settings and preferences
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Paper
          sx={{
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            textColor="primary"
            indicatorColor="primary"
            variant="fullWidth"
            sx={{
              backgroundColor: '#fff',
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                py: 2.5,
              },
              '& .Mui-selected': {
                color: '#667eea',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#667eea',
                height: 3,
              },
            }}
          >
            <Tab icon={<Person />} iconPosition="start" label="Profile Info" />
            <Tab icon={<Security />} iconPosition="start" label="Change Password" />
            <Tab icon={<LocationOn />} iconPosition="start" label="Addresses" />
          </Tabs>
          <Divider />

        {tab === 0 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#2c3e50' }}>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Username"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Mobile Number"
                  value={profile.mobile_number}
                  onChange={(e) => setProfile({ ...profile, mobile_number: e.target.value })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleProfileSave}
                disabled={saving}
                sx={{
                  backgroundColor: '#667eea',
                  fontWeight: 700,
                  textTransform: 'none',
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    backgroundColor: '#5568d3',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0',
                    color: '#9e9e9e',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#2c3e50' }}>
              Change Password
            </Typography>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Choose a strong password to keep your account secure
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Old Password"
                  type="password"
                  value={passwords.old_password}
                  onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="New Password"
                  type="password"
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<LockReset />}
                onClick={handlePasswordChange}
                disabled={saving}
                sx={{
                  backgroundColor: '#667eea',
                  fontWeight: 700,
                  textTransform: 'none',
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    backgroundColor: '#5568d3',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0',
                    color: '#9e9e9e',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {saving ? "Changing..." : "Change Password"}
              </Button>
            </Box>
          </Box>
        )}

        {tab === 2 && (
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                My Addresses
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddLocation />}
                onClick={openAdd}
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
                Add Address
              </Button>
            </Box>

            {addresses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <LocationOn sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No addresses added yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add an address to proceed with checkout
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {addresses.map((addr) => (
                  <Grid item xs={12} md={6} key={addr.id}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: addr.is_default ? '#4caf50' : '#e0e0e0',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          borderColor: addr.is_default ? '#4caf50' : '#667eea',
                        },
                      }}
                    >
                      {addr.is_default && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Default"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            fontWeight: 700,
                          }}
                        />
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Home sx={{ color: '#667eea' }} />
                        <Typography sx={{ fontWeight: 700, color: '#2c3e50' }}>
                          {addr.address_type || 'Home'}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600, mb: 1, color: '#2c3e50' }}>
                        {addr.address_line}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {addr.city}, {addr.state} {addr.postal_code}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {addr.country}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openEdit(addr)}
                          startIcon={<Edit />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: '#667eea',
                            color: '#667eea',
                            '&:hover': {
                              borderColor: '#5568d3',
                              backgroundColor: 'rgba(102, 126, 234, 0.04)',
                            },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(addr.id)}
                          startIcon={<Delete />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Delete
                        </Button>
                        {!addr.is_default && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleSetDefault(addr.id)}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                              borderColor: '#4caf50',
                              color: '#4caf50',
                              '&:hover': {
                                borderColor: '#388e3c',
                                backgroundColor: 'rgba(76, 175, 80, 0.04)',
                              },
                            }}
                          >
                            Set Default
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0',
            py: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ color: '#667eea' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {form.id ? "Edit Address" : "Add New Address"}
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Address Line"
                value={form.address_line}
                onChange={(e) => setForm({ ...form, address_line: e.target.value })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Postal Code"
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Latitude"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Longitude"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.is_default}
                    onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                    sx={{
                      color: '#667eea',
                      '&.Mui-checked': {
                        color: '#667eea',
                      },
                    }}
                  />
                }
                label="Set as default address"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpen(false)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAddressSubmit}
                  sx={{
                    backgroundColor: '#667eea',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 4,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      backgroundColor: '#5568d3',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                    },
                  }}
                >
                  {form.id ? "Update Address" : "Add Address"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
