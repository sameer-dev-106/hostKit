import { useAuth } from "../feature/auth/Hooks/UseAuth";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;

    if (!user) return <Navigate to="/login" />;

    return children;
};

export default ProtectedRoute;