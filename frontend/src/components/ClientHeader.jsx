import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/worksyde.png";
import { RiChatSmileAiLine } from "react-icons/ri";
import { BsBell } from "react-icons/bs";
import { TfiHelp } from "react-icons/tfi";
import { LuCircleUser, LuSettings } from "react-icons/lu";
import { MdOutlineLightMode } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const ClientHeader = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const toggleDropdown = () => setShowDropdown((prev) => !prev);
  const navigate = useNavigate();
  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/logout/`,
        {},
        { withCredentials: true }
      );
      if (response?.data?.success) {
        navigate("/");
        toast.success("Successfully Logged out..");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand me-auto" to={"ws/client/dashboard"}>
          <img src={logo} alt="Worksyde Logo" height={40} />
        </Link>
        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasNavbarClient"
          aria-labelledby="offcanvasNavbarLabelClient"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabelClient">
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
              <li className="nav-item">
                <Link className="nav-link active mx-lg-2" to={"/ws/client/dashboard"}>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-lg-2" to={"/job-post/instant/welcome"}>
                  Post a Job
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-lg-2" to={"/ws/client/messages"}>
                  Messages
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-lg-2" to={"/client/my-jobs"}>
                  My Jobs
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className=" d-flex align-items-center gap-4 me-3">
          <TfiHelp className="icon-hover" size={20} />
          <BsBell className="icon-hover" size={20} />
          <img
            src={logo}
            alt="Profile"
            className="rounded-circle"
            height={32}
            width={32}
            style={{ objectFit: "cover", cursor: "pointer" }}
            onClick={toggleDropdown}
          />
          {showDropdown && (
            <div ref={dropdownRef} className="profile-dropdown shadow-sm">
              <div className="profile-header d-flex align-items-center gap-3">
                <img
                  src={logo}
                  className="rounded-circle"
                  height={40}
                  width={40}
                />
                <div>
                  <div style={{ fontWeight: "600" }}>Client User</div>
                  <div className="text-muted" style={{ fontSize: "14px" }}>
                    Client
                  </div>
                </div>
              </div>
              <div className="dropdown-item d-flex justify-content-between align-items-center">
                Online for messages
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultChecked
                  />
                </div>
              </div>
              <div className="dropdown-divider mb-2" />
              <Link to="/client/profile" className="dropdown-item align-items-center">
                <LuCircleUser
                  style={{ width: "20px", height: "18px" }}
                  className="me-2"
                />{" "}
                Your Profile
              </Link>
              <div className="dropdown-item d-flex justify-content-between align-items-center">
                <div>
                  <MdOutlineLightMode
                    style={{ width: "20px", height: "18px" }}
                    className="me-2"
                  />
                  Theme: Light
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultChecked
                  />
                </div>
              </div>
              <Link to="/client/settings" className="dropdown-item">
                <LuSettings
                  style={{ width: "20px", height: "18px" }}
                  className="me-2"
                />
                Account settings
              </Link>
              <div className="dropdown-divider my-2" />
              <a
                className="dropdown-item text-danger"
                onClick={handleLogout}
              >
                <FiLogOut
                  style={{ width: "20px", height: "18px" }}
                  className="me-2 logout-icon"
                />
                Log out
              </a>
            </div>
          )}
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbarClient"
          aria-controls="offcanvasNavbarClient"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default ClientHeader; 