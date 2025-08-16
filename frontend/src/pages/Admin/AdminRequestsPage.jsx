import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FiClock, FiCheckCircle, FiXCircle, FiEye } from "react-icons/fi";

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const API_URL = "http://localhost:5000/api/admin/auth";

  useEffect(() => {
    fetchCurrentUser();
    fetchRequests();
    
    // Set up periodic refresh every 30 seconds to keep review status updated
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/current-user/",
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setCurrentUser(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/under-review-requests/`, {
        withCredentials: true,
      });

      if (response.data.success) {
        console.log("API Response:", response.data);
        const allRequests = response.data.users || [];
        console.log("All requests:", allRequests);

        // Debug photo URLs
        allRequests.forEach((req, index) => {
          console.log(`Request ${index} photo:`, req.photograph);
        });

        setRequests(allRequests);
      } else {
        setError("Failed to fetch requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      console.error("Error details:", error.response?.data);
      setError(
        `Failed to fetch requests: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = async (request) => {
    console.log("handleRequestClick called with request:", request);
    console.log("request.userId:", request.userId);
    console.log("request.userId type:", typeof request.userId);
    
    // Check if someone else is already reviewing
    if (request.currentlyReviewingBy && String(request.currentlyReviewingBy.id) !== String(currentUser?._id)) {
      toast.error(`This request is currently being reviewed by ${request.currentlyReviewingBy.name}`);
      return;
    }
    
    try {
      // Start reviewing the request
      const response = await axios.post(
        `${API_URL}/requests/start-review/${request._id}/`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success("Review started successfully");
        navigate(`/ws/admin/requests/review/${request.userId}`);
      } else {
        toast.error(response.data.message || "Failed to start review");
      }
    } catch (error) {
      console.error("Error starting review:", error);
      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to start review. Please try again.");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "under_review":
        return (
          <span className="badge bg-warning d-flex align-items-center gap-1">
            <FiClock size={12} />
            Under Review
          </span>
        );
      case "approved":
        return (
          <span className="badge bg-success d-flex align-items-center gap-1">
            <FiCheckCircle size={12} />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="badge bg-danger d-flex align-items-center gap-1">
            <FiXCircle size={12} />
            Rejected
          </span>
        );
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getReviewerInfo = (request) => {
    if (request.reviewedBy && currentUser?.role === "superadmin") {
      return (
        <small className="text-muted">
          Reviewed by: {request.reviewedBy.name} on{" "}
          {new Date(request.reviewedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })}
        </small>
      );
    }
    return null;
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/[^\d+]/g, "");

    if (!cleaned.startsWith("+91") || cleaned.length !== 13) {
      return phone;
    }

    const countryCode = "+91";
    const numberPart = cleaned.slice(3);

    const firstPart = numberPart.slice(0, 5);
    const secondPart = numberPart.slice(5);

    return `${countryCode} ${firstPart} ${secondPart}`;
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={fetchRequests}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4
                className="mb-1"
                style={{ color: "#121212", fontWeight: "500" }}
              >
                Freelancer Profile Reviews
              </h4>
              <p className="text-muted mb-0">
                {currentUser?.role === "superadmin"
                  ? "Monitor all profile reviews and admin activities"
                  : "Review freelancer profiles and approve/reject applications"}
              </p>
            </div>
            <div className="d-flex align-items-center">
              <button
                className="post-button"
                onClick={fetchRequests}
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="text-center p-5">
              <div className="alert alert-info" role="alert">
                <h4 className="alert-heading">No Requests Found</h4>
                <p>There are currently no freelancer profile requests found.</p>
              </div>
            </div>
          ) : (
            <div className="cardd shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr className="text-center">
                        <th scope="col">Name</th>
                        <th scope="col">Title</th>
                        <th scope="col">Location</th>
                        <th scope="col">Submitted</th>
                        <th scope="col">Reviewed</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => (
                        <tr
                          key={request._id}
                          className="text-center"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleRequestClick(request)}
                        >
                          <td className="text-center">
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm me-3">
                                <img
                                  src={
                                    request.photograph
                                      ? `http://localhost:5000${request.photograph}`
                                      : "https://via.placeholder.com/40"
                                  }
                                  alt="Profile"
                                  className="rounded-circle"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                  }}
                                  onError={(e) => {
                                    console.log(
                                      "Image failed to load:",
                                      request.photograph
                                    );
                                    e.target.src =
                                      "https://via.placeholder.com/40";
                                  }}
                                />
                              </div>
                              <div>
                                <div className="fw-bold">{request.name}</div>
                                <small className="text-muted">
                                  ID: {request._id}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {request.title || "No title provided"}
                            </div>
                          </td>
                          <td>
                            <small className="text-muted">
                              {request.state}, {request.country}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(request.submittedAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit",
                                }
                              )}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {request.currentlyReviewingBy ? (
                                <span className="text-dark">
                                  Reviewing by {request.currentlyReviewingBy.name}
                                </span>
                              ) : request.reviewedAt ? (
                                new Date(request.reviewedAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit",
                                })
                              ) : (
                                "Not reviewed"
                              )}
                            </small>
                          </td>
                          <td>
                            <div className="" role="group">
                              <button
                                className={`post-button ${request.currentlyReviewingBy && String(request.currentlyReviewingBy.id) !== String(currentUser?._id) ? 'disabled' : ''}`}
                                style={{
                                  opacity: request.currentlyReviewingBy && String(request.currentlyReviewingBy.id) !== String(currentUser?._id) ? 0.6 : 1,
                                  cursor: request.currentlyReviewingBy && String(request.currentlyReviewingBy.id) !== String(currentUser?._id) ? 'not-allowed' : 'pointer'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRequestClick(request);
                                }}
                                disabled={request.currentlyReviewingBy && String(request.currentlyReviewingBy.id) !== String(currentUser?._id)}
                                title={
                                  request.currentlyReviewingBy && String(request.currentlyReviewingBy.id) !== String(currentUser?._id)
                                    ? `Currently being reviewed by ${request.currentlyReviewingBy.name}`
                                    : "Review Profile"
                                }
                              >
                                <FiEye className="me-1" />
                                {request.currentlyReviewingBy && String(request.currentlyReviewingBy.id) === String(currentUser?._id)
                                  ? "Continue Review"
                                  : "Review"
                                }
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequestsPage;
