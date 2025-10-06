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
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
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
  const [error, setError] = useState("");

  const [placingOrder, setPlacingOrder] = useState(false);

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
        const res = await axiosInstance.get("/user/addresses/", {
          headers: { Authorization: `Bearer ${auth.access}` },
        });
        setAddresses(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [auth]);

  // Handle address selection
  const handleAddressSelect = async (addressId) => {
    setSelectedAddress(addressId);
    setDeliveryInfo(null);

    const address = addresses.find((a) => a.id === addressId);
    if (!address || cartItems.length === 0) return;

    setLoadingDelivery(true);
    setError("");

    // Assuming all items in cart belong to same shop
    const shopLat = cartItems[0].shop_item.shop.lat; // must ensure shop lat/lng exist
    const shopLng = cartItems[0].shop_item.shop.lng;
    const totalOrderAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      const res = await axiosInstance.post(
        "/orders/calculate-delivery-distance/",
        {
          user_lat: address.lat,
          user_lng: address.lng,
          shop_lat: shopLat,
          shop_lng: shopLng,
          shop_id: cartItems[0].shop_item.shop.id,
          total_order_amount: totalOrderAmount,
        },
        { headers: { Authorization: `Bearer ${auth.access}` } }
      );
      setDeliveryInfo(res.data);
    } catch (err) {
      console.error(err);
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
      const res = await axiosInstance.post(
        "/orders/cart/checkout/",
        { delivery_address: selectedAddress },
        { headers: { Authorization: `Bearer ${auth.access}` } }
      );
      navigate(`/order/${res.data.order_id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = deliveryInfo?.delivery_charge || 0;
  const finalAmount = totalAmount + deliveryCharge;

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Checkout
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Cart Items */}
      <Typography variant="h6" mb={2}>Cart Items</Typography>
      {loadingCart ? (
        <CircularProgress />
      ) : cartItems.length === 0 ? (
        <Typography>No items in cart</Typography>
      ) : (
        <Box mb={3}>
          {cartItems.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography>{item.shop_item_name}</Typography>
                <Typography>Quantity: {item.quantity}</Typography>
                <Typography>Price: ₹{item.price}</Typography>
                <Typography>Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</Typography>
              </CardContent>
            </Card>
          ))}
          <Typography variant="h6">Total: ₹{totalAmount.toFixed(2)}</Typography>
        </Box>
      )}

      {/* Address Selection */}
      <Typography variant="h6" mb={2}>Select Delivery Address</Typography>
      {loadingAddresses ? (
        <CircularProgress />
      ) : addresses.length === 0 ? (
        <Typography>No addresses found. Please add one in your profile.</Typography>
      ) : (
        <FormControl component="fieldset">
          <RadioGroup value={selectedAddress} onChange={(e) => handleAddressSelect(Number(e.target.value))}>
            {addresses.map((addr) => (
              <FormControlLabel
                key={addr.id}
                value={addr.id}
                control={<Radio />}
                label={`${addr.address_line}, ${addr.city}, ${addr.state}`}
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}

      {/* Delivery Info */}
      {loadingDelivery ? (
        <CircularProgress sx={{ mt: 2 }} />
      ) : deliveryInfo ? (
        <Box mt={2} p={2} border="1px solid #ccc" borderRadius={2}>
          <Typography>Distance: {deliveryInfo.distance_text}</Typography>
          <Typography>Duration: {deliveryInfo.duration_text}</Typography>
          <Typography>Delivery Charge: ₹{deliveryInfo.delivery_charge || 0}</Typography>
          <Typography>Message: {deliveryInfo.message}</Typography>
        </Box>
      ) : null}

      {/* Place Order */}
      <Box mt={3}>
        <Button
          variant="contained"
          onClick={handlePlaceOrder}
          disabled={placingOrder || cartItems.length === 0 || !selectedAddress}
        >
          {placingOrder ? "Placing Order..." : `Place Order (₹${finalAmount.toFixed(2)})`}
        </Button>
      </Box>
    </Box>
  );
}
