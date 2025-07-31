import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminRequestsPage = () => {
  const [users, setUsers] = useState([
    { name: "Hemal Katariya", title: "Full Stack Developer", photograph: "image" },
    { name: "Anshu Katariya", title: "MERN Stack Developer", photograph: "image" },
    { name: "Hemal Katariya", title: "Full Stack Developer", photograph: "image" },
  ]);
  const navigate = useNavigate();
  const API_URL = "http://localhost:5000/api/admin/auth";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/under-review-requests/`);
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          console.error("Failed to fetch users:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleCardClick = (userId) => {
    navigate(`/ws/admin/requests/review/~${userId}`);
  };

  return (
    <>
      <h4
        className="my-3 about-one-heading-text text-start"
        style={{ lineHeight: "2.6rem" }}
      >
        Freelancers are waiting for your review !! <br />
        Admin, please review them.
      </h4>

      <div className="d-flex flex-wrap gap-2 justify-content-evenly">
        {users.length === 0 ? (
          <p>No users under review.</p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="d-flex align-items-center requests-profile px-3 py-3"
              onClick={() => handleCardClick(user._id)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={user.photograph || "https://via.placeholder.com/50"}
                alt="Profile"
                className="profile-img me-3"
                style={{
                  width: "70px",
                  height: "70px",
                  objectFit: "contain",
                  borderRadius: "50%",
                }}
              />
              <div>
                <h6
                  className="mb-1"
                  style={{
                    color: "#007476",
                    fontWeight: "500",
                    fontSize: "22px",
                  }}
                >
                  {user.name}
                </h6>
                <p
                  className="m-0 mb-2"
                  style={{
                    color: "#121212",
                    fontSize: "18px",
                    fontWeight: "500",
                  }}
                >
                  {user.title || "No title found"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default AdminRequestsPage;
