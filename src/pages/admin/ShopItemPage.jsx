import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  IconButton,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Store,
  ArrowBack,
  Search,
  Clear,
  CheckCircle,
  Cancel,
  LocalOffer,
  Schedule,
  Inventory2,
  AttachMoney,
} from "@mui/icons-material";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ShopItemPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [filteredShopItems, setFilteredShopItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTill, setAvailableTill] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [error, setError] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchCategories();
    fetchShopItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/products/categories/", {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      setSnackbar({ open: true, message: 'Failed to load categories', severity: 'error' });
    }
  };

  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) return setSubcategories([]);
    try {
      const res = await axiosInstance.get(
        `/products/subcategories-per-category/${categoryId}/`,
        { headers: { Authorization: `Bearer ${auth?.access}` } }
      );
      setSubcategories(res.data);
    } catch (err) {
      console.error("Failed to fetch subcategories", err);
      setSnackbar({ open: true, message: 'Failed to load subcategories', severity: 'error' });
    }
  };

  const fetchItems = async (subcategoryId) => {
    if (!subcategoryId) return setItems([]);
    try {
      const res = await axiosInstance.get(
        `/products/items-per-subcategory/${subcategoryId}/`,
        { headers: { Authorization: `Bearer ${auth?.access}` } }
      );
      const itemsWithFullUrl = res.data.map((item) => ({
        ...item,
        image: item.image && !item.image.startsWith("http")
          ? `${axiosInstance.defaults.baseURL}${item.image}`
          : item.image,
      }));
      setItems(itemsWithFullUrl);
    } catch (err) {
      console.error("Failed to fetch items", err);
      setSnackbar({ open: true, message: 'Failed to load items', severity: 'error' });
    }
  };

  const fetchShopItems = async () => {
    if (!auth?.shop_id) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/products/shop-items/?shop=${auth.shop_id}`,
        { headers: { Authorization: `Bearer ${auth?.access}` } }
      );
      const shopItemsWithFullUrl = (res.data || []).map((shopItem) => ({
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
      setFilteredShopItems(shopItemsWithFullUrl);
    } catch (err) {
      console.error("Failed to fetch shop items", err);
      setShopItems([]);
      setFilteredShopItems([]);
      setSnackbar({ open: true, message: 'Failed to load shop items', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredShopItems(shopItems);
    } else {
      const filtered = shopItems.filter((shopItem) => {
        const itemName = shopItem.item_name || shopItem.item?.name || '';
        return itemName.toLowerCase().includes(query.toLowerCase());
      });
      setFilteredShopItems(filtered);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredShopItems(shopItems);
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedSubcategory("");
    setSelectedItem("");
    setSubcategories([]);
    setItems([]);
    fetchSubcategories(categoryId);
  };

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value;
    setSelectedSubcategory(subcategoryId);
    setSelectedItem("");
    setItems([]);
    fetchItems(subcategoryId);
  };

  const resetForm = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedItem("");
    setTotalAmount("");
    setAvailableQuantity("");
    setAvailableFrom("");
    setAvailableTill("");
    setIsAvailable(true);
    setEditingItemId(null);
    setOpenDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !totalAmount || !availableQuantity) {
      setError("Please fill all required fields.");
      return;
    }

    if (!auth?.shop_id) {
      setError("Shop ID missing. Cannot save item.");
      return;
    }

    const payload = {
      shop: auth.shop_id,
      item: selectedItem,
      total_amount: totalAmount,
      available_quantity: availableQuantity,
      available_from: availableFrom || null,
      available_till: availableTill || null,
      is_available: isAvailable,
    };

    setLoading(true);
    try {
      if (editingItemId) {
        await axiosInstance.put(`/products/shop-items/${editingItemId}/`, payload, {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        setSnackbar({ open: true, message: 'Shop item updated successfully', severity: 'success' });
      } else {
        await axiosInstance.post("/products/shop-items/", payload, {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
        setSnackbar({ open: true, message: 'Shop item added successfully', severity: 'success' });
      }

      resetForm();
      fetchShopItems();
      setError("");
    } catch (err) {
      console.error("Failed to save shop item", err.response?.data || err);
      setError(err.response?.data || "Failed to save shop item");
      setSnackbar({ open: true, message: 'Failed to save shop item', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItemId(item.id);
    setSelectedItem(item.item?.id || item.item);
    setTotalAmount(item.total_amount);
    setAvailableQuantity(item.available_quantity);
    setAvailableFrom(item.available_from || "");
    setAvailableTill(item.available_till || "");
    setIsAvailable(item.is_available);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/products/shop-items/${id}/`, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      setSnackbar({ open: true, message: 'Shop item deleted successfully', severity: 'success' });
      fetchShopItems();
    } catch (err) {
      console.error("Failed to delete shop item", err);
      setSnackbar({ open: true, message: 'Failed to delete shop item', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    resetForm();
  };

  const getSelectedItemDetails = () => {
    return items.find((item) => item.id === selectedItem);
  };

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', pb: 5 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          py: 5,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
              <IconButton onClick={() => navigate('/shopadmin-dashboard')} sx={{ color: 'white' }}>
                <ArrowBack />
              </IconButton>
              <Store sx={{ fontSize: 50 }} />
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  Shop Items
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage items for your shop
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
              Add Shop Item
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
            placeholder="Search shop items by name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: '#fa709a', mr: 1 }} />
              ),
              endAdornment: searchQuery && (
                <IconButton
                  onClick={handleClearSearch}
                  size="small"
                  sx={{
                    color: '#757575',
                    '&:hover': {
                      backgroundColor: '#fff5f8',
                      color: '#fa709a',
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
                  borderColor: '#fa709a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#fa709a',
                },
              },
            }}
          />
        </Paper>

        {loading && filteredShopItems.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#fa709a' }} />
          </Box>
        ) : filteredShopItems.length === 0 && searchQuery ? (
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
              No shop items match "{searchQuery}"
            </Typography>
            <Button
              variant="outlined"
              onClick={handleClearSearch}
              sx={{
                borderColor: '#fa709a',
                color: '#fa709a',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#e8608a',
                  backgroundColor: '#fff5f8',
                },
              }}
            >
              Clear Search
            </Button>
          </Paper>
        ) : shopItems.length === 0 ? (
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <Store sx={{ fontSize: 100, color: '#e0e0e0', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
              No Shop Items Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first shop item
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: '#fa709a',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(250, 112, 154, 0.4)',
                '&:hover': {
                  backgroundColor: '#e8608a',
                  boxShadow: '0 6px 20px rgba(250, 112, 154, 0.6)',
                },
              }}
            >
              Add Shop Item
            </Button>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" color="text.secondary">
                Showing {filteredShopItems.length} of {shopItems.length} shop items
              </Typography>
              {searchQuery && (
                <Chip
                  label={`Filtered by: "${searchQuery}"`}
                  onDelete={handleClearSearch}
                  sx={{
                    backgroundColor: '#fff5f8',
                    color: '#fa709a',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
            <Grid container spacing={3}>
              {filteredShopItems.map((shopItem) => (
                <Grid item xs={12} sm={6} md={4} key={shopItem.id}>
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
                        backgroundColor: '#fff5f8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {shopItem.imageUrl ? (
                        <img
                          src={shopItem.imageUrl}
                          alt={shopItem.item_name || shopItem.item?.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Inventory2 sx={{ fontSize: 80, color: '#fa709a', opacity: 0.3 }} />
                      )}
                      {shopItem.discount_amount && (
                        <Chip
                          icon={<LocalOffer />}
                          label="Offer"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', flex: 1 }}>
                          {shopItem.item_name || shopItem.item?.name}
                        </Typography>
                        <Chip
                          icon={shopItem.is_available ? <CheckCircle /> : <Cancel />}
                          label={shopItem.is_available ? "Available" : "Unavailable"}
                          size="small"
                          sx={{
                            backgroundColor: shopItem.is_available ? '#e8f5e9' : '#ffebee',
                            color: shopItem.is_available ? '#4caf50' : '#f44336',
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<AttachMoney />}
                          label={`₹${shopItem.total_amount}`}
                          size="small"
                          sx={{
                            backgroundColor: '#fff5f8',
                            color: '#fa709a',
                            fontWeight: 600,
                          }}
                        />
                        {shopItem.discount_amount && (
                          <Chip
                            icon={<LocalOffer />}
                            label={`₹${shopItem.discount_amount}`}
                            size="small"
                            sx={{
                              backgroundColor: '#e8f5e9',
                              color: '#4caf50',
                              fontWeight: 600,
                            }}
                          />
                        )}
                        <Chip
                          icon={<Inventory2 />}
                          label={`Qty: ${shopItem.available_quantity}`}
                          size="small"
                          sx={{
                            backgroundColor: '#e3f2fd',
                            color: '#2196f3',
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      {(shopItem.available_from || shopItem.available_till) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Schedule sx={{ fontSize: 16, color: '#757575' }} />
                          <Typography variant="caption" color="text.secondary">
                            {shopItem.available_from || '--:--'} to {shopItem.available_till || '--:--'}
                          </Typography>
                        </Box>
                      )}

                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => handleEdit(shopItem)}
                          sx={{
                            backgroundColor: '#fff5f8',
                            color: '#fa709a',
                            '&:hover': {
                              backgroundColor: '#fa709a',
                              color: 'white',
                            },
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(shopItem.id)}
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
              ))}
            </Grid>
          </>
        )}
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
          {editingItemId ? 'Edit Shop Item' : 'Add New Shop Item'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {typeof error === "string" ? error : JSON.stringify(error)}
              </Alert>
            )}
            <Stack spacing={3}>
              <FormControl
                fullWidth
                required
                disabled={!!editingItemId}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#fa709a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fa709a',
                    },
                  },
                }}
              >
                <InputLabel>Category</InputLabel>
                <Select value={selectedCategory} onChange={handleCategoryChange} label="Category">
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                required
                disabled={!subcategories.length || !!editingItemId}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#fa709a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fa709a',
                    },
                  },
                }}
              >
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={selectedSubcategory}
                  onChange={handleSubcategoryChange}
                  label="Subcategory"
                >
                  {subcategories.map((sub) => (
                    <MenuItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                required
                disabled={!items.length || !!editingItemId}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#fa709a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fa709a',
                    },
                  },
                }}
              >
                <InputLabel>Item</InputLabel>
                <Select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  label="Item"
                >
                  {items.map((it) => (
                    <MenuItem key={it.id} value={it.id}>
                      {it.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedItem && getSelectedItemDetails()?.image && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={getSelectedItemDetails().image}
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
                label="Total Amount"
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#fa709a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fa709a',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Available Quantity"
                type="number"
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#fa709a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fa709a',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Available From"
                type="time"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#fa709a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fa709a',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Available Till"
                type="time"
                value={availableTill}
                onChange={(e) => setAvailableTill(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#fa709a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fa709a',
                    },
                  },
                }}
              />

              <FormControl
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#fa709a',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#fa709a',
                    },
                  },
                }}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={isAvailable.toString()}
                  onChange={(e) => setIsAvailable(e.target.value === "true")}
                  label="Status"
                >
                  <MenuItem value="true">Available</MenuItem>
                  <MenuItem value="false">Unavailable</MenuItem>
                </Select>
              </FormControl>
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
                backgroundColor: '#fa709a',
                fontWeight: 700,
                textTransform: 'none',
                px: 4,
                '&:hover': {
                  backgroundColor: '#e8608a',
                },
              }}
            >
              {loading ? 'Saving...' : editingItemId ? 'Update' : 'Add'}
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
