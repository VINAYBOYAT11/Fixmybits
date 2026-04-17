import React, { createContext, useContext, useState, useEffect } from 'react';
import { API, Storage } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const clearSession = () => {
        Storage.remove('access_token');
        Storage.remove('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
    };

    const restoreSession = async () => {
        const token = Storage.get('access_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const userData = await API.get('/auth/me/');
            setUser(userData);
            setIsAuthenticated(true);
        } catch (err) {
            console.warn('Session restore failed:', err.message);
            clearSession();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        restoreSession();

        // Listen for 401s interceptor
        const handleAuthError = () => {
            clearSession();
        };

        window.addEventListener('auth-error', handleAuthError);
        return () => window.removeEventListener('auth-error', handleAuthError);
    }, []);

    const login = async (email, password) => {
        const data = await API.post('/auth/login/', { email, password });
        Storage.set('access_token', data.access);
        Storage.set('refresh_token', data.refresh);
        setUser(data.user);
        setIsAuthenticated(true);
        return data.user;
    };

    const register = async (userData) => {
        return await API.post('/auth/register/', userData);
    };

    const logout = async () => {
        try {
            const refresh = Storage.get('refresh_token');
            if (refresh) {
                await API.post('/auth/logout/', { refresh });
            }
        } catch (err) {
            console.warn('Logout API failed:', err.message);
        } finally {
            clearSession();
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
