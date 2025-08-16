import React, { useEffect, useState } from "react";
import { CiLocationOn } from "react-icons/ci";
import { HiOutlineEnvelope, HiOutlinePhone } from "react-icons/hi2";
import { TbFileSymlink } from "react-icons/tb";
import { SlLocationPin } from "react-icons/sl";
import workExperience from "../../assets/work-experience.png";
import { IoCalendarOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const AdminRequestsReviewPage = () => {
  const { freelancerid } = useParams();
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = "http://localhost:5000/api/admin/auth";

  const [showTextarea, setShowTextarea] = useState(false);
  const [reason, setReason] = useState("");
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const handleRejectClick = () => {
    setShowTextarea(true);
  };

  const handleRejectCancel = () => {
    setShowTextarea(false);
    setReason("");
  };

  const handleRejectSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason.");
      return;
    }

    // Check if requestDetails and _id are available
    if (!requestDetails || !requestDetails._id) {
      console.error("requestDetails or _id is missing:", requestDetails);
      toast.error("Request details not loaded. Please refresh the page.");
      return;
    }

    try {
      // Check if user is authenticated by making a simple request first
      try {
        const authCheck = await axios.get("http://localhost:5000/api/auth/current-user/", {
          withCredentials: true
        });
        console.log("Auth check response:", authCheck.data);
      } catch (authError) {
        console.error("Auth check failed:", authError);
        toast.error("Authentication failed. Please log in again.");
        navigate("/login");
        return;
      }
      
      console.log("Sending reject request to:", `${API_URL}/requests/review/${requestDetails._id}/`);
      console.log("Request data:", { status: "rejected", reviewFeedback: reason });
      console.log("With credentials:", true);
      console.log("Cookies:", document.cookie);
      
      const response = await axios.post(
        `${API_URL}/requests/review/${requestDetails._id}/`,
        {
          status: "rejected",
          reviewFeedback: reason,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success("Applicant rejected..");
        setShowTextarea(false);
        setReason("");
        // Stop reviewing since review is completed
        try {
          await axios.post(
            `${API_URL}/requests/stop-review/${requestDetails._id}/`,
            {},
            { withCredentials: true }
          );
        } catch (error) {
          console.error("Error stopping review:", error);
        }
        navigate("/ws/admin/requests");
      } else {
        toast.error(response.data.message || "Failed to reject applicant.");
      }
    } catch (error) {
      console.error("Error rejecting applicant:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 403) {
        toast.error("Authentication required. Please log in again.");
      } else if (error.response?.status === 401) {
        toast.error("Unauthorized. Please check your permissions.");
      } else {
        toast.error(
          error.response?.data?.message ||
          "Server error while rejecting applicant."
        );
      }
    }
  };

  const handleApproveConfirm = async () => {
    // Check if requestDetails and _id are available
    if (!requestDetails || !requestDetails._id) {
      console.error("requestDetails or _id is missing:", requestDetails);
      toast.error("Request details not loaded. Please refresh the page.");
      return;
    }
    
    try {
      // Check if user is authenticated by making a simple request first
      try {
        const authCheck = await axios.get("http://localhost:5000/api/auth/current-user/", {
          withCredentials: true
        });
        console.log("Auth check response:", authCheck.data);
      } catch (authError) {
        console.error("Auth check failed:", authError);
        toast.error("Authentication failed. Please log in again.");
        navigate("/login");
        return;
      }
      
      console.log("Sending approve request to:", `${API_URL}/requests/review/${requestDetails._id}/`);
      console.log("Request data:", { status: "approved" });
      console.log("With credentials:", true);
      console.log("Cookies:", document.cookie);
      
      const response = await axios.post(
        `${API_URL}/requests/review/${requestDetails._id}/`,
        {
          status: "approved",
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success("Applicant approved..");
        setShowApproveConfirm(false);
        // Stop reviewing since review is completed
        try {
          await axios.post(
            `${API_URL}/requests/stop-review/${requestDetails._id}/`,
            {},
            { withCredentials: true }
          );
        } catch (error) {
          console.error("Error stopping review:", error);
        }
        navigate("/ws/admin/requests");
      } else {
        toast.error(response.data.message || "Failed to approve applicant.");
      }
    } catch (error) {
      console.error("Error approving applicant:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 403) {
        toast.error("Authentication required. Please log in again.");
      } else if (error.response?.status === 401) {
        toast.error("Unauthorized. Please check your permissions.");
      } else {
        toast.error(
          error.response?.data?.message ||
          "Server error while approving applicant."
        );
      }
    }
  };

  const handleApproveClick = () => {
    setShowApproveConfirm(true);
  };
  const handleApproveCancel = () => {
    setShowApproveConfirm(false);
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

  useEffect(() => {
    const fetchRequestDetails = async () => {
      console.log("useEffect triggered with freelancerid:", freelancerid);
      console.log("freelancerid type:", typeof freelancerid);
      console.log("freelancerid value:", freelancerid);
      
      if (!freelancerid) {
        console.error("No freelancerid provided");
        setError("No freelancer ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching request details for freelancerid:", freelancerid);
        
        const response = await axios.post(
          `${API_URL}/under-review-requests-by-userid/`,
          { userId: freelancerid },
          { withCredentials: true }
        );

        console.log("API Response:", response.data);

        if (response.data.success) {
          console.log("Request details received:", response.data.request);
          console.log("Request _id:", response.data.request._id);
          console.log("Request id:", response.data.request.id);
          console.log("Resume field:", response.data.request.resume);
          setRequestDetails(response.data.request);
          setError(null);
        } else {
          console.error("Failed to fetch:", response.data.message);
          setError(response.data.message || "Failed to fetch request details");
        }
      } catch (error) {
        console.error("Error fetching request details:", error);
        console.error("Error response:", error.response?.data);
        setError(
          error.response?.data?.message || 
          error.message || 
          "Failed to fetch request details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();

    // Cleanup function to stop reviewing when component unmounts
    return () => {
      if (requestDetails?._id) {
        // Stop reviewing when leaving the page
        axios.post(
          `${API_URL}/requests/stop-review/${requestDetails._id}/`,
          {},
          { withCredentials: true }
        ).catch(error => {
          console.error("Error stopping review:", error);
        });
      }
    };
  }, [freelancerid, requestDetails?._id]);

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading request details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger" 
            onClick={() => navigate("/ws/admin/requests")}
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  if (!requestDetails) {
    console.log("requestDetails is null/undefined, showing no request found message");
    return (
      <div className="text-center p-5">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">No Request Found</h4>
          <p>No request details found for this user.</p>
          <button 
            className="btn btn-outline-warning" 
            onClick={() => navigate("/ws/admin/requests")}
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }
  
  // Debug: Log requestDetails when rendering
  console.log("Rendering with requestDetails:", requestDetails);
  console.log("requestDetails._id:", requestDetails._id);

  return (
    <div className="profile-card p-4">
      <div className="row">
        <div className="col-md-8">
          <div className="d-flex align-items-end">
            <img
              src={requestDetails.photograph || "https://via.placeholder.com/150"}
              alt="Profile"
              className="profile-img me-3"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150";
              }}
            />
            <div>
              <h5
                className="mb-2"
                style={{
                  color: "#007476",
                  fontWeight: "600",
                  fontSize: "22px",
                }}
              >
                {requestDetails.userId?.name || "Unknown User"}
              </h5>
              <p
                className="m-0 mb-2"
                style={{
                  color: "#121212",
                  fontSize: "18px",
                  fontWeight: "500",
                }}
              >
                {requestDetails.title || "No title provided"}
              </p>
              <p
                className="m-0 mb-2"
                style={{
                  color: "#121212",
                  fontSize: "15px",
                  fontWeight: "500",
                }}
              >
                <CiLocationOn
                  style={{ width: "20px", height: "20px" }}
                  className="me-1"
                />
                {requestDetails.state && requestDetails.country ? (
                  `${requestDetails.state}, ${requestDetails.country}${requestDetails.postalCode ? ` - ${requestDetails.postalCode}` : ''}`
                ) : (
                  "Location not specified"
                )}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h5
              className="mb-2"
              style={{
                color: "#007476",
                fontWeight: "600",
                fontSize: "22px",
              }}
            >
              Summary
            </h5>
            <p
              className="m-0"
              style={{
                fontWeight: "500",
                color: "#121212",
                fontSize: "16px",
              }}
            >
              {requestDetails.bio ? (
                requestDetails.bio.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))
              ) : (
                "No bio provided"
              )}
            </p>
          </div>

          <div className="mt-3">
            <h5
              className="mb-2"
              style={{
                color: "#007476",
                fontWeight: "600",
                fontSize: "20px",
              }}
            >
              Skills
            </h5>
            <div className="skills">
              {requestDetails.skills && requestDetails.skills.length > 0 ? (
                requestDetails.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="badge text-black me-2 rounded-5 border card py-2 px-3 mt-2"
                    style={{
                      backgroundColor: "#fff",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    {skill.name}
                  </span>
                ))
              ) : (
                <p className="text-muted">No skills listed</p>
              )}
            </div>
          </div>

          <div className="mt-3">
            <h5
              className="mb-2"
              style={{
                color: "#007476",
                fontWeight: "600",
                fontSize: "20px",
              }}
            >
              Category
            </h5>
            <p
              className="m-0"
              style={{
                fontWeight: "500",
                color: "#121212",
                fontSize: "16px",
              }}
            >
              {requestDetails.categoryId ? requestDetails.categoryId.name : "No category specified"}
            </p>
          </div>

          <div className="mt-3">
            <h5
              className="mb-2"
              style={{
                color: "#007476",
                fontWeight: "600",
                fontSize: "20px",
              }}
            >
              Speciality
            </h5>
            <div className="skills">
              {requestDetails.specialities && requestDetails.specialities.length > 0 ? (
                requestDetails.specialities.map((skill, i) => (
                  <span
                    key={i}
                    className="badge text-black me-2 rounded-5 border card py-2 px-3 mt-2"
                    style={{
                      backgroundColor: "#fff",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    {skill.name}
                  </span>
                ))
              ) : (
                <p className="text-muted">No specialities listed</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="p-3 rounded border" style={{ borderColor: "#333" }}>
              <h5
                className="mb-2"
                style={{
                  color: "#007476",
                  fontWeight: "600",
                  fontSize: "20px",
                }}
              >
                Work Experience
              </h5>
              <div className="info-box">
                {requestDetails.workExperience && requestDetails.workExperience.length > 0 ? (
                  requestDetails.workExperience.map((exp, i) => (
                  <div className="mt-3" key={exp._id || i}>
                    <div className="d-flex gap-1 justify-content-between align-items-center">
                      <div className="d-flex gap-2">
                        <img
                          src={workExperience}
                          alt="work experience"
                          style={{
                            width: "40px",
                            objectFit: "contain",
                            padding: "3px",
                          }}
                        />
                        <div>
                          <div className="d-flex gap-2">
                            <h5
                              className="m-0"
                              style={{
                                color: "#121212",
                                fontWeight: "600",
                                fontSize: "18px",
                              }}
                            >
                              {exp.title}
                            </h5>{" "}
                            -
                            <p
                              className="m-0"
                              style={{
                                color: "#121212",
                                fontWeight: "500",
                                fontSize: "16px",
                                fontStyle: "italic",
                              }}
                            >
                              {exp.company}
                            </p>
                          </div>
                          <p
                            className="m-0 "
                            style={{
                              color: "#121212",
                              fontWeight: "600",
                              fontSize: "16px",
                            }}
                          >
                            {exp.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-end">
                        <p
                          className="m-0"
                          style={{
                            color: "#121212",
                            fontWeight: "600",
                            fontSize: "16px",
                          }}
                        >
                          {/* Format the date */}
                          {exp.startDate ? new Date(exp.startDate).toLocaleString("default", {
                            month: "short",
                            year: "numeric",
                          }) : "Unknown"}{" "}
                          - {exp.endDate ? 
                            (exp.endDate === "Present" ? "Present" : 
                             new Date(exp.endDate).toLocaleString("default", {
                               month: "short",
                               year: "numeric",
                             })
                            ) : "Present"}
                        </p>
                        <p
                          className="m-0"
                          style={{
                            color: "#121212",
                            fontWeight: "600",
                            fontSize: "16px",
                          }}
                        >
                          {exp.city && exp.country ? `${exp.city}, ${exp.country}` : "Location not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
                ) : (
                  <p className="text-muted">No work experience listed</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          {!showTextarea && !showApproveConfirm && (
            <div className="d-flex justify-content-end mb-3">
              <button
                className="post-button border-1 me-3"
                onClick={handleRejectClick}
                style={{ fontSize: "16px" }}
              >
                Reject Applicant
              </button>
              <button
                className="login-button border-0"
                onClick={handleApproveClick}
                style={{ fontSize: "16px" }}
              >
                Approve
              </button>
            </div>
          )}

          {/* Approve Confirmation Prompt */}
          {showApproveConfirm && (
            <div className="d-flex justify-content-end align-items-center mb-3">
              <span className="me-2 text-danger1" style={{ fontWeight: "500" }}>
                Approve Applicant?
              </span>
              <button
                className="post-button me-2"
                onClick={handleApproveConfirm}
              >
                Yes
              </button>
              <button className="post-button" onClick={handleApproveCancel}>
                No
              </button>
            </div>
          )}

          {/* Reject Textarea Prompt */}
          {showTextarea && (
            <div className="mb-3">
              <textarea
                rows="3"
                className="input-field"
                placeholder="Enter reason for rejection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  className="post-button border-1"
                  onClick={handleRejectSubmit}
                >
                  Submit
                </button>
                <button
                  className="post-button border-1"
                  onClick={handleRejectCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="p-3 rounded border" style={{ borderColor: "#333" }}>
            <div className="d-flex gap-2">
              <h5 style={{ color: "#007476" }}>
                ₹ {requestDetails.hourlyRate ? 
                  (typeof requestDetails.hourlyRate === 'number' ? 
                    requestDetails.hourlyRate.toFixed(2) : 
                    parseFloat(requestDetails.hourlyRate).toFixed(2)
                  ) : "0.00"}
              </h5>{" "}
              <span className="mt-3" style={{ color: "#121212", fontWeight: "500" }}>/ hr</span>
            </div>
            <div className="info-box">
              <div className="d-flex gap-1 align-items-start mb-2">
                <HiOutlineEnvelope
                  style={{ color: "#da8535", width: "18px", height: "20px" }}
                  className="me-2"
                />
                <p
                  className="m-0"
                  style={{
                    color: "#121212",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  {requestDetails.userId?.email || "No email provided"}
                </p>
              </div>
              <div className="d-flex gap-1 align-items-start mb-2">
                <SlLocationPin
                  style={{ color: "#da8535", width: "20px", height: "20px" }}
                  className="me-2"
                />
                <p
                  className="m-0"
                  style={{
                    color: "#121212",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  {requestDetails.streetAddress || "No address provided"}
                </p>
              </div>

              <div className="d-flex gap-1 align-items-start mb-2">
                <HiOutlinePhone
                  style={{ color: "#da8535", width: "18px", height: "20px" }}
                  className="me-2"
                />
                <p
                  className="m-0"
                  style={{
                    color: "#121212",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  {requestDetails.phone ? formatPhoneNumber(requestDetails.phone) : "No phone number provided"}
                </p>
              </div>
              <div className="d-flex gap-1 align-items-start mb-2">
                <IoCalendarOutline
                  style={{ color: "#da8535", width: "18px", height: "20px" }}
                  className="me-2"
                />
                <p
                  className="m-0"
                  style={{
                    color: "#121212",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  {requestDetails.dob ? new Date(requestDetails.dob).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }) : "No date of birth provided"}
                </p>
              </div>
              <p
                className="m-0"
                style={{
                  color: "#121212",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <TbFileSymlink
                  style={{ color: "#da8535", width: "18px", height: "20px" }}
                  className="me-1"
                />{" "}
                {requestDetails.resume && requestDetails.resume.trim() !== "" ? (
                  <a
                    href={requestDetails.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-a"
                    style={{ fontWeight: "500", fontSize: "16px" }}
                  >
                    View Resume
                  </a>
                ) : (
                  <span style={{ color: "#666", fontSize: "16px" }}>No resume uploaded</span>
                )}
              </p>
            </div>
          </div>

          <div
            className="p-3 rounded border mt-4"
            style={{ borderColor: "#333" }}
          >
            <h5
              className="mb-2"
              style={{
                color: "#007476",
                fontWeight: "600",
                fontSize: "20px",
              }}
            >
              Education
            </h5>
            <div className="mt-3">
              {requestDetails.education && requestDetails.education.length > 0 ? (
                requestDetails.education.map((edu) => (
                <div
                  key={edu._id}
                  className="d-flex gap-1 justify-content-between align-items-center mb-3"
                >
                  <div className="d-flex gap-1">
                    <div>
                      <div className="d-flex gap-2">
                        <h5
                          className="m-0"
                          style={{
                            color: "#121212",
                            fontWeight: "600",
                            fontSize: "18px",
                          }}
                        >
                          {edu.school || "Unknown School"}
                        </h5>{" "}
                        -
                        <p
                          className="m-0"
                          style={{
                            color: "#121212",
                            fontWeight: "500",
                            fontSize: "15px",
                            fontStyle: "italic",
                          }}
                        >
                          {edu.fieldOfStudy || "Unknown Field"}
                        </p>
                      </div>
                      <p
                        className="m-0"
                        style={{
                          color: "#121212",
                          fontWeight: "600",
                          fontSize: "16px",
                        }}
                      >
                        {edu.description || "No description provided"}
                      </p>
                    </div>
                  </div>

                  <div className="text-end">
                    <p
                      className="m-0"
                      style={{
                        color: "#121212",
                        fontWeight: "600",
                        fontSize: "16px",
                      }}
                    >
                      {edu.startYear || "Unknown"} - {edu.endYear || "Unknown"}
                    </p>
                    <p
                      className="m-0"
                      style={{
                        color: "#121212",
                        fontWeight: "600",
                        fontSize: "16px",
                      }}
                    >
                      {edu.degree || "No degree specified"}
                    </p>
                  </div>
                </div>
              ))
              ) : (
                <p className="text-muted">No education listed</p>
              )}
            </div>
          </div>

          <div
            className="p-3 rounded border mt-4"
            style={{ borderColor: "#333" }}
          >
            <h5
              className="mb-2"
              style={{
                color: "#007476",
                fontWeight: "600",
                fontSize: "20px",
              }}
            >
              Languages
            </h5>
            <div className="mt-3">
              {requestDetails.languages && requestDetails.languages.length > 0 ? (
                requestDetails.languages.map(({ _id, name, proficiency }) => (
                <div
                  key={_id}
                  className="d-flex gap-2 justify-content-start align-items-center mb-2"
                >
                  <p
                    className="m-0"
                    style={{
                      color: "#121212",
                      fontWeight: "500",
                      fontSize: "16px",
                      fontStyle: "italic",
                    }}
                  >
                    {name || "Unknown Language"}
                  </p>{" "}
                  -
                  <p
                    className="m-0"
                    style={{
                      color: "#121212",
                      fontWeight: "600",
                      fontSize: "16px",
                    }}
                  >
                    {proficiency || "Unknown Proficiency"}
                  </p>
                                  </div>
                ))
                ) : (
                  <p className="text-muted">No languages listed</p>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRequestsReviewPage;