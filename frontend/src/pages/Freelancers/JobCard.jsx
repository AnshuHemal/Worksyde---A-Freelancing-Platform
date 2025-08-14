import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BsBookmark,
  BsBookmarkFill,
  BsClock,
  BsGeoAlt,
  BsCurrencyDollar,
  BsPeople,
  BsStar,
  BsArrowRight,
  BsBriefcase,
  BsCheckCircle,
  BsFlag,
  BsCurrencyRupee,
} from "react-icons/bs";
import { RiVerifiedBadgeFill } from "react-icons/ri";

const JobCard = ({ job, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const firstThreeLines =
    job.description?.split("\n").slice(0, 3).join("\n") || "";
  const jobSkills = job.skills?.map((skill) => skill.name) || [];

  // Function to format posted time
  const formatPostedTime = (dateString) => {
    if (!dateString) return "Recently";
    
    const now = new Date();
    const postedDate = new Date(dateString);
    const diffInMs = now - postedDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `Posted ${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      if (diffInHours === 1) {
        return "Posted 1 hour ago";
      } else {
        return `Posted ${diffInHours} hours ago`;
      }
    } else if (diffInDays === 1) {
      return "Posted Yesterday";
    } else if (diffInDays < 7) {
      return `Posted ${diffInDays} days ago`;
    } else {
      // For older posts, show the date
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return `Posted on ${postedDate.toLocaleDateString('en-US', options)}`;
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  return (
    <>
      <style>
        {`
          .job-card {
            border: 2px solid #e3e3e3;
            border-radius: 20px;
            padding: 25px;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            cursor: pointer;
            position: relative;
            overflow: hidden;
          }
          
          .job-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #007674 0%, #005a58 100%);
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }
          
          .job-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(0, 118, 116, 0.15), 0 6px 20px rgba(0, 0, 0, 0.1);
            border-color: #007674;
          }
          
          .job-card:hover::before {
            transform: scaleX(1);
          }
          
          .experience-badge {
            background: linear-gradient(135deg, #da8535 0%, #f39c12 100%);
            color: white;
            border-radius: 12px;
            padding: 6px 12px;
            font-size: 0.85rem;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(218, 133, 53, 0.3);
          }
          
          .duration-badge {
            background: linear-gradient(135deg, #007674 0%, #005a58 100%);
            color: white;
            border-radius: 12px;
            padding: 6px 12px;
            font-size: 0.85rem;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0, 118, 116, 0.3);
          }
          
          .skill-tag {
            background: linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%);
            color: #007674;
            border: 1px solid rgba(0, 118, 116, 0.2);
            border-radius: 20px;
            padding: 6px 12px;
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .skill-tag:hover {
            background: linear-gradient(135deg, #007674 0%, #005a58 100%);
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 118, 116, 0.3);
          }
          
          .bookmark-btn {
            background: none;
            border: none;
            color: #666;
            transition: all 0.3s ease;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
          }
          
          .bookmark-btn:hover {
            background: rgba(0, 118, 116, 0.1);
            color: #007674;
            transform: scale(1.1);
          }
          
          .bookmark-btn.active {
            color: #007674;
          }
          
          .read-more-btn {
            color: #007674;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .read-more-btn:hover {
            color: #005a58;
            text-decoration: underline;
          }
          
          .detail-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #666;
            font-size: 1rem;
            font-weight: 500;
          }
          
          .detail-item svg {
            color: #007674;
          }
          
          .rate-display {
            border: 1px solid #e3e3e3;
            border-radius: 12px;
            padding: 8px 15px;
            color: #007674;
            font-weight: 600;
            font-size: 0.95rem;
          }
          
          .applicants-display {
            border: 1px solid #e3e3e3;
            border-radius: 12px;
            padding: 8px 15px;
            color: #007674;
            font-weight: 600;
            font-size: 0.95rem;
          }
        `}
      </style>

      <motion.div
        className="job-card"
        onClick={() => onClick(job)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <span className="experience-badge d-flex align-items-center">
              <BsBriefcase className="me-2" size={14} />
              {job.experienceLevel || "Experience N/A"}
            </span>
            <span className="duration-badge d-flex align-items-center">
              <BsClock className="me-2" size={14} />
              {job.duration || "Duration N/A"}
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <small className="text-muted" style={{ fontSize: "0.95rem" }}>
              {formatPostedTime(job.updatedAt)}
            </small>
            {/* <button
              className={`bookmark-btn ${isBookmarked ? "active" : ""}`}
              onClick={handleBookmarkClick}
            >
              {isBookmarked ? (
                <BsBookmarkFill size={18} />
              ) : (
                <BsBookmark size={18} />
              )}
            </button> */}
          </div>
        </div>

        {/* Job Title */}
        <motion.h3
          className="fw-semibold mb-3"
          style={{
            color: "#121212",
            fontSize: "1.5rem",
            lineHeight: "1.3",
            letterSpacing: "0.3px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {job.title}
        </motion.h3>

        {/* Job Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-3"
        >
          <p
            style={{
              color: "#666",
              fontSize: "1.1rem",
              lineHeight: "1.6",
              marginBottom: "8px",
            }}
          >
            {isExpanded ? job.description : firstThreeLines}
          </p>
          {job.description &&
            job.description.length > firstThreeLines.length && (
              <button
                className="read-more-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? "Show less" : "Read more"}
                <BsArrowRight
                  className="ms-1"
                  size={12}
                  style={{
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                />
              </button>
            )}
        </motion.div>

        {/* Skills Section */}
        {jobSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <h6
              className="fw-semibold mb-2"
              style={{ color: "#121212", fontSize: "0.95rem" }}
            >
              <BsStar className="me-2" style={{ color: "#007674" }} />
              Required Skills
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {jobSkills.slice(0, 5).map((skill, index) => (
                <motion.span
                  key={index}
                  className="skill-tag"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {skill}
                </motion.span>
              ))}
              {jobSkills.length > 5 && (
                <span className="skill-tag">+{jobSkills.length - 5} more</span>
              )}
            </div>
          </motion.div>
        )}

        {/* Job Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <div className="row g-3">
            <div className="col-md-4">
              <div className="detail-item">
                <RiVerifiedBadgeFill
                  size={18}
                  style={{
                    color: job.clientDetails?.paymentVerified
                      ? "#007674"
                      : "#6c757d",
                  }}
                />
                <span
                  style={{
                    color: job.clientDetails?.paymentVerified
                      ? "#007674"
                      : "#6c757d",
                    fontWeight: job.clientDetails?.paymentVerified
                      ? "600"
                      : "400",
                  }}
                >
                  {job.clientDetails?.paymentVerified
                    ? "Payment Verified"
                    : "Payment Not Verified"}
                </span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="detail-item">
                <BsCurrencyRupee size={18} />
                <span>{job.clientDetails?.totalSpent || 0}+ spent</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="detail-item">
                <BsGeoAlt size={18} />
                <span>Remote</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rate and Applicants */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="d-flex justify-content-between align-items-center"
        >
          <div className="rate-display">
            {job.budgetType === "fixed" ? (
              <>₹{job.fixedRate || 0} (Fixed)</>
            ) : (
              <>
                ₹{job.hourlyRateFrom || 0} - ₹{job.hourlyRateTo || 0} /hr
              </>
            )}
          </div>
          <div className="applicants-display">
            <BsPeople className="me-1" size={16} />
            {job.applicants || 0} applicants
          </div>
        </motion.div>

        {/* Apply Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-4"
        >
          <button
            className="btn w-100"
            style={{
              background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontWeight: "600",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(0, 118, 116, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background =
                "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(18, 18, 18, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                "linear-gradient(135deg, #007674 0%, #005a58 100%)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(0, 118, 116, 0.3)";
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClick(job);
            }}
          >
            <BsCheckCircle className="me-2" />
            Apply Now
          </button>
        </motion.div>
      </motion.div>
    </>
  );
};

export default JobCard;
