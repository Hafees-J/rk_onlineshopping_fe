import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slide,
  useTheme,
  useMediaQuery,
  CardMedia,
  Container,
  Chip,
  Paper,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { LocalOffer, Store, RestaurantMenu, Add } from "@mui/icons-material";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CustomerDashboard() {
  const { auth } = useAuth();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(true);
  const [loadingShops, setLoadingShops] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [addingToCart, setAddingToCart] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    message: "",
    item: null,
  });

  // Fetch available subcategories
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!auth?.access) return;
      setLoadingSubcategories(true);
      try {
        const res = await axiosInstance.get("/products/subcategories/available/", {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
        const uniqueSubs = [];
        const seen = new Set();
        res.data.forEach((sub) => {
          if (!seen.has(sub.id)) {
            seen.add(sub.id);
            uniqueSubs.push(sub);
          }
        });
        setSubcategories(uniqueSubs);
      } catch (err) {
        setError("Failed to load subcategories");
      } finally {
        setLoadingSubcategories(false);
      }
    };
    fetchSubcategories();
  }, [auth]);

  // Fetch shops by subcategory
  const handleSubcategoryClick = async (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    setShops([]);
    setSelectedShop(null);
    setShopItems([]);
    setLoadingShops(true);
    setError("");

    try {
      const res = await axiosInstance.get(
        `/products/shops/by-subcategory/${subcategoryId}/`,
        { headers: { Authorization: `Bearer ${auth.access}` } }
      );
      setShops(res.data);
    } catch (err) {
      setError("Failed to load shops for this subcategory");
    } finally {
      setLoadingShops(false);
    }
  };

  // Fetch shop items
  const handleShopClick = async (shopId) => {
    setSelectedShop(shopId);
    setShopItems([]);
    setLoadingItems(true);
    setError("");

    try {
      const res = await axiosInstance.get(`/products/shops/${shopId}/items/`, {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      setShopItems(res.data);
    } catch (err) {
      setError("Failed to load shop items");
    } finally {
      setLoadingItems(false);
    }
  };

  // Add to cart
  const handleAddToCart = async (item) => {
    if (addingToCart[item.id]) return;
    setAddingToCart((prev) => ({ ...prev, [item.id]: true }));
    try {
      const res = await axiosInstance.post(
        "/orders/cart/",
        { shop_item: item.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${auth.access}` } }
      );
      setSnackbar({
        open: true,
        message: res.data.message || `${item.item_name} added to cart!`,
        severity: "success",
      });
    } catch (err) {
      if (err.response?.status === 409) {
        setConfirmDialog({
          open: true,
          message:
            err.response.data.message ||
            "Your cart contains items from another shop. Reset cart to add this item?",
          item,
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to add item to cart",
          severity: "error",
        });
      }
    } finally {
      setAddingToCart((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleConfirmReset = async (confirm) => {
    const item = confirmDialog.item;
    setConfirmDialog({ open: false, message: "", item: null });

    if (!confirm || !item) return;

    try {
      const resetRes = await axiosInstance.post(
        "/orders/cart/",
        { shop_item: item.id, quantity: 1, reset: true },
        { headers: { Authorization: `Bearer ${auth.access}` } }
      );
      setSnackbar({
        open: true,
        message: resetRes.data.message || "Cart reset and item added!",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to reset cart",
        severity: "error",
      });
    }
  };

  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/200x150?text=No+Image";
    return url.startsWith("http") ? url : `${axiosInstance.defaults.baseURL}${url}`;
  };

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Box
        sx={{
          width: '100%',
          height: { xs: 200, sm: 280, md: 350 },
          backgroundImage: 'url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            color: 'white',
            px: 2,
          }}
        >
          <Typography
            variant={isSmall ? 'h4' : 'h2'}
            sx={{
              fontWeight: 800,
              mb: 1,
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              letterSpacing: 1,
            }}
          >
            Arabian Cafe
          </Typography>
          <Typography
            variant={isSmall ? 'body1' : 'h6'}
            sx={{
              fontWeight: 400,
              textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
              opacity: 0.95,
            }}
          >
            Delicious meals delivered to your doorstep
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 5 } }}>
        <Box mb={5}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <RestaurantMenu sx={{ fontSize: 32, color: '#d32f2f' }} />
            What's on your mind?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Browse our delicious categories
          </Typography>

          {loadingSubcategories ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress size={50} thickness={4} sx={{ color: '#d32f2f' }} />
            </Box>
          ) : subcategories.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography color="text.secondary">No categories available at the moment</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {subcategories.map((sub) => (
                <Grid item key={sub.id} xs={6} sm={4} md={3} lg={2}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      borderRadius: 3,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        transform: 'translateY(-6px)',
                      },
                      '&:active': {
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={() => handleSubcategoryClick(sub.id)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={getImageUrl(sub.image)}
                      alt={sub.name}
                      sx={{
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: '#2c3e50',
                          fontSize: { xs: '0.85rem', sm: '0.95rem' },
                        }}
                      >
                        {sub.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {selectedSubcategory && (
          <Box mb={5}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Store sx={{ fontSize: 32, color: '#d32f2f' }} />
              Choose your nearest restaurant
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Select from our partner restaurants in your area
            </Typography>

            {loadingShops ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={50} thickness={4} sx={{ color: '#d32f2f' }} />
              </Box>
            ) : shops.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <Typography color="text.secondary">No restaurants found in this category</Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {shops.map((shop) => (
                  <Grid item key={shop.id} xs={12} sm={6} md={4} lg={3}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="180"
                        image={getImageUrl(shop.image)}
                        alt={shop.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#2c3e50',
                            mb: 1,
                          }}
                        >
                          {shop.name}
                        </Typography>
                        {shop.address && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {shop.address}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleShopClick(shop.id)}
                          sx={{
                            backgroundColor: '#d32f2f',
                            fontWeight: 600,
                            textTransform: 'none',
                            py: 1,
                            borderRadius: 2,
                            '&:hover': {
                              backgroundColor: '#b71c1c',
                            },
                          }}
                        >
                          View Menu
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {selectedShop && (
          <Box mb={5}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <LocalOffer sx={{ fontSize: 32, color: '#d32f2f' }} />
              Explore the Menu
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Add your favorite items to cart
            </Typography>

            {loadingItems ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={50} thickness={4} sx={{ color: '#d32f2f' }} />
              </Box>
            ) : shopItems.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <Typography color="text.secondary">No items available at the moment</Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {shopItems.map((item) => (
                  <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      {item.offer_pct && (
                        <Chip
                          label={`${item.offer_pct}% OFF`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 1,
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                      <CardMedia
                        component="img"
                        height="180"
                        image={getImageUrl(item.display_image)}
                        alt={item.item_name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#2c3e50',
                            mb: 1,
                            fontSize: '1rem',
                          }}
                        >
                          {item.item_name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                          {item.offer_pct ? (
                            <>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: '#d32f2f',
                                }}
                              >
                                ₹{item.discount_amount}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  textDecoration: "line-through",
                                  color: 'text.secondary',
                                }}
                              >
                                ₹{item.total_amount}
                              </Typography>
                            </>
                          ) : (
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: '#2c3e50',
                              }}
                            >
                              ₹{item.total_amount}
                            </Typography>
                          )}
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{
                            color: item.available_quantity > 0 ? '#4caf50' : '#f44336',
                            fontWeight: 600,
                          }}
                        >
                          {item.available_quantity > 0 ? `${item.available_quantity} available` : 'Out of stock'}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={addingToCart[item.id] || item.available_quantity === 0}
                          onClick={() => handleAddToCart(item)}
                          startIcon={<Add />}
                          sx={{
                            backgroundColor: '#d32f2f',
                            fontWeight: 600,
                            textTransform: 'none',
                            py: 1,
                            borderRadius: 2,
                            '&:hover': {
                              backgroundColor: '#b71c1c',
                            },
                            '&:disabled': {
                              backgroundColor: '#e0e0e0',
                              color: '#9e9e9e',
                            },
                          }}
                        >
                          {addingToCart[item.id] ? "Adding..." : item.available_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Container>

      <Dialog
        open={confirmDialog.open}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => handleConfirmReset(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 320,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
          }}
        >
          Cart Reset Required
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => handleConfirmReset(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleConfirmReset(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#d32f2f',
              '&:hover': {
                backgroundColor: '#b71c1c',
              },
            }}
          >
            Reset & Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
