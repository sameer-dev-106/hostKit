import { BrowserRouter, Routes, Route } from "react-router-dom";

import RootRedirect from "./components/RootRedirect";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./feature/auth/pages/Login";
import Register from "./feature/auth/pages/Register";
import Dashboard from "./feature/dashboard/pages/Dashboard";

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RootRedirect />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>} />
                
            </Routes>
        </BrowserRouter>
    )

}