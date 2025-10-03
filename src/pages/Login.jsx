import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response);
      const data = err.response?.data;
      let message = "Login failed";
      if (data) {
        if (data.detail) message = data.detail;
        else if (typeof data === "object") {
          message = Object.values(data).flat().join(" ");
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
        Login
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
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <Box mt={2}>
        <Typography variant="body2">
          Don't have an account? <Link to="/register">Register</Link>
        </Typography>
      </Box>
    </Box>
  );
}
