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
      console.log("Fetching subcategories...");
      setLoadingSubcategories(true);
      try {
        const res = await axiosInstance.get("/products/subcategories/available/", {
          headers: { Authorization: `Bearer ${auth.access}` },
        });

        console.log("Subcategories API response:", res.data);

        const uniqueSubs = [];
        const seen = new Set();
        res.data.forEach((sub) => {
          if (!seen.has(sub.id)) {
            seen.add(sub.id);
            uniqueSubs.push(sub);
          }
        });

        setSubcategories(uniqueSubs);
        console.log("Unique subcategories set:", uniqueSubs);
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setError("Failed to load subcategories");
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [auth]);

  // Fetch shops by subcategory
  const handleSubcategoryClick = async (subcategoryId) => {
    console.log("Subcategory clicked:", subcategoryId);
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
      console.log("Shops API response:", res.data);
      setShops(res.data);
    } catch (err) {
      console.error("Failed to fetch shops:", err);
      setError("Failed to load shops for this subcategory");
    } finally {
      setLoadingShops(false);
    }
  };

  // Fetch shop items
  const handleShopClick = async (shopId) => {
    console.log("Shop clicked:", shopId);
    setSelectedShop(shopId);
    setShopItems([]);
    setLoadingItems(true);
    setError("");

    try {
      const res = await axiosInstance.get(`/products/shops/${shopId}/items/`, {
        headers: { Authorization: `Bearer ${auth.access}` },
      });
      console.log("Shop items API response:", res.data);
      setShopItems(res.data);
    } catch (err) {
      console.error("Failed to fetch shop items:", err);
      setError("Failed to load shop items");
    } finally {
      setLoadingItems(false);
    }
  };

  // Add to cart with 409 handling
  const handleAddToCart = async (item) => {
    console.log("Attempting to add to cart:", item);
    if (addingToCart[item.id]) return;

    setAddingToCart((prev) => ({ ...prev, [item.id]: true }));
    try {
      const res = await axiosInstance.post(
        "/orders/cart/",
        { shop_item: item.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${auth.access}` } }
      );

      console.log("Add to cart API response:", res.data);

      setSnackbar({
        open: true,
        message: res.data.message || `${item.item_name} added to cart!`,
        severity: "success",
      });
    } catch (err) {
      // If 409 Conflict (different shop), show dialog
      if (err.response?.status === 409) {
        console.warn("409 Conflict - cart has items from another shop:", err.response.data);
        setConfirmDialog({
          open: true,
          message:
            err.response.data.message ||
            "Your cart contains items from another shop. Reset cart to add items from this shop ?",
          item,
        });
      } else {
        console.error("Failed to add to cart:", err);
        const message =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to add item to cart";
        setSnackbar({ open: true, message, severity: "error" });
      }
    } finally {
      setAddingToCart((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleConfirmReset = async (confirm) => {
    const item = confirmDialog.item;
    console.log("Cart reset confirmation:", confirm, "for item:", item);
    setConfirmDialog({ open: false, message: "", item: null });

    if (!confirm || !item) {
      setSnackbar({
        open: true,
        message: "Action cancelled. Item not added.",
        severity: "info",
      });
      return;
    }

    try {
      const resetRes = await axiosInstance.post(
        "/orders/cart/",
        { shop_item: item.id, quantity: 1, reset: true },
        { headers: { Authorization: `Bearer ${auth.access}` } }
      );
      console.log("Cart reset API response:", resetRes.data);

      setSnackbar({
        open: true,
        message: resetRes.data.message || "Cart reset and item added!",
        severity: "success",
      });
    } catch (err) {
      console.error("Failed to reset and add item:", err);
      setSnackbar({
        open: true,
        message: "Failed to reset cart",
        severity: "error",
      });
    }
  };

  return (
    <Box p={isSmall ? 2 : 4}>
      <Typography variant="h4" mb={3} textAlign="center" fontWeight="bold">
        🛒 Customer Dashboard
      </Typography>

      {/* SUBCATEGORIES */}
      <Typography variant="h6" mb={2}>
        Available Subcategories
      </Typography>
      {loadingSubcategories ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : subcategories.length === 0 ? (
        <Typography>No subcategories available</Typography>
      ) : (
        <Grid container spacing={2} mb={4}>
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
                <CardContent>
                  <Typography variant="h6" textAlign="center">
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
          <Typography variant="h6" mb={2}>
            Shops under this Subcategory
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
            Items in this Shop
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
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
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
