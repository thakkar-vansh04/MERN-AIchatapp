import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the UserContext
export const UserContext = createContext();

// UserContext Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track initial load

  // Check for existing user data on mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      // Check localStorage first (remember me), then sessionStorage
      const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (savedUser && savedToken) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          // Clear both storages on error
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
        }
      }
      setIsLoading(false); // Done loading
    };

    loadUserFromStorage();
  }, []);

  const login = (userData, token, rememberMe = true) => {
    setUser(userData);

    // Clear both storages first
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');

    // Use localStorage for persistent login (remember me), sessionStorage otherwise
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(userData));
    storage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    // Clear both storages
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};