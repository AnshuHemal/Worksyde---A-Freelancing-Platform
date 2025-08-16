import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/worksyde.png";
import toast from "react-hot-toast";
import { useUser } from "../contexts/UserContext";
import { useState, useEffect } from "react";

const AdminHeader = () => {
  const { logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = "http://localhost:5000/api/auth";
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get current user role from context or API
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setUserRole(response.data.user.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, [API_URL]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      navigate("/");
      toast.success("Successfully Logged out..");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Helper function to check active route
  const isActive = (path) => location.pathname.includes(path);

  // Render navigation items based on user role
  const renderNavigationItems = () => {
    if (userRole === "superadmin") {
      // Superadmin sees all tabs
      return (
        <>
          <li className="nav-item">
            <Link
              className={`nav-link mx-lg-2 ${
                isActive("admins") ? "active" : ""
              }`}
              to="admins"
            >
              Admins
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link mx-lg-2 ${
                isActive("freelancers") ? "active" : ""
              }`}
              to="freelancers"
            >
              Freelancers
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link mx-lg-2 ${
                isActive("clients") ? "active" : ""
              }`}
              to="clients"
            >
              Clients
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link mx-lg-2 ${
                isActive("skills") ? "active" : ""
              }`}
              to="skills"
            >
              Skills
            </Link>
          </li>
          {/* <li className="nav-item">
            <Link
              className={`nav-link mx-lg-2 ${
                isActive("specialities") ? "active" : ""
              }`}
              to="specialities"
            >
              Specialities
            </Link>
          </li> */}
          <li className="nav-item">
            <Link
              className={`nav-link mx-lg-2 ${
                isActive("requests") ? "active" : ""
              }`}
              to="requests"
            >
              Requests
            </Link>
          </li>
        </>
      );
    } else if (userRole === "admin") {
      // Admin sees limited tabs
      return (
        <>
          <li className="nav-item">
            <Link
              className={`nav-link mx-lg-2 ${
                isActive("freelancers") ? "active" : ""
              }`}
              to="freelancers"
            >
              Freelancers
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link mx-lg-2 ${
                isActive("clients") ? "active" : ""
              }`}
              to="clients"
            >
              Clients
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link mx-lg-2 ${
                isActive("requests") ? "active" : ""
              }`}
              to="requests"
            >
              Requests
            </Link>
          </li>
        </>
      );
    } else {
      // Loading state or fallback
      return (
        <li className="nav-item">
          <span className="nav-link">Loading...</span>
        </li>
      );
    }
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand me-auto" to="freelancers">
          <img src={logo} alt="Worksyde Logo" height={40} />
        </Link>

        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
              <img src={logo} alt="Worksyde Logo" height={40} />
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav justify-content-center flex-grow-1 pe-3">
              {renderNavigationItems()}
            </ul>
          </div>
        </div>

        <div className="d-flex align-items-center">
          <span className="me-3 text-muted">
            Role: {userRole === "superadmin" ? "Super Admin" : userRole === "admin" ? "Admin" : "Loading..."}
          </span>
          <button className="login-button border-0 me-3" style={{fontSize: '16px'}} onClick={handleLogout}>
            Logout
          </button>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default AdminHeader;
