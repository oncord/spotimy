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
        console.log('Checking auth status at:', `${process.env.REACT_APP_API_URL}/status`);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/status`, {
          withCredentials: true
        });
        
        console.log('Auth status response:', response.data);
        
        if (response.data.isAuthenticated) {
          setIsAuthenticated(true);
          // Additional code...
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
    window.location.href = `${process.env.REACT_APP_API_URL}/login`;
  };

  const logout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/logout`, {
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
