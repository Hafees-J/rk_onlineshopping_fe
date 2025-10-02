import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CategoriesPage from "./pages/admin/CategoriesPage";
import SubCategoriesPage from "./pages/admin/SubCategoriesPage";
import ItemsPage from "./pages/admin/ItemsPage";
import ShopItemPage from "./pages/admin/ShopItemPage";
import ShopItemOfferPage from "./pages/admin/ShopItemOfferPage";

// Private Route Component
function PrivateRoute({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <CategoriesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/subcategories"
          element={
            <PrivateRoute>
              <SubCategoriesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/items"
          element={
            <PrivateRoute>
              <ItemsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/shopitems"
          element={
            <PrivateRoute>
              <ShopItemPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/shopitemoffers"
          element={
            <PrivateRoute>
              <ShopItemOfferPage />
            </PrivateRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
