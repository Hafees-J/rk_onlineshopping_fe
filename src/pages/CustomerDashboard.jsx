// src/pages/CustomerDashboard.jsx
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
} from "@mui/material";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function CustomerDashboard() {
  const { auth } = useAuth();
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(true);
  const [loadingShops, setLoadingShops] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState("");

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
        console.error("Failed to fetch subcategories", err);
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
        {
          headers: { Authorization: `Bearer ${auth.access}` },
        }
      );
      setShops(res.data);
    } catch (err) {
      console.error("Failed to fetch shops", err);
      setError("Failed to load shops for this subcategory");
    } finally {
      setLoadingShops(false);
    }
  };

  // Fetch shop items when shop is clicked
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
      console.error("Failed to fetch shop items", err);
      setError("Failed to load shop items");
    } finally {
      setLoadingItems(false);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Customer Dashboard
      </Typography>

      {/* Subcategories */}
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
            <Grid item key={sub.id} xs={12} sm={6} md={4}>
              <Card
                sx={{ cursor: "pointer" }}
                onClick={() => handleSubcategoryClick(sub.id)}
              >
                <CardContent>
                  <Typography variant="h6">{sub.name}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Shops */}
      {selectedSubcategory && (
        <>
          <Typography variant="h6" mb={2}>
            Shops with this subcategory
          </Typography>

          {loadingShops ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : shops.length === 0 ? (
            <Typography>No shops found for this subcategory</Typography>
          ) : (
            <Grid container spacing={2} mb={4}>
              {shops.map((shop) => (
                <Grid item key={shop.id} xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{shop.name}</Typography>
                      {shop.address && (
                        <Typography variant="body2" color="text.secondary">
                          {shop.address}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => handleShopClick(shop.id)}
                      >
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

{/* Shop Items */}
{selectedShop && (
  <>
    <Typography variant="h6" mb={2}>
      Items in this Shop
    </Typography>

    {loadingItems ? (
      <CircularProgress />
    ) : error ? (
      <Alert severity="error">{error}</Alert>
    ) : shopItems.length === 0 ? (
      <Typography>No items found in this shop</Typography>
    ) : (
      <Grid container spacing={2}>
        {shopItems.map((item) => (
          <Grid item key={item.id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">{item.item_name}</Typography>

                {/* Price with Offer */}
                {item.offer_price ? (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textDecoration: "line-through" }}
                    >
                      ₹{item.price}
                    </Typography>
                    <Typography variant="body1" color="error">
                      ₹{item.offer_price}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body1">₹{item.price}</Typography>
                )}

                <Typography variant="body2" color="text.secondary">
                  Available: {item.available_quantity}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )}
  </>
)}

    </Box>
  );
}
