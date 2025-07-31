import React from "react";
import AdminHeader from "../../components/AdminHeader";
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <>
      <AdminHeader />

      <div
        className="container-fluid d-flex align-items-center justify-content-center section-container"
        style={{ backgroundColor: "#fff", padding: "10px" }}
      >
        <div
          className="row shadow-lg rounded bg-white p-3 w-100"
          style={{ display: "flex", maxWidth: "1200px" }}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
