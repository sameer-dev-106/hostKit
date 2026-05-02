import { useAuth } from "../feature/auth/Hooks/UseAuth";
import { Navigate } from "react-router-dom";

const RootRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;

    if (user) return <Navigate to="/dashboard" />;

    return <Navigate to="/register" />;
};

export default RootRedirect;