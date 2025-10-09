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

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3} textAlign="center">
        Checkout
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Cart Items */}
      <Typography variant="h6" mb={2}>
        Cart Items
      </Typography>
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
                <Typography>
                  Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          ))}
          <Typography variant="h6">Total: ₹{totalAmount.toFixed(2)}</Typography>
        </Box>
      )}

      {/* Address Selection */}
      <Typography variant="h6" mb={2}>
        Select Delivery Address
      </Typography>
      {loadingAddresses ? (
        <CircularProgress />
      ) : addresses.length === 0 ? (
        <Typography>No addresses found. Add one in your profile.</Typography>
      ) : (
        <FormControl component="fieldset">
          <RadioGroup
            value={selectedAddress}
            onChange={(e) => handleAddressSelect(Number(e.target.value))}
          >
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
    {placingOrder
      ? "Placing Order..."
      : `Place Order (₹${finalAmount.toFixed(2)})`}
  </Button>
</Box>

    </Box>
  );
}
