import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  FormControlLabel,
  Switch,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  LocalOffer,
  ArrowBack,
  Search,
  Clear,
  CheckCircle,
  Cancel,
  Event,
  Percent,
  Inventory2,
} from "@mui/icons-material";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ShopItemOfferPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    shop_item: "",
    offer_pct: "",
    offer_starting_datetime: "",
    offer_ending_datetime: "",
    active: false,
  });

  const allowedRoles = ["shopadmin", "superadmin"];
  const hasPermission = auth && allowedRoles.includes(auth.role);

  useEffect(() => {
    if (!hasPermission) {
      navigate("/dashboard");
    } else {
      fetchShopItems();
      fetchOffers();
    }
  }, [hasPermission]);

  const fetchShopItems = async () => {
    try {
      const res = await axiosInstance.get("/products/shop-items/");
      const shopItemsWithFullUrl = res.data.map((shopItem) => ({
        ...shopItem,
        imageUrl: shopItem.image?.startsWith("http")
          ? shopItem.image
          : shopItem.display_image?.startsWith("http")
          ? shopItem.display_image
          : shopItem.image
          ? `${axiosInstance.defaults.baseURL}${shopItem.image}`
          : shopItem.display_image
          ? `${axiosInstance.defaults.baseURL}${shopItem.display_image}`
          : null,
      }));
      setShopItems(shopItemsWithFullUrl);
    } catch (err) {
      console.error("Failed to fetch shop items", err);
      setSnackbar({ open: true, message: 'Failed to load shop items', severity: 'error' });
    }
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/products/shop-item-offers/");
      setOffers(res.data);
      setFilteredOffers(res.data);
    } catch (err) {
      console.error("Failed to fetch offers", err);
      setSnackbar({ open: true, message: 'Failed to load offers', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredOffers(offers);
    } else {
      const filtered = offers.filter((offer) => {
        const shopItem = shopItems.find((si) => si.id === offer.shop_item);
        const itemName = shopItem?.item_name || shopItem?.item?.name || '';
        return itemName.toLowerCase().includes(query.toLowerCase());
      });
      setFilteredOffers(filtered);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredOffers(offers);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        shop_item: form.shop_item,
        offer_pct: form.offer_pct,
        offer_starting_datetime: form.offer_starting_datetime,
        offer_ending_datetime: form.offer_ending_datetime,
        active: form.active,
      };

      if (editing) {
        await axiosInstance.put(
          `/products/shop-item-offers/${editing.id}/`,
          payload
        );
        setSnackbar({ open: true, message: 'Offer updated successfully', severity: 'success' });
      } else {
        await axiosInstance.post("/products/shop-item-offers/", payload);
        setSnackbar({ open: true, message: 'Offer added successfully', severity: 'success' });
      }

      setOpen(false);
      setEditing(null);
      setForm({
        shop_item: "",
        offer_pct: "",
        offer_starting_datetime: "",
        offer_ending_datetime: "",
        active: false,
      });
      fetchOffers();
    } catch (err) {
      console.error("Failed to save offer", err);
      setSnackbar({ open: true, message: 'Failed to save offer', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/products/shop-item-offers/${id}/`);
      setSnackbar({ open: true, message: 'Offer deleted successfully', severity: 'success' });
      fetchOffers();
    } catch (err) {
      console.error("Failed to delete offer", err);
      setSnackbar({ open: true, message: 'Failed to delete offer', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setEditing(null);
    setForm({
      shop_item: "",
      offer_pct: "",
      offer_starting_datetime: "",
      offer_ending_datetime: "",
      active: false,
    });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditing(null);
    setForm({
      shop_item: "",
      offer_pct: "",
      offer_starting_datetime: "",
      offer_ending_datetime: "",
      active: false,
    });
  };

  const getShopItemDetails = (shopItemId) => {
    return shopItems.find((si) => si.id === shopItemId);
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!hasPermission) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You do not have permission to access this page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', pb: 5 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          py: 5,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
              <IconButton onClick={() => navigate('/shopadmin')} sx={{ color: 'white' }}>
                <ArrowBack />
              </IconButton>
              <LocalOffer sx={{ fontSize: 50 }} />
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  Shop Item Offers
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage promotional offers
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.5,
                px: 3,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              Add Offer
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <TextField
            fullWidth
            placeholder="Search offers by shop item name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: '#fcb69f', mr: 1 }} />
              ),
              endAdornment: searchQuery && (
                <IconButton
                  onClick={handleClearSearch}
                  size="small"
                  sx={{
                    color: '#757575',
                    '&:hover': {
                      backgroundColor: '#fff5f3',
                      color: '#fcb69f',
                    },
                  }}
                >
                  <Clear />
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#fcb69f',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#fcb69f',
                },
              },
            }}
          />
        </Paper>

        {loading && filteredOffers.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#fcb69f' }} />
          </Box>
        ) : filteredOffers.length === 0 && searchQuery ? (
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <Search sx={{ fontSize: 100, color: '#e0e0e0', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
              No Results Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              No offers match "{searchQuery}"
            </Typography>
            <Button
              variant="outlined"
              onClick={handleClearSearch}
              sx={{
                borderColor: '#fcb69f',
                color: '#fcb69f',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#e89f8a',
                  backgroundColor: '#fff5f3',
                },
              }}
            >
              Clear Search
            </Button>
          </Paper>
        ) : offers.length === 0 ? (
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <LocalOffer sx={{ fontSize: 100, color: '#e0e0e0', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
              No Offers Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first offer
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: '#fcb69f',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(252, 182, 159, 0.4)',
                '&:hover': {
                  backgroundColor: '#e89f8a',
                  boxShadow: '0 6px 20px rgba(252, 182, 159, 0.6)',
                },
              }}
            >
              Add Offer
            </Button>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" color="text.secondary">
                Showing {filteredOffers.length} of {offers.length} offers
              </Typography>
              {searchQuery && (
                <Chip
                  label={`Filtered by: "${searchQuery}"`}
                  onDelete={handleClearSearch}
                  sx={{
                    backgroundColor: '#fff5f3',
                    color: '#fcb69f',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
            <Grid container spacing={3}>
              {filteredOffers.map((offer) => {
                const shopItem = getShopItemDetails(offer.shop_item);
                const itemName = shopItem?.item_name || shopItem?.item?.name || 'Unknown Item';
                const itemImage = shopItem?.imageUrl;

                return (
                  <Grid item xs={12} sm={6} md={4} key={offer.id}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 180,
                          backgroundColor: '#fff5f3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={itemName}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Inventory2 sx={{ fontSize: 80, color: '#fcb69f', opacity: 0.3 }} />
                        )}
                        <Chip
                          icon={<Percent />}
                          label={`${offer.offer_pct}% OFF`}
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1rem',
                          }}
                        />
                      </Box>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', flex: 1 }}>
                            {itemName}
                          </Typography>
                          <Chip
                            icon={offer.active ? <CheckCircle /> : <Cancel />}
                            label={offer.active ? "Active" : "Inactive"}
                            size="small"
                            sx={{
                              backgroundColor: offer.active ? '#e8f5e9' : '#ffebee',
                              color: offer.active ? '#4caf50' : '#f44336',
                              fontWeight: 600,
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<Percent />}
                            label={`${offer.offer_pct}% Discount`}
                            size="small"
                            sx={{
                              backgroundColor: '#fff5f3',
                              color: '#fcb69f',
                              fontWeight: 600,
                            }}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Event sx={{ fontSize: 16, color: '#757575' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Start:
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(offer.offer_starting_datetime)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Event sx={{ fontSize: 16, color: '#757575' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              End:
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(offer.offer_ending_datetime)}
                            </Typography>
                          </Box>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          <IconButton
                            onClick={() => {
                              setEditing(offer);
                              setForm({
                                shop_item: offer.shop_item,
                                offer_pct: offer.offer_pct,
                                offer_starting_datetime: offer.offer_starting_datetime,
                                offer_ending_datetime: offer.offer_ending_datetime,
                                active: offer.active,
                              });
                              setOpen(true);
                            }}
                            sx={{
                              backgroundColor: '#fff5f3',
                              color: '#fcb69f',
                              '&:hover': {
                                backgroundColor: '#fcb69f',
                                color: 'white',
                              },
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(offer.id)}
                            sx={{
                              backgroundColor: '#ffebee',
                              color: '#f44336',
                              '&:hover': {
                                backgroundColor: '#f44336',
                                color: 'white',
                              },
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Container>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
          {editing ? 'Edit Offer' : 'Add New Offer'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={3}>
              <FormControl
                fullWidth
                required
                disabled={!!editing}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#fcb69f',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fcb69f',
                    },
                  },
                }}
              >
                <InputLabel>Shop Item</InputLabel>
                <Select
                  name="shop_item"
                  value={form.shop_item}
                  onChange={handleChange}
                  label="Shop Item"
                >
                  {shopItems.map((si) => (
                    <MenuItem key={si.id} value={si.id}>
                      {si.item_name || si.item?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {form.shop_item && getShopItemDetails(form.shop_item)?.imageUrl && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={getShopItemDetails(form.shop_item).imageUrl}
                    alt="Item Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                </Box>
              )}

              <TextField
                fullWidth
                label="Offer Percentage"
                name="offer_pct"
                type="number"
                value={form.offer_pct}
                onChange={handleChange}
                required
                inputProps={{ min: 0, max: 100 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#fcb69f',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fcb69f',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Start Date & Time"
                name="offer_starting_datetime"
                type="datetime-local"
                value={form.offer_starting_datetime}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#fcb69f',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fcb69f',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="End Date & Time"
                name="offer_ending_datetime"
                type="datetime-local"
                value={form.offer_ending_datetime}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#fcb69f',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fcb69f',
                    },
                  },
                }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={form.active}
                    onChange={handleChange}
                    name="active"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#fcb69f',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#fcb69f',
                      },
                    }}
                  />
                }
                label={form.active ? "Active Offer" : "Inactive Offer"}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                color: '#757575',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#fcb69f',
                fontWeight: 700,
                textTransform: 'none',
                px: 4,
                '&:hover': {
                  backgroundColor: '#e89f8a',
                },
              }}
            >
              {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
