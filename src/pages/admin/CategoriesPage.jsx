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
  Alert,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CategoriesPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "", image: null });
  const [editingId, setEditingId] = useState(null);

  const allowedRoles = ["admin", "shopadmin"];
  const hasPermission = auth && allowedRoles.includes(auth.role);

  useEffect(() => {
    if (!hasPermission) {
      navigate("/dashboard");
    } else {
      fetchCategories();
    }
  }, [hasPermission]);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/products/categories/");
      const categoriesWithFullUrl = res.data.map((cat) => ({
        ...cat,
        image: cat.image && !cat.image.startsWith("http")
          ? `${axiosInstance.defaults.baseURL}${cat.image}`
          : cat.image,
      }));
      setCategories(categoriesWithFullUrl);
    } catch (error) {
      console.error("Error fetching categories", error);
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
      form.append("name", formData.name);
      form.append("description", formData.description);
      if (formData.image) form.append("image", formData.image);

      if (editingId) {
        await axiosInstance.put(`/products/categories/${editingId}/`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/products/categories/", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setFormData({ name: "", description: "", image: null });
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category", error);
    }
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, description: cat.description || "", image: null });
    setEditingId(cat.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axiosInstance.delete(`/products/categories/${id}/`);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category", error);
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
        Manage Categories
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Category Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="contained" component="label" fullWidth>
                  Upload Image
                  <input type="file" hidden name="image" onChange={handleChange} />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  {editingId ? "Update Category" : "Add Category"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Image</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>{cat.name}</TableCell>
              <TableCell>{cat.description}</TableCell>
              <TableCell>
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    width={60}
                    style={{ borderRadius: "8px" }}
                  />
                ) : (
                  "No Image"
                )}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(cat)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(cat.id)}>
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

export default CategoriesPage;
