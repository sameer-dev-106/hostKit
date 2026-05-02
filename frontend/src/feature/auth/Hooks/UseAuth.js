import { useContext } from "react";
import AuthContext from "../auth.context";
import { registerApi, loginApi, getMeApi, } from "../services/auth.api";

export const useAuth = () => {
    const { user, setUser, loading, setLoading, setAuthLoading } = useContext(AuthContext);

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

    async function handleGetMe() {
        setLoading(true);
        try {
            const data = await getMeApi();
            if (data?.user) {
                setUser(data.user);
            }
            return data?.user;
        } catch (error) {
            setUser(null);
            console.log(error);
            return null;
        } finally {
            setLoading(false);
        }
    }

    return {
        user,
        loading,
        handleLogin,
        handleRegister,
        handleGetMe
    };
};