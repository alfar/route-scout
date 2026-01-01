import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    isAuthenticated: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use the backend API URL (proxied through Vite)
const API_BASE_URL = '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch('/auth/user', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                // User is not authenticated - this is OK for public pages
                setUser(null);
            }
        } catch (error) {
            // Network error or auth service unavailable - treat as unauthenticated
            console.debug('Auth check failed (expected for public pages):', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        // Redirect to backend auth endpoint with returnUrl
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/auth/login/google?returnUrl=${returnUrl}`;
    };

    const logout = async () => {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                setUser(null);
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
