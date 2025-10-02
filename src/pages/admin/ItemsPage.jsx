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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ItemsPage = () => {
  const { auth } = useAuth(); // ✅ use auth
  const navigate = useNavigate();

  const [subCategories, setSubCategories] = useState([]);
  const [hsnList, setHsnList] = useState([]);
  const [items, setItems] = useState([]);

  const [formData, setFormData] = useState({
    subcategory: "",
    name: "",
    description: "",
    hsn: "",
    image: null,
  });

  const [editingId, setEditingId] = useState(null);

  // ✅ Role-based protection
  const allowedRoles = ["admin", "shopadmin"];
  const hasPermission = auth && allowedRoles.includes(auth.role);

  useEffect(() => {
    if (!hasPermission) {
      navigate("/dashboard"); // redirect unauthorized
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
    }
  };

  const fetchHSN = async () => {
    try {
      const res = await axiosInstance.get("/products/hsn/");
      setHsnList(res.data);
    } catch (error) {
      console.error("Error fetching HSN list", error);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axiosInstance.get("/products/items/");
      setItems(res.data);
    } catch (error) {
      console.error("Error fetching items", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("subcategory", formData.subcategory);
      form.append("name", formData.name);
      form.append("description", formData.description);
      if (formData.hsn) form.append("hsn", formData.hsn);
      if (formData.image) form.append("image", formData.image);

      if (editingId) {
        await axiosInstance.put(`/products/items/${editingId}/`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/products/items/", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setFormData({ subcategory: "", name: "", description: "", hsn: "", image: null });
      setEditingId(null);
      fetchItems();
    } catch (error) {
      console.error("Error saving item", error);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      subcategory: item.subcategory,
      name: item.name,
      description: item.description || "",
      hsn: item.hsn || "",
      image: null,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axiosInstance.delete(`/products/items/${id}/`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item", error);
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Manage Items
      </Typography>

      {/* Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth required>
                  <InputLabel>SubCategory</InputLabel>
                  <Select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                  >
                    {subCategories.map((sub) => (
                      <MenuItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Item Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>HSN Code</InputLabel>
                  <Select
                    name="hsn"
                    value={formData.hsn}
                    onChange={handleChange}
                  >
                    <MenuItem value="">None</MenuItem>
                    {hsnList.map((hsn) => (
                      <MenuItem key={hsn.id} value={hsn.id}>
                        {hsn.hsncode} (CGST {hsn.cgst}%, SGST {hsn.sgst}%)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <Button variant="contained" component="label" fullWidth>
                  Upload Image
                  <input type="file" hidden name="image" onChange={handleChange} />
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  {editingId ? "Update Item" : "Add Item"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Items List */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>SubCategory</TableCell>
            <TableCell>Item Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>HSN</TableCell>
            <TableCell>Image</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {subCategories.find((s) => s.id === item.subcategory)?.name || "N/A"}
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                {item.hsn ? hsnList.find((h) => h.id === item.hsn)?.hsncode : "N/A"}
              </TableCell>
              <TableCell>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    width={60}
                    style={{ borderRadius: "8px" }}
                  />
                )}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(item)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(item.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ItemsPage;
