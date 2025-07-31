import React from "react";
import Header2 from "../../components/Header2";
import { Outlet, useLocation } from "react-router-dom";

const FreelancersOverview = () => {
  const location = useLocation();

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
