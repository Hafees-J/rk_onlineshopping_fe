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
  AccountTree,
  Image as ImageIcon,
  ArrowBack,
  CloudUpload,
  Search,
  Clear,
  Category as CategoryIcon,
} from "@mui/icons-material";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SubCategoriesPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
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
      fetchCategories();
      fetchSubCategories();
    }
  }, [hasPermission]);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/products/categories/");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories", error);
      setSnackbar({ open: true, message: 'Failed to load categories', severity: 'error' });
    }
  };

  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/products/subcategories/");
      const subCategoriesWithFullUrl = res.data.map((sub) => ({
        ...sub,
        image: sub.image && !sub.image.startsWith("http")
          ? `${axiosInstance.defaults.baseURL}${sub.image}`
          : sub.image,
      }));
      setSubCategories(subCategoriesWithFullUrl);
      setFilteredSubCategories(subCategoriesWithFullUrl);
    } catch (error) {
      console.error("Error fetching subcategories", error);
      setSnackbar({ open: true, message: 'Failed to load subcategories', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredSubCategories(subCategories);
    } else {
      const filtered = subCategories.filter((sub) =>
        sub.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubCategories(filtered);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredSubCategories(subCategories);
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
      form.append("category", formData.category);
      form.append("name", formData.name);
      form.append("description", formData.description);
      if (formData.image) form.append("image", formData.image);

      if (editingId) {
        await axiosInstance.put(`/products/subcategories/${editingId}/`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSnackbar({ open: true, message: 'Subcategory updated successfully', severity: 'success' });
      } else {
        await axiosInstance.post("/products/subcategories/", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSnackbar({ open: true, message: 'Subcategory added successfully', severity: 'success' });
      }

      setFormData({ category: "", name: "", description: "", image: null });
      setEditingId(null);
      setImagePreview(null);
      setOpenDialog(false);
      fetchSubCategories();
    } catch (error) {
      console.error("Error saving subcategory", error);
      setSnackbar({ open: true, message: 'Failed to save subcategory', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sub) => {
    setFormData({
      category: sub.category,
      name: sub.name,
      description: sub.description || "",
      image: null,
    });
    setImagePreview(sub.image);
    setEditingId(sub.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/products/subcategories/${id}/`);
      setSnackbar({ open: true, message: 'Subcategory deleted successfully', severity: 'success' });
      fetchSubCategories();
    } catch (error) {
      console.error("Error deleting subcategory", error);
      setSnackbar({ open: true, message: 'Failed to delete subcategory', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ category: "", name: "", description: "", image: null });
    setImagePreview(null);
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ category: "", name: "", description: "", image: null });
    setImagePreview(null);
    setEditingId(null);
  };

  const getCategoryName = (categoryId) => {
    return categories.find((c) => c.id === categoryId)?.name || "N/A";
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
          background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
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
              <AccountTree sx={{ fontSize: 50 }} />
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  Subcategories
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Organize subcategories
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
              Add Subcategory
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
            placeholder="Search subcategories by name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: '#764ba2', mr: 1 }} />
              ),
              endAdornment: searchQuery && (
                <IconButton
                  onClick={handleClearSearch}
                  size="small"
                  sx={{
                    color: '#757575',
                    '&:hover': {
                      backgroundColor: '#f5f0ff',
                      color: '#764ba2',
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
                  borderColor: '#764ba2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#764ba2',
                },
              },
            }}
          />
        </Paper>

        {loading && filteredSubCategories.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#764ba2' }} />
          </Box>
        ) : filteredSubCategories.length === 0 && searchQuery ? (
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
              No subcategories match "{searchQuery}"
            </Typography>
            <Button
              variant="outlined"
              onClick={handleClearSearch}
              sx={{
                borderColor: '#764ba2',
                color: '#764ba2',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#5d3a82',
                  backgroundColor: '#f5f0ff',
                },
              }}
            >
              Clear Search
            </Button>
          </Paper>
        ) : subCategories.length === 0 ? (
          <Paper
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <AccountTree sx={{ fontSize: 100, color: '#e0e0e0', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
              No Subcategories Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first subcategory
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenDialog}
              sx={{
                backgroundColor: '#764ba2',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(118, 75, 162, 0.4)',
                '&:hover': {
                  backgroundColor: '#5d3a82',
                  boxShadow: '0 6px 20px rgba(118, 75, 162, 0.6)',
                },
              }}
            >
              Add Subcategory
            </Button>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" color="text.secondary">
                Showing {filteredSubCategories.length} of {subCategories.length} subcategories
              </Typography>
              {searchQuery && (
                <Chip
                  label={`Filtered by: "${searchQuery}"`}
                  onDelete={handleClearSearch}
                  sx={{
                    backgroundColor: '#f5f0ff',
                    color: '#764ba2',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
            <Grid container spacing={3}>
              {filteredSubCategories.map((sub) => (
                <Grid item xs={12} sm={6} md={4} key={sub.id}>
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
                        backgroundColor: '#f5f0ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {sub.image ? (
                        <img
                          src={sub.image}
                          alt={sub.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <ImageIcon sx={{ fontSize: 80, color: '#764ba2', opacity: 0.3 }} />
                      )}
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Chip
                        icon={<CategoryIcon />}
                        label={getCategoryName(sub.category)}
                        size="small"
                        sx={{
                          backgroundColor: '#f5f0ff',
                          color: '#764ba2',
                          fontWeight: 600,
                          mb: 1.5,
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
                        {sub.name}
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
                        {sub.description || 'No description available'}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => handleEdit(sub)}
                          sx={{
                            backgroundColor: '#f5f0ff',
                            color: '#764ba2',
                            '&:hover': {
                              backgroundColor: '#764ba2',
                              color: 'white',
                            },
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(sub.id)}
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
          {editingId ? 'Edit Subcategory' : 'Add New Subcategory'}
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
                      borderColor: '#764ba2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#764ba2',
                    },
                  },
                }}
              >
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Subcategory Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#764ba2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#764ba2',
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
                      borderColor: '#764ba2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#764ba2',
                    },
                  },
                }}
              />
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUpload />}
                  sx={{
                    borderColor: '#764ba2',
                    color: '#764ba2',
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#5d3a82',
                      backgroundColor: '#f5f0ff',
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
                backgroundColor: '#764ba2',
                fontWeight: 700,
                textTransform: 'none',
                px: 4,
                '&:hover': {
                  backgroundColor: '#5d3a82',
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

export default SubCategoriesPage;
