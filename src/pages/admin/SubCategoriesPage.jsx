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

const SubCategoriesPage = () => {
  const { auth } = useAuth(); // ✅ use auth instead of user
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
    image: null,
  });
  const [editingId, setEditingId] = useState(null);

  // ✅ Role-based protection
  const allowedRoles = ["admin", "shopadmin"];
  const hasPermission = auth && allowedRoles.includes(auth.role);

  useEffect(() => {
    if (!hasPermission) {
      navigate("/dashboard"); // redirect if unauthorized
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
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await axiosInstance.get("/products/subcategories/");
      setSubCategories(res.data);
    } catch (error) {
      console.error("Error fetching subcategories", error);
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
      form.append("category", formData.category);
      form.append("name", formData.name);
      form.append("description", formData.description);
      if (formData.image) form.append("image", formData.image);

      if (editingId) {
        await axiosInstance.put(`/products/subcategories/${editingId}/`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/products/subcategories/", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setFormData({ category: "", name: "", description: "", image: null });
      setEditingId(null);
      fetchSubCategories();
    } catch (error) {
      console.error("Error saving subcategory", error);
    }
  };

  const handleEdit = (sub) => {
    setFormData({
      category: sub.category, // make sure this is the category ID
      name: sub.name,
      description: sub.description || "",
      image: null,
    });
    setEditingId(sub.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      await axiosInstance.delete(`/products/subcategories/${id}/`);
      fetchSubCategories();
    } catch (error) {
      console.error("Error deleting subcategory", error);
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
        Manage SubCategories
      </Typography>

      {/* SubCategory Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="SubCategory Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button variant="contained" component="label" fullWidth>
                  Upload Image
                  <input type="file" hidden name="image" onChange={handleChange} />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  {editingId ? "Update SubCategory" : "Add SubCategory"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* SubCategory List */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Image</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subCategories.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell>
                {categories.find((c) => c.id === sub.category)?.name || "N/A"}
              </TableCell>
              <TableCell>{sub.name}</TableCell>
              <TableCell>{sub.description}</TableCell>
              <TableCell>
                {sub.image && (
                  <img
                    src={sub.image}
                    alt={sub.name}
                    width={60}
                    style={{ borderRadius: "8px" }}
                  />
                )}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(sub)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(sub.id)}>
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

export default SubCategoriesPage;
