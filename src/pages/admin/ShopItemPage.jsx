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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Alert,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function ShopItemPage() {
  const { auth } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [shopItems, setShopItems] = useState([]);

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
    }
  };

  const fetchItems = async (subcategoryId) => {
    if (!subcategoryId) return setItems([]);
    try {
      const res = await axiosInstance.get(
        `/products/items-per-subcategory/${subcategoryId}/`,
        { headers: { Authorization: `Bearer ${auth?.access}` } }
      );
      setItems(res.data);
    } catch (err) {
      console.error("Failed to fetch items", err);
    }
  };

  const fetchShopItems = async () => {
    if (!auth?.shop_id) return;
    try {
      const res = await axiosInstance.get(
        `/products/shop-items/?shop=${auth.shop_id}`,
        { headers: { Authorization: `Bearer ${auth?.access}` } }
      );
      setShopItems(res.data || []);
    } catch (err) {
      console.error("Failed to fetch shop items", err);
      setShopItems([]);
    }
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
  };

  const handleSubmit = async () => {
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

    try {
      if (editingItemId) {
        // Update existing
        await axiosInstance.put(`/products/shop-items/${editingItemId}/`, payload, {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
      } else {
        // Create new
        await axiosInstance.post("/products/shop-items/", payload, {
          headers: { Authorization: `Bearer ${auth?.access}` },
        });
      }

      resetForm();
      fetchShopItems();
      setError("");
    } catch (err) {
      console.error("Failed to save shop item", err.response?.data || err);
      setError(err.response?.data || "Failed to save shop item");
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axiosInstance.delete(`/products/shop-items/${id}/`, {
        headers: { Authorization: `Bearer ${auth?.access}` },
      });
      fetchShopItems();
    } catch (err) {
      console.error("Failed to delete shop item", err);
      alert("Failed to delete item");
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={2}>
        Manage Shop Items
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === "string" ? error : JSON.stringify(error)}
        </Alert>
      )}

      {/* Form */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        {/* Category */}
        <FormControl sx={{ minWidth: 200 }} disabled={!!editingItemId}>
          <InputLabel>Category</InputLabel>
          <Select value={selectedCategory} onChange={handleCategoryChange}>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Subcategory */}
        <FormControl sx={{ minWidth: 200 }} disabled={!!editingItemId}>
          <InputLabel>Subcategory</InputLabel>
          <Select
            value={selectedSubcategory}
            onChange={handleSubcategoryChange}
            disabled={!subcategories.length || !!editingItemId}
          >
            {subcategories.map((sub) => (
              <MenuItem key={sub.id} value={sub.id}>
                {sub.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Item */}
        <FormControl sx={{ minWidth: 200 }} disabled={!!editingItemId}>
          <InputLabel>Item</InputLabel>
          <Select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            disabled={!items.length || !!editingItemId}
          >
            {items.map((it) => (
              <MenuItem key={it.id} value={it.id}>
                {it.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Editable fields */}
        <TextField
          label="Total Amount"
          type="number"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
        />
        <TextField
          label="Available Quantity"
          type="number"
          value={availableQuantity}
          onChange={(e) => setAvailableQuantity(e.target.value)}
        />
        <TextField
          label="Available From"
          type="time"
          value={availableFrom}
          onChange={(e) => setAvailableFrom(e.target.value)}
        />
        <TextField
          label="Available Till"
          type="time"
          value={availableTill}
          onChange={(e) => setAvailableTill(e.target.value)}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={isAvailable.toString()}
            onChange={(e) => setIsAvailable(e.target.value === "true")}
          >
            <MenuItem value="true">Available</MenuItem>
            <MenuItem value="false">Unavailable</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {editingItemId ? "Update Item" : "Add Item"}
        </Button>

        {editingItemId && (
          <Button variant="outlined" color="secondary" onClick={resetForm}>
            Cancel Edit
          </Button>
        )}
      </Box>

      {/* Shop Items Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Offer Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Available From</TableCell>
              <TableCell>Available Till</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(shopItems) && shopItems.length ? (
              shopItems.map((shopItem) => (
                <TableRow key={shopItem.id}>
                  <TableCell>{shopItem.item_name || shopItem.item?.name}</TableCell>
                  <TableCell>{shopItem.total_amount}</TableCell>
                  <TableCell>{shopItem.discount_amount || "-"}</TableCell>
                  <TableCell>{shopItem.available_quantity}</TableCell>
                  <TableCell>{shopItem.available_from || "-"}</TableCell>
                  <TableCell>{shopItem.available_till || "-"}</TableCell>
                  <TableCell>
                    {shopItem.is_available ? "Available" : "Unavailable"}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleEdit(shopItem)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(shopItem.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No shop items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
