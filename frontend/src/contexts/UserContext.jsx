import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:5000/api/auth";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/current-user/`, { 
        withCredentials: true 
      });
      
      const currentUser = response.data.user;
      
      // Only set user data if we get a valid response
      if (currentUser && currentUser._id) {
        // Check if this is a different user than what we have stored
        const storedUserId = localStorage.getItem('currentUserId');
        if (storedUserId && storedUserId !== currentUser._id) {
          console.log("Different user detected, clearing old data");
          clearUserData();
        }
        
        setUserId(currentUser._id);
        setUserData(currentUser);
        
        // Store in localStorage for persistence
        localStorage.setItem('currentUserId', currentUser._id);
        localStorage.setItem('currentUserData', JSON.stringify(currentUser));
      } else {
        // If no valid user data, clear everything
        clearUserData();
      }
      
    } catch (err) {
      console.error("Error fetching current user:", err);
      
      // If it's an authentication error (401, 403), clear user data
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        console.log("Authentication failed, clearing user data");
        clearUserData();
        setError("Authentication failed. Please log in again.");
      } else {
        setError("Failed to load user data. Please try again.");
        
        // Only try localStorage fallback for network errors, not auth errors
        const storedUserId = localStorage.getItem('currentUserId');
        const storedUserData = localStorage.getItem('currentUserData');
        
        if (storedUserId && storedUserData) {
          try {
            const parsedData = JSON.parse(storedUserData);
            // Verify the stored data is valid
            if (parsedData && parsedData._id) {
              setUserId(storedUserId);
              setUserData(parsedData);
            } else {
              clearUserData();
            }
          } catch (parseError) {
            console.error("Error parsing stored user data:", parseError);
            clearUserData();
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    await fetchCurrentUser();
  };

  const clearUserData = () => {
    console.log("Clearing user data from context and localStorage");
    setUserId(null);
    setUserData(null);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserData');
    
    // Also clear any other user-related data that might be cached
    localStorage.removeItem('userType');
    localStorage.removeItem('userRole');
    
    // Clear any other potential cached data
    localStorage.removeItem('onlineStatus');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('lastSeen');
  };

  const logout = async () => {
    try {
      // Call logout endpoint if available
      await axios.post(`${API_URL}/logout/`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      // Always clear local data regardless of server response
      clearUserData();
    }
  };

  useEffect(() => {
    // Check if we have cached user data first
    const storedUserId = localStorage.getItem('currentUserId');
    const storedUserData = localStorage.getItem('currentUserData');
    
    if (storedUserId && storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        // Verify the stored data is valid
        if (parsedData && parsedData._id) {
          setUserId(storedUserId);
          setUserData(parsedData);
          setLoading(false);
        } else {
          // Invalid stored data, fetch fresh data
          fetchCurrentUser();
        }
      } catch (parseError) {
        console.error("Error parsing stored user data:", parseError);
        // Invalid stored data, fetch fresh data
        fetchCurrentUser();
      }
    } else {
      // No cached data, fetch from API
      fetchCurrentUser();
    }
  }, []);

  const value = {
    userId,
    userData,
    loading,
    error,
    refreshUserData,
    clearUserData,
    logout,
    fetchCurrentUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 