import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const checkAuth = () => {
      try {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const userData = localStorage.getItem('user');
        
        if (isLoggedIn === 'true' && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear invalid data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('chatUserId'); // Also clear chat user ID
  };

  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
