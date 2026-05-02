import { createContext, useState, useEffect } from "react";
import { getMeApi } from "./services/auth.api";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [authLoading, setAuthLoading] = useState(false);


    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await getMeApi();
                setUser(res.user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);


    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading,authLoading,setAuthLoading }}>{children}</AuthContext.Provider>
    )
}
