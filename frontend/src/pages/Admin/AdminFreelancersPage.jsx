import React, { useState, useEffect } from "react";
import axios from "axios";
import BanModal from "../../components/BanModal";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const AdminFreelancersPage = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [banModal, setBanModal] = useState({
    isOpen: false,
    user: null,
    action: null
  });
  const [showFreelancerDetailModal, setShowFreelancerDetailModal] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);

  const API_URL = "http://localhost:5000/api/admin/auth";

  useEffect(() => {
    fetchFreelancers();
    
    // Set up periodic refresh for online status (every 30 seconds)
    const interval = setInterval(() => {
      fetchFreelancers();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/freelancers/`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setFreelancers(response.data.freelancers);
      } else {
        setError("Failed to fetch freelancers");
      }
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      if (error.response?.status === 403) {
        setError("Access denied. Admin role required.");
      } else {
        setError("Failed to fetch freelancers");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleBanUser = (user, action) => {
    // Close the freelancer detail modal when opening ban modal
    setShowFreelancerDetailModal(false);
    setSelectedFreelancer(null);
    
    setBanModal({
      isOpen: true,
      user,
      action
    });
  };

  const handleBanSuccess = (message, updatedUser) => {
    // Update the user in the freelancers list
    setFreelancers(prevFreelancers => 
      prevFreelancers.map(freelancer => 
        freelancer._id === updatedUser._id 
          ? { ...freelancer, ...updatedUser }
          : freelancer
      )
    );
    
    // Also refresh the data from the server to ensure consistency
    setTimeout(() => {
      fetchFreelancers();
    }, 1000);
    
    toast.success(message);
  };

  const closeBanModal = () => {
    setBanModal({
      isOpen: false,
      user: null,
      action: null
    });
  };

  const handleFreelancerClick = (freelancer) => {
    setSelectedFreelancer(freelancer);
    setShowFreelancerDetailModal(true);
  };

  const closeFreelancerDetailModal = () => {
    setShowFreelancerDetailModal(false);
    setSelectedFreelancer(null);
  };

  const getOnlineStatusBadge = (onlineStatus) => {
    return onlineStatus === "online" ? (
      <span className="badge bg-success">
        Online
      </span>
    ) : (
      <span className="badge bg-secondary">
        Offline
      </span>
    );
  };

  const getVerificationBadge = (isVerified) => {
    return isVerified ? (
      <span className="badge bg-success">Verified</span>
    ) : (
      <span className="badge bg-warning">Not Verified</span>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading approved freelancers from requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={fetchFreelancers}>
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
              <h5 className="mb-0">Approved Freelancer Management</h5>
              <p className="text-muted mb-0">Manage all freelancers with approved status in their profile requests.</p>
            </div>
            <div className="d-flex align-items-center">
              <button
                className="post-button"
                onClick={fetchFreelancers}
                title="Refresh Freelancers List"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          {freelancers.length === 0 ? (
            <div className="text-center p-5">
              <div className="alert alert-info" role="alert">
                <h4 className="alert-heading">No Approved Freelancers Found</h4>
                <p>There are currently no freelancers with approved status in their profile requests.</p>
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
                        <th scope="col">Email</th>
                        <th scope="col">Status</th>
                        <th scope="col">Phone Verified</th>
                        <th scope="col">Reviewed by</th>
                        <th scope="col">Created</th>
                        <th scope="col">Last Login</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {freelancers.map((freelancer) => (
                        <tr 
                          key={freelancer._id}
                          className="text-center"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleFreelancerClick(freelancer)}
                        >
                          <td className="text-center">
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm me-3">
                                <div className="bg-success rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" 
                                     style={{width: '40px', height: '40px'}}>
                                  {freelancer.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div>
                                <div className="fw-bold">{freelancer.name}</div>
                                <small className="text-muted">ID: {freelancer._id}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {freelancer.email}
                            </div>
                          </td>
                          <td>{getOnlineStatusBadge(freelancer.onlineStatus)}</td>
                          <td className="text-center">
                            {freelancer.phoneVerified ? (
                              <span className="badge bg-success">Yes</span>
                            ) : (
                              <span className="badge bg-warning">No</span>
                            )}
                          </td>
                          <td className="text-center">
                            <small className="text-muted">
                              {freelancer.reviewedBy ? freelancer.reviewedBy.name : "Not reviewed"}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(freelancer.createdAt)}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(freelancer.lastLogin)}
                            </small>
                          </td>
                          <td>
                            <div className="" role="group">
                              {freelancer.isBanned === true ? (
                                <button className="post-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBanUser(freelancer, 'unban');
                                  }}
                                  title="Unban User"
                                >
                                  <i className="fas fa-user-check me-1"></i>
                                  Unban
                                </button>
                              ) : (
                                <button
                                  className="post-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBanUser(freelancer, 'ban');
                                  }}
                                  title="Ban User"
                                >
                                  <i className="fas fa-user-slash me-1"></i>
                                  Ban
                                </button>
                              )}
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

      {/* Freelancer Detail Modal */}
      {showFreelancerDetailModal && selectedFreelancer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={closeFreelancerDetailModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e6e6e6",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexShrink: 0,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                Freelancer Details
              </h3>
              <motion.button
                onClick={closeFreelancerDetailModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#666",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  color: "#1a1a1a",
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              <div style={{ marginBottom: "24px" }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "16px", 
                  marginBottom: "20px",
                  padding: "16px",
                  background: "#f8f9fa",
                  borderRadius: "8px"
                }}>
                  <div className="bg-success rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" 
                       style={{width: '60px', height: '60px', fontSize: '24px'}}>
                    {selectedFreelancer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#1a1a1a" }}>
                      {selectedFreelancer.name}
                    </h4>
                    <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
                      Freelancer
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "16px" }}>
                  <div style={{ 
                    padding: "16px", 
                    border: "1px solid #e6e6e6", 
                    borderRadius: "8px",
                    background: "#fff"
                  }}>
                    <h5 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#1a1a1a" }}>
                      Contact Information
                    </h5>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666", fontWeight: "500" }}>Email:</span>
                        <span style={{ color: "#1a1a1a", fontWeight: "500" }}>{selectedFreelancer.email}</span>
                      </div>
                      {selectedFreelancer.phone && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#666", fontWeight: "500" }}>Phone:</span>
                          <span style={{ color: "#1a1a1a", fontWeight: "500" }}>{selectedFreelancer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ 
                    padding: "16px", 
                    border: "1px solid #e6e6e6", 
                    borderRadius: "8px",
                    background: "#fff"
                  }}>
                    <h5 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#1a1a1a" }}>
                      Account Status
                    </h5>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666", fontWeight: "500" }}>Verification:</span>
                        <span>{getVerificationBadge(selectedFreelancer.isverified)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666", fontWeight: "500" }}>Phone Verified:</span>
                        <span>
                          {selectedFreelancer.phoneVerified ? (
                            <span className="badge bg-success">Yes</span>
                          ) : (
                            <span className="badge bg-warning">No</span>
                          )}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666", fontWeight: "500" }}>Account Status:</span>
                        <span>
                          {selectedFreelancer.isBanned ? (
                            <span className="badge bg-danger">Banned</span>
                          ) : (
                            <span className="badge bg-success">Active</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    padding: "16px", 
                    border: "1px solid #e6e6e6", 
                    borderRadius: "8px",
                    background: "#fff"
                  }}>
                    <h5 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#1a1a1a" }}>
                      Account Information
                    </h5>
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666", fontWeight: "500" }}>User ID:</span>
                        <span style={{ color: "#1a1a1a", fontWeight: "500", fontSize: "12px" }}>
                          {selectedFreelancer._id}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666", fontWeight: "500" }}>Created:</span>
                        <span style={{ color: "#1a1a1a", fontWeight: "500" }}>
                          {formatDate(selectedFreelancer.createdAt)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666", fontWeight: "500" }}>Last Login:</span>
                        <span style={{ color: "#1a1a1a", fontWeight: "500" }}>
                          {formatDate(selectedFreelancer.lastLogin)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "20px",
                flexShrink: 0,
              }}
            >
              <motion.button
                onClick={closeFreelancerDetailModal}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "none",
                  color: "#007674",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
              {selectedFreelancer.isBanned ? (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFreelancerDetailModal();
                    handleBanUser(selectedFreelancer, 'unban');
                  }}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "#28a745",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                  whileHover={{
                    background: "#218838",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-user-check me-1"></i>
                  Unban User
                </motion.button>
              ) : (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFreelancerDetailModal();
                    handleBanUser(selectedFreelancer, 'ban');
                  }}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "#dc3545",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                  whileHover={{
                    background: "#c82333",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-user-slash me-1"></i>
                  Ban User
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Ban/Unban Modal */}
      <BanModal
        isOpen={banModal.isOpen}
        onClose={closeBanModal}
        user={banModal.user}
        action={banModal.action}
        onSuccess={handleBanSuccess}
      />
    </div>
  );
};

export default AdminFreelancersPage;