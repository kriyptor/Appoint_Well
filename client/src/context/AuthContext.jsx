// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Predefined users for testing
const predefinedUsers = [
  { id: 1, name: 'Rajeev', email: 'user@example.com', password: 'user123', role: 'user' },
  { id: 2, name: 'Shivanshu', email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { id: 3, name: 'Ravi', email: 'staff@example.com', password: 'staff123', role: 'staff' }
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize auth state from localStorage if available
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [authError, setAuthError] = useState('');

  // Update localStorage when user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Login function
  const login = (email, password, role) => {
    // Clear any previous errors
    setAuthError('');
    
    // Find the user that matches the credentials
    const user = predefinedUsers.find(
      (user) => user.email === email && 
                user.password === password && 
                user.role === role
    );
    
    if (user) {
      // Remove password from the user object before storing
      const { password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      return true;
    } else {
      setAuthError('Invalid credentials. Please try again.');
      return false;
    }
  };

  // Sign up function (in a real app, this would connect to a backend)
  const signup = (name, email, password) => {
    // Check if email already exists
    const existingUser = predefinedUsers.find(user => user.email === email);
    
    if (existingUser) {
      setAuthError('Email already in use. Please use a different email.');
      return false;
    }
    
    // In a real app, you would add the user to a database
    // For this demo, we'll just login as a regular user
    console.log('New user would be created:', { name, email, role: 'user' });
    
    // Find the predefined user with the 'user' role
    const regularUser = predefinedUsers.find(user => user.role === 'user');
    
    if (regularUser) {
      const { password, ...userWithoutPassword } = regularUser;
      setCurrentUser(userWithoutPassword);
      return true;
    }
    
    return false;
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
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
    authError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};