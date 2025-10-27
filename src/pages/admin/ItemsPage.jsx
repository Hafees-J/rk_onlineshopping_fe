import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  IconButton,
  Alert,
  Container,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Delete,
  Edit,
  Add,
  Inventory,
  Image as ImageIcon,
  ArrowBack,
  CloudUpload,
  Search,
  Clear,
  AccountTree,
  LocalOffer,
} from "@mui/icons-material";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ItemsPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [subCategories, setSubCategories] = useState([]);
  const [hsnList, setHsnList] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    subcategory: "",
    name: "",
    description: "",
    hsn: "",
    image: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const allowedRoles = ["admin", "shopadmin"];
  const hasPermission = auth && allowedRoles.includes(auth.role);

  useEffect(() => {
    if (!hasPermission) {
      navigate("/dashboard");
    } else {
      fetchSubCategories();
      fetchHSN();
      fetchItems();
    }
  }, [hasPermission]);

  const fetchSubCategories = async () => {
    try {
      const res = await axiosInstance.get("/products/subcategories/");
      setSubCategories(res.data);
    } catch (error) {
      console.error("Error fetching subcategories", error);
      setSnackbar({ open: true, message: 'Failed to load subcategories', severity: 'error' });
    }
  };

  const fetchHSN = async () => {
    try {
      const res = await axiosInstance.get("/products/hsn/");
      setHsnList(res.data);
    } catch (error) {
      console.error("Error fetching HSN list", error);
      setSnackbar({ open: true, message: 'Failed to load HSN codes', severity: 'error' });
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/products/items/");
      const itemsWithFullUrl = res.data.map((item) => ({
        ...item,
        image: item.image && !item.image.startsWith("http")
          ? `${axiosInstance.defaults.baseURL}${item.image}`
          : item.image,
      }));
      setItems(itemsWithFullUrl);
      setFilteredItems(itemsWithFullUrl);
    } catch (error) {
      console.error("Error fetching items", error);
      setSnackbar({ open: true, message: 'Failed to load items', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredItems(items);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.append("subcategory", formData.subcategory);
      form.append("name", formData.name);
      form.append("description", formData.description);
      if (formData.hsn) form.append("hsn_id", formData.hsn);
      if (formData.image) form.append("image", formData.image);

      if (editingId) {
        await axiosInstance.put(`/products/items/${editingId}/`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSnackbar({ open: true, message: 'Item updated successfully', severity: 'success' });
      } else {
        await axiosInstance.post("/products/items/", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSnackbar({ open: true, message: 'Item added successfully', severity: 'success' });
      }

      setFormData({ subcategory: "", name: "", description: "", hsn: "", image: null });
      setEditingId(null);
      setImagePreview(null);
      setOpenDialog(false);
      fetchItems();
    } catch (error) {
      console.error("Error saving item", error);
      setSnackbar({ open: true, message: 'Failed to save item', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      subcategory: item.subcategory,
      name: item.name,
      description: item.description || "",
      hsn: item.hsn?.id || "",
      image: null,
    });
    setImagePreview(item.image);
    setEditingId(item.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/products/items/${id}/`);
      setSnackbar({ open: true, message: 'Item deleted successfully', severity: 'success' });
      fetchItems();
    } catch (error) {
      console.error("Error deleting item", error);
      setSnackbar({ open: true, message: 'Failed to delete item', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ subcategory: "", name: "", description: "", hsn: "", image: null });
    setImagePreview(null);
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ subcategory: "", name: "", description: "", hsn: "", image: null });
    setImagePreview(null);
    setEditingId(null);
  };

  const getSubCategoryName = (subCategoryId) => {
    return subCategories.find((s) => s.id === subCategoryId)?.name || "N/A";
  };

  if (!hasPermission) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">You do not have permission to access this page.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', pb: 5 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
              <Inventory sx={{ fontSize: 50 }} />
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  Items
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage product items
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
              Add Item
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
            placeholder="Search items by name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: '#f5576c', mr: 1 }} />
              ),
              endAdornment: searchQuery && (
                <IconButton
                  onClick={handleClearSearch}
                  size="small"
                  sx={{
                    color: '#757575',
                    '&:hover': {
                      backgroundColor: '#fff0f3',
                      color: '#f5576c',
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
                  borderColor: '#f5576c',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#f5576c',
                },
              },
            }}
          />
        </Paper>

        {loading && filteredItems.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#f5576c' }} />
          </Box>
        ) : filteredItems.length === 0 && searchQuery ? (
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
              No items match "{searchQuery}"
            </Typography>
            <Button
              variant="outlined"
              onClick={handleClearSearch}
              sx={{
                borderColor: '#f5576c',
                color: '#f5576c',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#e04a5e',
                  backgroundColor: '#fff0f3',
                },
              }}
            >
              Clear Search
            </Button>
          </Paper>
        ) : items.length === 0 ? (
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <Inventory sx={{ fontSize: 100, color: '#e0e0e0', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
              No Items Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first item
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: '#f5576c',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(245, 87, 108, 0.4)',
                '&:hover': {
                  backgroundColor: '#e04a5e',
                  boxShadow: '0 6px 20px rgba(245, 87, 108, 0.6)',
                },
              }}
            >
              Add Item
            </Button>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" color="text.secondary">
                Showing {filteredItems.length} of {items.length} items
              </Typography>
              {searchQuery && (
                <Chip
                  label={`Filtered by: "${searchQuery}"`}
                  onDelete={handleClearSearch}
                  sx={{
                    backgroundColor: '#fff0f3',
                    color: '#f5576c',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
            <Grid container spacing={3}>
              {filteredItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
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
                        backgroundColor: '#fff0f3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <ImageIcon sx={{ fontSize: 80, color: '#f5576c', opacity: 0.3 }} />
                      )}
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<AccountTree />}
                          label={getSubCategoryName(item.subcategory)}
                          size="small"
                          sx={{
                            backgroundColor: '#fff0f3',
                            color: '#f5576c',
                            fontWeight: 600,
                          }}
                        />
                        {item.hsn && (
                          <Chip
                            icon={<LocalOffer />}
                            label={`${item.hsn.hsncode}`}
                            size="small"
                            sx={{
                              backgroundColor: '#e8f5e9',
                              color: '#4caf50',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
                        {item.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          height: 40,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.description || 'No description available'}
                      </Typography>
                      {item.hsn && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                          GST: {item.hsn.gst}%
                        </Typography>
                      )}
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => handleEdit(item)}
                          sx={{
                            backgroundColor: '#fff0f3',
                            color: '#f5576c',
                            '&:hover': {
                              backgroundColor: '#f5576c',
                              color: 'white',
                            },
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(item.id)}
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
          {editingId ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={3}>
              <FormControl
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#f5576c',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f5576c',
                    },
                  },
                }}
              >
                <InputLabel>Subcategory</InputLabel>
                <Select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  label="Subcategory"
                >
                  {subCategories.map((sub) => (
                    <MenuItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#f5576c',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f5576c',
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#f5576c',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f5576c',
                    },
                  },
                }}
              />
              <FormControl
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#f5576c',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#f5576c',
                    },
                  },
                }}
              >
                <InputLabel>HSN Code</InputLabel>
                <Select
                  name="hsn"
                  value={formData.hsn}
                  onChange={handleChange}
                  label="HSN Code"
                >
                  <MenuItem value="">None</MenuItem>
                  {hsnList.map((hsn) => (
                    <MenuItem key={hsn.id} value={hsn.id}>
                      {hsn.hsncode} (CGST {hsn.cgst}%, SGST {hsn.sgst}%)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUpload />}
                  sx={{
                    borderColor: '#f5576c',
                    color: '#f5576c',
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#e04a5e',
                      backgroundColor: '#fff0f3',
                    },
                  }}
                >
                  {formData.image ? formData.image.name : 'Upload Image'}
                  <input type="file" hidden name="image" onChange={handleChange} accept="image/*" />
                </Button>
                {imagePreview && (
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                  </Box>
                )}
              </Box>
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
                backgroundColor: '#f5576c',
                fontWeight: 700,
                textTransform: 'none',
                px: 4,
                '&:hover': {
                  backgroundColor: '#e04a5e',
                },
              }}
            >
              {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
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
};

export default ItemsPage;
