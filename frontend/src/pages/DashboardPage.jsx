import React, { useEffect, useState } from "react";
import FreelancersDashboard from "./Freelancers/FreelancersDashboard";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    axios
      .get(`${API_URL}/current-user/`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      });
  }, []);

  if (!user) {
    return (
      <div className="text-center mt-5">
        <p>Fetching User details...</p>
      </div>
    );
  }

  if (user.role == "client") {
    navigate("/ws/client/dashboard");
    return;
  } else if (user.role == "freelancer") {
    navigate("/ws/find-work");
    return;
  } else if (user.role == "admin") {
    navigate("/ws/admin/overview");
    return;
  }
  return <div>Fetching User details...</div>;
};

export default DashboardPage;
