import React from "react";
import {
  Typography,
  Button,
  Box,
  Stack,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  Chip,
} from "@mui/material";
import {
  Category,
  Inventory,
  LocalOffer,
  QrCode,
  Store,
  AccountTree,
  ReceiptLong,
  ExitToApp,
  AdminPanelSettings,
  ArrowForward,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ShopAdminDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const allowedRoles = ["superadmin", "shopadmin"];

  const menuItems = [
    {
      title: 'Categories',
      description: 'Manage product categories',
      icon: <Category sx={{ fontSize: 40 }} />,
      path: '/categories',
      color: '#667eea',
      bgColor: '#f0f3ff',
    },
    {
      title: 'Subcategories',
      description: 'Organize subcategories',
      icon: <AccountTree sx={{ fontSize: 40 }} />,
      path: '/subcategories',
      color: '#764ba2',
      bgColor: '#f5f0ff',
    },
    {
      title: 'HSN Codes',
      description: 'Manage HSN code system',
      icon: <QrCode sx={{ fontSize: 40 }} />,
      path: '/hsn',
      color: '#f093fb',
      bgColor: '#fef5ff',
    },
    {
      title: 'Items',
      description: 'Manage product inventory',
      icon: <Inventory sx={{ fontSize: 40 }} />,
      path: '/items',
      color: '#4facfe',
      bgColor: '#f0f9ff',
    },
    {
      title: 'Shop Items',
      description: 'Configure shop products',
      icon: <Store sx={{ fontSize: 40 }} />,
      path: '/shopitems',
      color: '#43e97b',
      bgColor: '#f0fff5',
    },
    {
      title: 'Shop Item Offers',
      description: 'Create and manage offers',
      icon: <LocalOffer sx={{ fontSize: 40 }} />,
      path: '/shopitemoffers',
      color: '#fa709a',
      bgColor: '#fff5f8',
    },
    {
      title: 'Order Management',
      description: 'Manage orders',
      icon: <ReceiptLong sx={{ fontSize: 40 }} />,
      path: '/orders',
      color: '#746f70ff',
      bgColor: '#fff5f8',
    },
  ];

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', pb: 5 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 6,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  fontSize: '2rem',
                  fontWeight: 700,
                }}
              >
                {auth?.username?.charAt(0)?.toUpperCase() || 'A'}
              </Avatar>
              <Box sx={{ color: 'white' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  Welcome back, {auth?.username || "Admin"}!
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    icon={<AdminPanelSettings />}
                    label={auth?.role?.toUpperCase() || 'ADMIN'}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 700,
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Manage your shop efficiently
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {allowedRoles.includes(auth?.role) ? (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                Quick Actions
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Select a module to manage your shop
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {menuItems.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        transform: 'translateY(-8px)',
                      },
                    }}
                    onClick={() => navigate(item.path)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 3,
                          backgroundColor: item.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <Box sx={{ color: item.color }}>
                          {item.icon}
                        </Box>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2c3e50' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ px: 3, py: 2 }}>
                      <Button
                        endIcon={<ArrowForward />}
                        sx={
                          {
                            color: item.color,
                            fontWeight: 700,
                            textTransform: 'none',
                            '&:hover': {
                              backgroundColor: item.bgColor,
                            },
                          }
                        }
                      >
                        Manage
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 100, color: '#e0e0e0', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#2c3e50' }}>
              Limited Access
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You have limited access to dashboard features. Contact your administrator for more permissions.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/customer')}
              sx={{
                backgroundColor: '#667eea',
                fontWeight: 700,
                textTransform: 'none',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  backgroundColor: '#5568d3',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                },
              }}
            >
              Go to Customer Dashboard
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
