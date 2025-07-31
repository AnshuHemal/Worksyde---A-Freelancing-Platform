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
  const { userId } = useParams();
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
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

    try {
      const response = await axios.post(
        `${API_URL}/requests/review/${requestDetails._id}/`,
        {
          status: "rejected",
          reviewFeedback: reason,
        }
      );

      if (response.status === 200) {
        toast.success("Applicant rejected..");
        setShowTextarea(false);
        setReason("");
        navigate("/ws/admin/requests");
      } else {
        toast.error(response.data.message || "Failed to reject applicant.");
      }
    } catch (error) {
      console.error("Error rejecting applicant:", error);
      toast.error(
        error.response?.data?.message ||
          "Server error while rejecting applicant."
      );
    }
  };

  const handleApproveConfirm = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/requests/review/${requestDetails._id}/`,
        {
          status: "approved",
        }
      );

      if (response.status === 200) {
        toast.success("Applicant approved..");
        setShowApproveConfirm(false);
        navigate("/ws/admin/requests");
      } else {
        toast.error(response.data.message || "Failed to approve applicant.");
      }
    } catch (error) {
      console.error("Error approving applicant:", error);
      toast.error(
        error.response?.data?.message ||
          "Server error while approving applicant."
      );
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
      try {
        const response = await axios.post(
          `${API_URL}/under-review-requests-by-userid/`,
          { userId }
        );

        if (response.data.success) {
          setRequestDetails(response.data.request);
        } else {
          console.error("Failed to fetch:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRequestDetails();
    }
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!requestDetails) {
    navigate("/ws/admin/requests/");
    // return <div>No request details found for this user.</div>;
  }

  return (
    <div className="profile-card p-4">
      <div className="row">
        <div className="col-md-8">
          <div className="d-flex align-items-end">
            <img
              src={requestDetails.photograph}
              alt="Profile"
              className="profile-img me-3"
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
                {requestDetails.userId.name}
              </h5>
              <p
                className="m-0 mb-2"
                style={{
                  color: "#121212",
                  fontSize: "18px",
                  fontWeight: "500",
                }}
              >
                {requestDetails.title}
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
                {requestDetails.state}, {requestDetails.country} -{" "}
                {requestDetails.postalCode}
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
              {requestDetails.bio.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
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
              {requestDetails.skills.map((skill, i) => (
                <span
                  key={i}
                  className="badge text-black me-2 rounded-5 border card py-2 px-3 mt-2"
                  style={{
                    backgroundColor: "#fff",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {skill.name}
                </span>
              ))}
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
              {requestDetails.categoryId.name}
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
              {requestDetails.specialities.map((skill, i) => (
                <span
                  key={i}
                  className="badge text-black me-2 rounded-5 border card py-2 px-3 mt-2"
                  style={{
                    backgroundColor: "#fff",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {skill.name}
                </span>
              ))}
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
                {requestDetails.workExperience.map((exp, i) => (
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
                                fontSize: "15px",
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
                              fontSize: "15px",
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
                            fontSize: "13px",
                          }}
                        >
                          {/* Format the date */}
                          {new Date(exp.startDate).toLocaleString("default", {
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          - {exp.endDate}
                        </p>
                        <p
                          className="m-0"
                          style={{
                            color: "#121212",
                            fontWeight: "600",
                            fontSize: "12px",
                          }}
                        >
                          {exp.city}, {exp.country}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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
              >
                Reject Applicant
              </button>
              <button
                className="login-button border-0"
                onClick={handleApproveClick}
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
                ₹ {requestDetails.hourlyRate}.00
              </h5>{" "}
              <span style={{ color: "#121212", fontWeight: "500" }}>/ hr</span>
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
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {requestDetails.userId.email}
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
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {requestDetails.streetAddress}
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
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {formatPhoneNumber(requestDetails.phone)}
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
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {new Date(requestDetails.dob).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
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
                  className="me-2"
                />{" "}
                <a
                  href={requestDetails.resume}
                  target="_blank"
                  className="footer-a"
                  style={{ fontWeight: "500", fontSize: "14px" }}
                >
                  View Resume
                </a>
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
              {requestDetails.education.map((edu) => (
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
                          {edu.school}
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
                          {edu.fieldOfStudy}
                        </p>
                      </div>
                      <p
                        className="m-0"
                        style={{
                          color: "#121212",
                          fontWeight: "600",
                          fontSize: "15px",
                        }}
                      >
                        {edu.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-end">
                    <p
                      className="m-0"
                      style={{
                        color: "#121212",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      {edu.startYear} - {edu.endYear}
                    </p>
                    <p
                      className="m-0"
                      style={{
                        color: "#121212",
                        fontWeight: "600",
                        fontSize: "12px",
                      }}
                    >
                      {edu.degree}
                    </p>
                  </div>
                </div>
              ))}
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
              {requestDetails.languages.map(({ _id, name, proficiency }) => (
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
                    {name}
                  </p>{" "}
                  -
                  <p
                    className="m-0"
                    style={{
                      color: "#121212",
                      fontWeight: "600",
                      fontSize: "15px",
                    }}
                  >
                    {proficiency}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRequestsReviewPage;
