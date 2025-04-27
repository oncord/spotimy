// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/status`, {
          withCredentials: true
        });
        
        if (response.data.isAuthenticated) {
          setIsAuthenticated(true);
          // Get user profile
          const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/spotify/profile`, {
            withCredentials: true
          });
          setUser(profileResponse.data);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/spotify`;
  };

  const logout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        withCredentials: true
      });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};