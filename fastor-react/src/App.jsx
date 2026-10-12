import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DesktopShell from "./components/DesktopShell";
import { DesktopProvider } from "./context/DesktopContext";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import RestaurantHome from "./pages/RestaurantHome";
import FoodDetails from "./pages/FoodDetails";
import { getStoredToken } from "./utils/token";

/**
 * Wraps routes that require authentication.
 * If no JWT is found in localStorage, redirects to /signup.
 */
function ProtectedRoute({ children }) {
    const token = getStoredToken();
    if (!token) {
        return <Navigate to="/signup" replace />;
    }
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <DesktopProvider>
                <DesktopShell>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/verify" element={<VerifyOtp />} />

                        {/* Protected routes */}
                        <Route
                            path="/restaurant"
                            element={
                                <ProtectedRoute>
                                    <RestaurantHome />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/food-details"
                            element={
                                <ProtectedRoute>
                                    <FoodDetails />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default */}
                        <Route path="/" element={<Navigate to="/signup" replace />} />
                        <Route path="*" element={<Navigate to="/signup" replace />} />
                    </Routes>
                </DesktopShell>
            </DesktopProvider>
        </BrowserRouter>
    );
}