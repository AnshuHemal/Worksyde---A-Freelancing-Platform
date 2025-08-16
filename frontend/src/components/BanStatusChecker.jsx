import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';

const BanStatusChecker = () => {
  const { userData, error, logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is banned based on UserContext error
    if (error && error.includes('Account Banned:')) {
      console.log('User has been banned, logging out...');
      
      // Show ban notification
      toast.error(error);
      
      // Logout the user
      logout();
      
      // Redirect to login page
      navigate('/login');
    }
  }, [error, logout, navigate]);

  // This component doesn't render anything
  return null;
};

export default BanStatusChecker; 