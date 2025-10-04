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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ShopItemOfferPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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
      setShopItems(res.data);
    } catch (err) {
      console.error("Failed to fetch shop items", err);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await axiosInstance.get("/products/shop-item-offers/");
      setOffers(res.data);
    } catch (err) {
      console.error("Failed to fetch offers", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
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
      } else {
        await axiosInstance.post("/products/shop-item-offers/", payload);
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
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      await axiosInstance.delete(`/products/shop-item-offers/${id}/`);
      fetchOffers();
    } catch (err) {
      console.error("Failed to delete offer", err);
    }
  };

  if (!hasPermission) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">You do not have permission to access this page.</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Shop Item Offers</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditing(null);
            setForm({
              shop_item: "",
              offer_pct: "",
              offer_starting_datetime: "",
              offer_ending_datetime: "",
              active: false,
            });
            setOpen(true);
          }}
        >
          Add Offer
        </Button>
      </Box>

      {/* Offers Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Shop Item</TableCell>
              <TableCell>Offer %</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offers.map((offer) => {
              const shopItem = shopItems.find((si) => si.id === offer.shop_item);
              const itemName = shopItem ? shopItem.item_name || shopItem.item?.name : offer.shop_item;

              return (
                <TableRow key={offer.id}>
                  <TableCell>{itemName}</TableCell>
                  <TableCell>{offer.offer_pct}</TableCell>
                  <TableCell>{offer.offer_starting_datetime}</TableCell>
                  <TableCell>{offer.offer_ending_datetime}</TableCell>
                  <TableCell>{offer.active ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
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
                    >
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(offer.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Form */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editing ? "Edit Offer" : "Add Offer"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Shop Item</InputLabel>
            <Select
              name="shop_item"
              value={form.shop_item}
              onChange={handleChange}
              disabled={!!editing}
            >
              {shopItems.map((si) => (
                <MenuItem key={si.id} value={si.id}>
                  {si.item_name || si.item?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            label="Offer %"
            name="offer_pct"
            type="number"
            fullWidth
            value={form.offer_pct}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            label="Start DateTime"
            name="offer_starting_datetime"
            type="datetime-local"
            fullWidth
            value={form.offer_starting_datetime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            margin="normal"
            label="End DateTime"
            name="offer_ending_datetime"
            type="datetime-local"
            fullWidth
            value={form.offer_ending_datetime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
