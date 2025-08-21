import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const RoleBasedRoute = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true
        });

        if (response.data.success && response.data.user) {
          const role = response.data.user.role;
          setUserRole(role);
          console.log("RoleBasedRoute: User role detected:", role);
          console.log("RoleBasedRoute: Full user data:", response.data.user);
          
          // Validate that role exists
          if (!role) {
            console.error("RoleBasedRoute: No role found for user");
            navigate("/", { replace: true });
            return;
          }
          
          // Additional validation - ensure user is properly authenticated
          if (!response.data.user._id) {
            console.error("RoleBasedRoute: User not properly authenticated");
            navigate("/", { replace: true });
            return;
          }
          
          // Check if user is trying to access unauthorized routes
          const currentPath = location.pathname;
          console.log("RoleBasedRoute: Current path:", currentPath);
          
          // Define allowed routes for each role
          const allowedRoutes = {
            freelancer: [
              '/ws/',
              '/ws/find-work',
              '/ws/messages',
              '/ws/proposals',
              '/ws/notifications',
              '/ws/ai-tools',
              '/ws/apps',
              '/ws/settings',
              '/ws/payments',
              '/ws/freelancers',
              '/create-profile',
              '/ws/proposals/interview',
              '/ws/offers',
              '/ws/apps/tarz'
            ],
            client: [
              '/ws/client/',
              '/ws/client/dashboard',
              '/ws/client/messages',
              '/ws/client/info',
              '/ws/client/deposit-method',
              '/ws/client/security',
              '/ws/client/notifications',
              '/ws/client/notification-alerts',
              '/ws/client/applicants',
              '/ws/client/offer',
              '/ws/client/payments',
              '/job-post/instant',
              '/ws/apps/tarz'
            ],
            admin: [
              '/ws/admin/',
              '/ws/admin/freelancers',
              '/ws/admin/clients',
              '/ws/admin/requests',
              '/ws/admin/admins',
              '/ws/admin/skills',
              '/ws/admin/specialities'
            ],
            superadmin: [
              '/ws/admin/',
              '/ws/admin/freelancers',
              '/ws/admin/clients',
              '/ws/admin/requests',
              '/ws/admin/admins',
              '/ws/admin/skills',
              '/ws/admin/specialities'
            ]
          };

          // Check if current path is allowed for user's role
          let isAllowed = false;
          
          // First check if the path matches any allowed routes
          isAllowed = allowedRoutes[role]?.some(route => {
            const matches = currentPath.startsWith(route);
            console.log(`RoleBasedRoute: Checking ${currentPath} against ${route}: ${matches}`);
            return matches;
          });
          
          // Additional checks to prevent cross-role access
          if (role === "freelancer" && currentPath.startsWith("/ws/client/")) {
            console.log("RoleBasedRoute: Freelancer trying to access client routes - BLOCKED");
            isAllowed = false;
          }
          
          // Allow shared routes for both clients and freelancers
          const sharedRoutes = ['/ws/apps/tarz'];
          const isSharedRoute = sharedRoutes.some(route => currentPath.startsWith(route));
          
          if (role === "client" && currentPath.startsWith("/ws/") && !currentPath.startsWith("/ws/client/") && !isSharedRoute) {
            console.log("RoleBasedRoute: Client trying to access freelancer routes - BLOCKED");
            isAllowed = false;
          }
          
          if ((role === "freelancer" || role === "client") && currentPath.startsWith("/ws/admin/")) {
            console.log(`RoleBasedRoute: ${role} trying to access admin routes - BLOCKED`);
            isAllowed = false;
          }

          console.log("RoleBasedRoute: Is path allowed for role", role, ":", isAllowed);
          console.log("RoleBasedRoute: Allowed routes for", role, ":", allowedRoutes[role]);

          if (!isAllowed) {
            console.log("RoleBasedRoute: Unauthorized access detected, redirecting...");

            // Redirect to appropriate dashboard based on role
            setTimeout(() => {
              if (role === "client") {
                navigate("/ws/client/dashboard", { replace: true });
              } else if (role === "freelancer") {
                navigate("/ws/", { replace: true });
              } else if (role === "admin") {
                navigate("/ws/admin/freelancers", { replace: true });
              } else if (role === "superadmin") {
                navigate("/ws/admin/admins", { replace: true });
              }
            }, 100);
            
            return;
          }
        } else {
          console.log("RoleBasedRoute: User not authenticated, redirecting to home");
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("RoleBasedRoute: Error checking user role:", error);
        // If there's an error, redirect to home page
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [location.pathname, navigate]);

  // Show loading while checking role
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Checking access permissions...</p>
      </div>
    );
  }

  return children;
};

export default RoleBasedRoute; 