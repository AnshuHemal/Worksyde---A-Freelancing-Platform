import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export const RefreshHandler = ({ setIsAuthenticated }) => {
  // const location = useLocation();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   // Don't run authentication check on login/signup pages
  //   if (location.pathname === "/login" || location.pathname === "/signup") {
  //     return;
  //   }

  //   const checkAuthentication = async () => {
  //     try {
  //       const response = await axios.get(
  //         "http://localhost:5000/api/auth/verify/",
  //         {
  //           withCredentials: true,
  //         }
  //       );

  //       if (response.data.success) {
  //         setIsAuthenticated(true);

  //         // Only redirect if user is on home page and not on protected routes
  //         if (location.pathname === "/home" || location.pathname === "/") {
  //           // Get user role and navigate to appropriate dashboard
  //           const userRole = response.data.user?.role;

  //           if (userRole === "client") {
  //             navigate("/ws/client/dashboard", { replace: true });
  //           } else if (userRole === "freelancer") {
  //             navigate("/ws/", { replace: true });
  //           } else if (userRole === "admin") {
  //             navigate("/ws/admin/freelancers", { replace: true });
  //           } else if (userRole === "superadmin") {
  //             navigate("/ws/admin/admins", { replace: true });
  //           } else {
  //             // Fallback for unknown roles
  //             navigate("/", { replace: true });
  //           }
  //         }
  //         // If user is on login/signup pages and authenticated, let them stay there
  //         // They might want to switch accounts or access these pages for other reasons
  //       } else {
  //         setIsAuthenticated(false);
  //       }
  //     } catch (error) {
  //       setIsAuthenticated(false);
  //     }
  //   };

  //   checkAuthentication();
  // }, [location.pathname, navigate, setIsAuthenticated]);

  // return null;

  const location = useLocation();
  const navigate = useNavigate();
  

  useEffect(() => {
    // Don't run authentication check on login/signup pages
    if (location.pathname === "/login" || location.pathname === "/signup") {
      return;
    }

    const checkAuthentication = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/verify",
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setIsAuthenticated(true);
          if (
            location.pathname === "/login" ||
            location.pathname === "/signup" ||
            location.pathname === "/home"
          ) {
            const userRole = response.data.user?.role;

            if (userRole === "client") {
              navigate("/ws/client/dashboard", { replace: true });
            } else if (userRole === "freelancer") {
              navigate("/ws/find-work", { replace: true });
            } else if (userRole === "admin") {
              navigate("/ws/admin/freelancers", { replace: true });
            } else if (userRole === "superadmin") {
              navigate("/ws/admin/admins", { replace: true });
            } else {
              // Fallback for unknown roles
              navigate("/", { replace: true });
            }
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [location.pathname, navigate, setIsAuthenticated]);

  return null;
};
