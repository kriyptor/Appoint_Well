// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';



// Predefined users for testing
const predefinedUsers = [
  { id: 1, name: 'Rajeev', email: 'user@example.com', password: 'user123', role: 'user' },
  { id: 2, name: 'Shivanshu', email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { id: 3, name: 'Ravi', email: 'staff@example.com', password: 'staff123', role: 'staff' }
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  // Check if user is logged in on initial load
/*   useEffect(() => {
    const verifyToken = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await authApi.get('/verify-token');
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error('Token verification failed:', error);
        // Clear invalid token
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [authToken]); */

    // Initialize user from token
    useEffect(() => {
      const initializeAuth = () => {
        if (authToken) {
          try {
            // Decode JWT token to get user data
            const decodedToken = jwtDecode(authToken);
            
            // Check if token is expir
              setCurrentUser({
                id: decodedToken.id,
                name: decodedToken.name,
                role: decodedToken.role,
                email: decodedToken.email
              });

          } catch (error) {
            console.error('Token decode error:', error);
            localStorage.removeItem('token');
            setToken(null);
            setCurrentUser(null);
          }
        }
        setLoading(false);
      };
  
      initializeAuth();
    }, [authToken]);



  // Login function
  const login = async (email, password, role) => {
    setAuthError('');
    try {
      const response = await axios.post(`${BASE_URL}/auth/${role}/sign-in`, {
        email,
        password,
      });
      
      const token = response.data.token;
      setAuthToken(token);
      localStorage.setItem('authToken', token);
      return true;
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Sign up function (in a real app, this would connect to a backend)
  const signup = async (name, email, password, phoneNumber) => {
    setAuthError("");
    try {
      const response = await axios.post(`${BASE_URL}/auth/user/sign-up`, {
        name,
        email,
        phoneNumber,
        password,
      });
      if (response.status === 201) {
        return true;
      }
      return false;
    } catch (error) {
      setAuthError(error.response?.data?.message || "Registration failed");
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    setAuthToken(null);
  };

  // Check if user has a specific role
  const hasRole = (roles) => {
    if (!currentUser) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(currentUser.role);
    }
    
    return currentUser.role === roles;
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    hasRole,
    authError,
    authToken,
    loading,
    modalShow,
    setModalShow,
    walletBalance,
    setWalletBalance
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};