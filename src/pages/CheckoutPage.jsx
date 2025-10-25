import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Container,
  Paper,
  Divider,
  Grid,
  Chip,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  ShoppingCart,
  LocationOn,
  Payment,
  CheckCircle,
  LocalShipping,
  Home,
} from "@mui/icons-material";
import axiosInstance from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      setLoadingCart(true);
      try {
        const res = await axiosInstance.get("/orders/cart/", {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
        setCartItems(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load cart items");
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCart();
  }, [auth]);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const res = await axiosInstance.get("/users/addresses/", {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
        setAddresses(res.data);

        // Auto-select default address if exists
        const defaultAddr = res.data.find((addr) => addr.is_default);
        if (defaultAddr) {
          handleAddressSelect(defaultAddr.id, res.data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [auth]);

  // Handle address selection and delivery calculation
  const handleAddressSelect = async (addressId, addrList = addresses) => {
    const address = addrList.find((a) => a.id === addressId);
    if (!address || cartItems.length === 0) return;

    setSelectedAddress(addressId);
    setDeliveryInfo(null);
    setLoadingDelivery(true);
    setError("");

    try {
      const firstItem = cartItems[0];

      const shopLat = firstItem.shop_lat;
      const shopLng = firstItem.shop_lng;
      const shopId = firstItem.shop_id;

      if (!shopLat || !shopLng || !shopId) {
        throw new Error("Shop information missing from cart items");
      }

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const res = await axiosInstance.post(
        "/orders/calculate-delivery-distance/",
        {
          user_lat: address.latitude,
          user_lng: address.longitude,
          shop_lat: shopLat,
          shop_lng: shopLng,
          shop_id: shopId,
          total_order_amount: totalAmount,
        },
        { headers: { Authorization: `Bearer ${auth.access}` } }
      );

      setDeliveryInfo(res.data);
    } catch (err) {
      console.error("Error calculating delivery:", err);
      setError("Failed to calculate delivery details");
    } finally {
      setLoadingDelivery(false);
    }
  };

// Place order
const handlePlaceOrder = async () => {
  if (!selectedAddress) {
    setError("Please select a delivery address");
    return;
  }

  if (deliveryInfo && !deliveryInfo.delivery_available) {
    setError("Delivery not available for this address");
    return;
  }

  setPlacingOrder(true);
  setError("");

  try {
    // ✅ Call your backend checkout endpoint
    const res = await axiosInstance.post(
      "/orders/cart/checkout/",
      {
        delivery_address: selectedAddress,
        delivery_charge: deliveryInfo?.delivery_charge || 0,
      },
      { headers: { Authorization: `Bearer ${auth.access}` } }
    );

    // The backend returns { message, order_id }
    const orderId = res.data.order_id;

    // Redirect to order details page
    navigate(`/order/${orderId}`);
  } catch (err) {
    console.error("Error placing order:", err.response?.data || err);
    setError(err.response?.data?.detail || "Failed to place order");
  } finally {
    setPlacingOrder(false);
  }
};

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryCharge = deliveryInfo?.delivery_charge || 0;
  const finalAmount = totalAmount + deliveryCharge;

  const steps = ['Cart Items', 'Delivery Address', 'Review & Pay'];
  const activeStep = selectedAddress && deliveryInfo ? 2 : selectedAddress ? 1 : 0;

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', pb: 5 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
            <Payment sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                Checkout
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Complete your order
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 3 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ShoppingCart sx={{ color: '#667eea', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  Order Items
                </Typography>
              </Box>

              {loadingCart ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                  <CircularProgress size={50} thickness={4} sx={{ color: '#667eea' }} />
                </Box>
              ) : cartItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography color="text.secondary">No items in cart</Typography>
                </Box>
              ) : (
                <Box>
                  {cartItems.map((item, index) => (
                    <Box key={item.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 2,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: '#2c3e50',
                              mb: 0.5,
                            }}
                          >
                            {item.shop_item_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ₹{item.price.toFixed(2)} × {item.quantity}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: '#d32f2f',
                            fontSize: '1.1rem',
                          }}
                        >
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                      {index < cartItems.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>

            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LocationOn sx={{ color: '#667eea', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  Delivery Address
                </Typography>
              </Box>

              {loadingAddresses ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                  <CircularProgress size={50} thickness={4} sx={{ color: '#667eea' }} />
                </Box>
              ) : addresses.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No addresses found. Add one in your profile.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/profile')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#667eea',
                      color: '#667eea',
                      '&:hover': {
                        borderColor: '#5568d3',
                        backgroundColor: 'rgba(102, 126, 234, 0.04)',
                      },
                    }}
                  >
                    Add Address
                  </Button>
                </Box>
              ) : (
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={selectedAddress}
                    onChange={(e) => handleAddressSelect(Number(e.target.value))}
                  >
                    {addresses.map((addr) => (
                      <Paper
                        key={addr.id}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: '2px solid',
                          borderColor: selectedAddress === addr.id ? '#667eea' : '#e0e0e0',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.02)',
                          },
                        }}
                      >
                        <FormControlLabel
                          value={addr.id}
                          control={<Radio sx={{ color: '#667eea' }} />}
                          label={
                            <Box sx={{ ml: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Home sx={{ fontSize: 20, color: '#667eea' }} />
                                <Typography sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                  {addr.address_type || 'Home'}
                                </Typography>
                                {addr.is_default && (
                                  <Chip
                                    label="Default"
                                    size="small"
                                    sx={{
                                      backgroundColor: '#e8f5e9',
                                      color: '#2e7d32',
                                      fontWeight: 600,
                                      height: 20,
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {addr.address_line}, {addr.city}, {addr.state}
                              </Typography>
                            </Box>
                          }
                          sx={{ width: '100%', m: 0 }}
                        />
                      </Paper>
                    ))}
                  </RadioGroup>
                </FormControl>
              )}

              {loadingDelivery && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={40} thickness={4} sx={{ color: '#667eea' }} />
                </Box>
              )}

              {deliveryInfo && !loadingDelivery && (
                <Paper
                  sx={{
                    p: 2.5,
                    mt: 3,
                    borderRadius: 2,
                    backgroundColor: '#f0f4ff',
                    border: '1px solid #d0d9ff',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocalShipping sx={{ color: '#667eea' }} />
                    <Typography sx={{ fontWeight: 700, color: '#2c3e50' }}>
                      Delivery Details
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Distance
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {deliveryInfo.distance_text}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {deliveryInfo.duration_text}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Delivery Charge
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: '#4caf50', fontSize: '1.1rem' }}>
                        {deliveryInfo.delivery_charge > 0 ? `₹${deliveryInfo.delivery_charge}` : 'FREE'}
                      </Typography>
                    </Grid>
                    {deliveryInfo.message && (
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          {deliveryInfo.message}
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                position: 'sticky',
                top: 90,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: '#2c3e50',
                }}
              >
                Order Summary
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    ₹{totalAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography color="text.secondary">Delivery Charge</Typography>
                  <Typography sx={{ fontWeight: 600, color: deliveryCharge > 0 ? '#2c3e50' : '#4caf50' }}>
                    {deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total Amount
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#d32f2f',
                    }}
                  >
                    ₹{finalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                endIcon={<CheckCircle />}
                onClick={handlePlaceOrder}
                disabled={placingOrder || cartItems.length === 0 || !selectedAddress}
                sx={{
                  backgroundColor: '#667eea',
                  fontWeight: 700,
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    backgroundColor: '#5568d3',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0',
                    color: '#9e9e9e',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {placingOrder ? "Processing..." : "Place Order"}
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Chip
                  icon={<CheckCircle />}
                  label="Safe & Secure Payment"
                  size="small"
                  sx={{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
