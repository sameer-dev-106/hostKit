import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { registerApi, loginApi, } from "../services/auth.api";
import { useEffect } from "react";

export const useAuth = () => {
    const { user, setUser, loading, setLoading, authLoading,setAuthLoading  } = useContext(AuthContext);

    const handleRegister = async (username, email, password) => {
        try {
            setAuthLoading(true);

            const response = await registerApi(username, email, password);
            setUser(response.user);

        } catch (err) {
            console.log(err);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogin = async (email, password) => {
        try {
            setAuthLoading(true);

            const response = await loginApi(email, password);
            setUser(response.user);

        } catch (err) {
            console.log(err);
        } finally {
            setAuthLoading(false);
        }
    };

    return {
        user,
        loading,
        handleLogin,
        handleRegister
    };
};