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
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
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
    <Box p={isSmall ? 2 : 4}>
      <Typography variant="h4" mb={3} textAlign="center" fontWeight="bold" fontStyle={"italic"}>
        Arabian Cafe
      </Typography>

      {/* SUBCATEGORIES */}
      <Typography variant="h5" mb={2} fontWeight="bold">
       What's on your mind?
      </Typography>
      {loadingSubcategories ? (
        <CircularProgress />
      ) : subcategories.length === 0 ? (
        <Typography>No subcategories available</Typography>
      ) : (
        <Grid container spacing={4} mb={4}>
          {subcategories.map((sub) => (
            <Grid item key={sub.id} xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: "0.3s",
                  "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
                }}
                onClick={() => handleSubcategoryClick(sub.id)}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={getImageUrl(sub.image)}
                  alt={sub.name}
                />
                <CardContent>
                  <Typography variant="h6" textAlign="center" fontStyle={"italic"}>
                    {sub.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* SHOPS */}
      {selectedSubcategory && (
        <>
          <Typography variant="h5" mb={2} fontWeight="bold">
            Choose your nearest restuarant ...
          </Typography>
          {loadingShops ? (
            <CircularProgress />
          ) : shops.length === 0 ? (
            <Typography>No shops found.</Typography>
          ) : (
            <Grid container spacing={2} mb={4}>
              {shops.map((shop) => (
                <Grid item key={shop.id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: 2,
                      "&:hover": { boxShadow: 5 },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={getImageUrl(shop.image)}
                      alt={shop.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{shop.name}</Typography>
                      {shop.address && (
                        <Typography variant="body2" color="text.secondary">
                          {shop.address}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => handleShopClick(shop.id)}>
                        View Items
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* ITEMS */}
      {selectedShop && (
        <>
          <Typography variant="h6" mb={2}>
            Explore the taste!
          </Typography>
          {loadingItems ? (
            <CircularProgress />
          ) : shopItems.length === 0 ? (
            <Typography>No items found.</Typography>
          ) : (
            <Grid container spacing={2}>
              {shopItems.map((item) => (
                <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: 3,
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={getImageUrl(item.display_image)}
                      alt={item.item_name}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontStyle={"italic"}>
                        {item.item_name}
                      </Typography>

                      {item.offer_pct ? (
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: "line-through" }}
                          >
                            ₹{item.total_amount}
                          </Typography>
                          <Typography variant="body1" color="error" fontWeight="bold">
                            ₹{item.discount_amount}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body1">₹{item.total_amount}</Typography>
                      )}

                      <Typography variant="body2" color="text.secondary">
                        Available: {item.available_quantity}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={addingToCart[item.id]}
                        onClick={() => handleAddToCart(item)}
                        fullWidth
                      >
                        {addingToCart[item.id] ? "Adding..." : "Add to Cart"}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* CONFIRM DIALOG */}
      <Dialog
        open={confirmDialog.open}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => handleConfirmReset(false)}
      >
        <DialogTitle>⚠️ Cart Reset Required</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmReset(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleConfirmReset(true)}
          >
            Reset & Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
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
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
