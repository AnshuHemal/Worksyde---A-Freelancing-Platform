import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export const RefreshHandler = ({ setIsAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't run authentication check on login/signup pages
    if (location.pathname === "/login" || location.pathname === "/signup") {
      console.log("RefreshHandler: Skipping auth check on login/signup page");
      return;
    }

    const checkAuthentication = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/verify/",
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          console.log("RefreshHandler: User is authenticated, current path:", location.pathname);
          setIsAuthenticated(true);
          
          // Only redirect if user is on home page and not on protected routes
          if (location.pathname === "/home" || location.pathname === "/") {
            // Get user role and navigate to appropriate dashboard
            const userRole = response.data.user?.role;
            console.log("RefreshHandler: User authenticated with role:", userRole);
            
            if (userRole === "client") {
              navigate("/ws/client/dashboard", { replace: true });
            } else if (userRole === "freelancer") {
              navigate("/ws/", { replace: true });
            } else if (userRole === "admin") {
              navigate("/ws/admin/freelancers", { replace: true });
            } else if (userRole === "superadmin") {
              navigate("/ws/admin/admins", { replace: true });
            } else {
              // Fallback for unknown roles
              navigate("/", { replace: true });
            }
          }
          // If user is on login/signup pages and authenticated, let them stay there
          // They might want to switch accounts or access these pages for other reasons
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log("RefreshHandler: Authentication check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [location.pathname, navigate, setIsAuthenticated]);

  return null;
};
