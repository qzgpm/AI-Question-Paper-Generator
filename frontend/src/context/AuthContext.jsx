import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set default axios base configuration
    axios.defaults.withCredentials = true;

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('/accounts/api/me/');
            if (response.data.is_authenticated) {
                setUser(response.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = async (email, password) => {
        try {
            // First get CSRF cookie
            await axios.get('/accounts/api/csrf/');

            const response = await axios.post('/accounts/api/login/', {
                email,
                password
            });

            if (response.data.status === 'success') {
                setUser(response.data.user);
                return { success: true };
            }
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error("Login failed:", error);
            return {
                success: false,
                error: error.response?.data?.error || "Login failed. Please try again."
            };
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const response = await axios.post('/accounts/api/register/', {
                name,
                email,
                password,
                role
            });

            if (response.data.status === 'success') {
                return { success: true };
            }
            return { success: false, error: response.data.error };
        } catch (error) {
            console.error("Registration failed:", error);
            return {
                success: false,
                error: error.response?.data?.error || "Registration failed. Please try again."
            };
        }
    };

    const logout = async () => {
        try {
            await axios.get('/accounts/api/logout/');
            setUser(null);
            return { success: true };
        } catch (error) {
            console.error("Logout failed:", error);
            return { success: false };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
