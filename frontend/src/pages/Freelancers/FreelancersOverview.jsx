import React, { useEffect } from "react";
import Header2 from "../../components/Header2";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const FreelancersOverview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If we're at the root /ws/ path, redirect to find-work
    if (location.pathname === "/ws/") {
      console.log("Redirecting from /ws/ to /ws/find-work");
      navigate("/ws/find-work", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <>
      {!location.pathname.startsWith("/ws/messages") && <Header2 />}
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default FreelancersOverview;
