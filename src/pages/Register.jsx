// src/pages/Register.jsx
import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");  // Added email state
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!username || !email || !password || !password2) {
      setError("All fields are required");
      return;
    }
    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("users/register/", { username, email, password });
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(err.response);
      const data = err.response?.data;
      let message = "Registration failed";
      if (data) {
        if (data.detail) message = data.detail;
        else if (typeof data === "object") {
          message = Object.values(data)
            .flat()
            .join(" ");
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={10}>
      <Typography variant="h4" mb={3}>
        Register
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
        {error && (
          <Typography color="error" variant="body2" mt={1}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="primary" variant="body2" mt={1}>
            {success}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>
      <Box mt={2}>
        <Typography variant="body2">
          Already have an account? <Link to="/login">Login</Link>
        </Typography>
      </Box>
    </Box>
  );
}
