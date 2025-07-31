import React from "react";
import { Outlet } from "react-router-dom";
import Header2 from "../../components/Header2";

const JobDetailsNewWindow = () => {
  return (
    <>
      <Header2 />
      <div
        className="container-fluid d-flex align-items-center justify-content-center section-container"
        style={{ backgroundColor: "#fff", padding: "10px" }}
      >
        <div
          className="row rounded bg-white p-3 w-100 justify-content-center align-items-center"
          // style={{ maxWidth: "1200px" }}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default JobDetailsNewWindow;
