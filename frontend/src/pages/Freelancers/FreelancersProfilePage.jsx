import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FiEdit2, FiShare2, FiPlus, FiEdit, FiTrash2, FiBriefcase } from "react-icons/fi";
import { GoLocation } from "react-icons/go";
import { MdEdit } from "react-icons/md";
import { motion } from "framer-motion";
import { BsStar } from "react-icons/bs";

const API_URL = "http://localhost:5000/api/auth";
const ACCENT = "#007476";

const FreelancersProfilePage = () => {
  const { freelancerId } = useParams();
  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Always call all hooks before any early return
  const [showFullBio, setShowFullBio] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [bioValue, setBioValue] = useState("");
  const [skillsValue, setSkillsValue] = useState([]);
  const [skillSearchValue, setSkillSearchValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, profileRes] = await Promise.all([
          axios.get(`${API_URL}/freelancer/summary/${freelancerId}/`),
          axios.get(`${API_URL}/profile/${freelancerId}/`),
        ]);
        setSummary(summaryRes.data);
        setProfile(profileRes.data);
      } catch (err) {
        setError("Failed to load freelancer profile.");
      } finally {
        setLoading(false);
      }
    };
    if (freelancerId) fetchData();
  }, [freelancerId]);

  // fallback values for bio and other fields to ensure hooks are always called
  const safeProfile = profile || {};
  const safeSummary = summary || {};
  const safeBio = safeProfile.bio || "No bio provided.";
  const bioLimit = 220;
  const isLongBio = safeBio.length > bioLimit;
  const displayedBio = showFullBio ? safeBio : safeBio.slice(0, bioLimit);

  // Initialize title and bio values when profile loads
  useEffect(() => {
    if (profile || summary) {
      const currentTitle = safeSummary.title || safeProfile.title || "Interface Specialist";
      const currentBio = safeProfile.bio || safeSummary.bio || "";
      setTitleValue(currentTitle);
      setBioValue(currentBio);
      console.log("Bio value set:", currentBio); // Debug log
    }
  }, [profile, summary, safeProfile.bio, safeSummary.bio]);

  // Update bio value when modal opens
  useEffect(() => {
    if (showBioModal) {
      const currentBio = safeProfile.bio || safeSummary.bio || "";
      console.log("Modal opened, setting bio value:", currentBio);
      setBioValue(currentBio);
    }
  }, [showBioModal, safeProfile.bio, safeSummary.bio]);

  // Update skills value when modal opens
  useEffect(() => {
    if (showSkillsModal) {
      const currentSkills = skills || [];
      console.log("Skills modal opened, setting skills value:", currentSkills);
      setSkillsValue([...currentSkills]);
    }
  }, [showSkillsModal, skills]);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: "red" }}>{error}</div>;
  if (!summary || !profile)
    return <div style={{ padding: 40 }}>No data found.</div>;

  // Fallbacks for missing data
  const avatar =
    safeSummary.photograph || safeProfile.photograph || "/default-avatar.png";
  const name = safeSummary.name || safeProfile.name || "-";
  const title =
    safeSummary.title || safeProfile.title || "Interface Specialist";
  const country = safeSummary.country || safeProfile.country || "-";
  const hourlyRate = safeSummary.hourlyRate
    ? `Rs. ${safeSummary.hourlyRate}/hr`
    : safeProfile.hourlyRate
      ? `Rs. ${safeProfile.hourlyRate}/hr`
      : "-";
  const skills = (safeSummary.skills || safeProfile.skills || [])
    .map((s) => s.name)
    .filter(Boolean);
  const languages = (safeProfile.languages || [])
    .map((l) => (l.name ? `${l.name}: ${l.proficiency}` : null))
    .filter(Boolean);
  const education = safeProfile.education || [];
  const localTime = "6:01 pm local time";

  // Hardcoded for demo
  const hoursPerWeek = "Less than 30 hrs/week";

  // Add this after your other safeProfile/safeSummary assignments
  const isOnline = safeSummary.isOnline || safeProfile.isOnline || false;

  return (
    <>
      <style>
        {`
          .skill-tag {
            background: linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%);
            color: #007674;
            border: 1px solid rgba(0, 118, 116, 0.2);
            border-radius: 20px;
            padding: 6px 15px;
            font-size: 1.02rem;
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
        `}
      </style>
      <div
        className="section-container"
        style={{
          background: "#fff",
          padding: 0,
          minHeight: "100vh",
          // width: "100vw",
          // margin: 0,
        }}
      >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "40px 50px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        {/* Left: Avatar, Name, Location */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ position: "relative" }}>
            <img
              src={avatar}
              alt="Freelancer Avatar"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #f8f9fa",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            />
            {/* Green status dot */}
            <span
              style={{
                position: "absolute",
                left: "4px",
                top: "4px",
                width: "18px",
                height: "18px",
                background: "#fff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
              title={isOnline ? "Online" : "Offline"}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  background: isOnline ? "#14a800" : "#bbb",
                  borderRadius: "50%",
                  display: "block",
                  transition: "background 0.2s",
                }}
              ></span>
            </span>
            {/* Edit icon overlay */}
            <motion.div
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#007674",
                color: "#fff",
                border: "3px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(0, 118, 116, 0.3)",
              }}
              whileHover={{ 
                scale: 1.1,
                boxShadow: "0 4px 12px rgba(0, 118, 116, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              title="Edit Profile Photo"
            >
              <MdEdit size={16} />
            </motion.div>
          </div>
          <div>
            <div style={{ 
              fontSize: "28px", 
              fontWeight: "700", 
              marginBottom: "6px",
              color: "#1a1a1a",
              letterSpacing: "-0.5px"
            }}>
              {name}
            </div>
            <div
              style={{
                color: "#666",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "500",
              }}
            >
              <GoLocation
                style={{ color: "#007674", fontSize: "18px" }}
              />
              {country}, India – {localTime}
            </div>
          </div>
        </div>
        
        {/* Right: Buttons and Share */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "12px",
          }}
        >
          {/* Primary Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <motion.button
              style={{
                border: "2px solid #007674",
                background: "#fff",
                color: "#007674",
                fontWeight: "600",
                fontSize: "15px",
                borderRadius: "8px",
                padding: "10px 20px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                minWidth: "140px",
              }}
              whileHover={{ 
                scale: 1.02,
                background: "#f8f9fa"
              }}
              whileTap={{ scale: 0.98 }}
            >
              See public view
            </motion.button>
            <motion.button
              style={{
                background: "#007674",
                color: "#fff",
                fontWeight: "600",
                fontSize: "15px",
                borderRadius: "8px",
                padding: "10px 20px",
                cursor: "pointer",
                border: "none",
                transition: "all 0.2s ease",
                minWidth: "140px",
                boxShadow: "0 2px 8px rgba(0, 118, 116, 0.2)",
              }}
              whileHover={{ 
                scale: 1.02,
                background: "#005a58",
                boxShadow: "0 4px 12px rgba(0, 118, 116, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              Profile settings
            </motion.button>
          </div>
          
          {/* Share Option */}
          <motion.div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#007674",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "6px",
              transition: "all 0.2s ease",
            }}
            whileHover={{ 
              background: "rgba(0, 118, 116, 0.1)",
              scale: 1.02
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Share</span>
            <FiShare2 size={14} />
          </motion.div>
        </div>
      </div>
      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "20px",
          margin: "0px 20px",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
          borderBottom: "none",
          minHeight: 400,
        }}
      >
        {/* Left Sidebar */}
        <div
          style={{
            border: "1px solid #e6e6e6",
            padding: "32px 32px 0 20px",
            background: "#fff",
            borderRadius: "10px",
            minWidth: 290,
            fontSize: 18, // Slightly increased font size for all sidebar text
          }}
        >
          {/* Connects Box */}
          <div
            style={{
              background: "#fafbfb",
              borderRadius: 12,
              padding: "18px 20px 14px 20px",
              marginBottom: 32,
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              fontSize: 19, // Slightly larger for Connects box
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>
              Connects: 90
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 17,
              }}
            >
              <span style={{ color: "#007476", cursor: "pointer" }}>
                View details
              </span>
              <span style={{ color: "#bbb" }}>|</span>
              <span style={{ color: "#007476", cursor: "pointer" }}>
                Buy Connects
              </span>
            </div>
          </div>

          {/* Video introduction */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 20 }}>
              Video introduction
            </span>
            <motion.div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                color: "#007674",
                border: "2px solid #007674",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ",
              }}
              whileHover={{ 
                scale: 1.05,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus size={16} />
            </motion.div>
          </div>

          {/* Hours per week
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: 18, marginBottom: 2 }}>
                Hours per week
              </div>
              <div style={{ color: "#444", fontSize: 17 }}>{hoursPerWeek}</div>
              <div style={{ color: "#888", fontSize: 16, marginTop: 2 }}>
                No contract-to-hire preference set
              </div>
            </div>
            <FiEdit2
              style={{
                color: "#007476",
                fontSize: 26,
                border: "2px solid #007476",
                borderRadius: "50%",
                padding: 2,
              }}
            />
          </div> */}

          {/* Languages */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 2 }}>
                Languages
              </div>
              {languages.length > 0 ? (
                languages.map((lang, idx) => (
                  <div
                    key={idx}
                    style={{ color: "#121212", fontSize: 17, marginTop: "10px" }}
                  >
                    {lang}
                  </div>
                ))
              ) : (
                <div style={{ color: "#888", fontSize: 17 }}>-</div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: 6 }}>
              <motion.div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  color: "#007674",
                  border: "2px solid #007674",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                whileHover={{ 
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPlus size={16} />
              </motion.div>
              <motion.div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  borderRadius: "50%",
                  color: "#007674",
                  border: "2px solid #007674",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                whileHover={{ 
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <MdEdit size={16} />
              </motion.div>
            </div>
          </div>

          {/* Education */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 2 }}>
                Education
              </div>
              {education.length > 0 ? (
                education.map((edu, idx) => (
                  <div key={idx} style={{ marginTop: "12px" }}>
                    <div style={{ 
                      color: "#121212", 
                      fontSize: 17, 
                      fontWeight: 600,
                      marginBottom: "4px"
                    }}>
                      {edu.institution || "LJ University"}
                    </div>
                    <div style={{ 
                      color: "#666", 
                      fontSize: 16,
                      marginBottom: "2px"
                    }}>
                      {edu.degree || "Bachelor of Engineering (BEng)"}, {edu.field || "Computer science"}
                    </div>
                    <div style={{ 
                      color: "#666", 
                      fontSize: 16
                    }}>
                      {edu.startYear || "2023"}-{edu.endYear || "2027"} {edu.isExpected ? "(expected)" : ""}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ marginTop: "12px" }}>
                  <div style={{ 
                    color: "#121212", 
                    fontSize: 17, 
                    fontWeight: 600,
                    marginBottom: "4px"
                  }}>
                    LJ University
                  </div>
                  <div style={{ 
                    color: "#666", 
                    fontSize: 16,
                    marginBottom: "2px"
                  }}>
                    Bachelor of Engineering (BEng), Computer science
                  </div>
                  <div style={{ 
                    color: "#666", 
                    fontSize: 16
                  }}>
                    2023-2027 (expected)
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "end", alignItems: "end" }}>
              <motion.div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  color: "#007674",
                  border: "2px solid #007674",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                whileHover={{ 
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}
                title="Add Education"
              >
                <FiPlus size={16} />
              </motion.div>
              {education.length > 0 && (
                <div className="d-flex gap-2">
                  <motion.div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      color: "#007674",
                      border: "2px solid #007674",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    whileHover={{ 
                      scale: 1.05,
                    }}
                    whileTap={{ scale: 0.95 }}
                    title="Edit Education"
                  >
                    <MdEdit size={16} />
                  </motion.div>
                  <motion.div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      color: "#007674",
                      border: "2px solid #007674",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    whileHover={{ 
                      scale: 1.05,
                    }}
                    whileTap={{ scale: 0.95 }}
                    title="Delete Education"
                  >
                    <FiTrash2 size={16} />
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right Main Content */}
        <div
          style={{
            padding: "32px 40px 0 40px",
            background: "#fff",
            border: "1px solid #e6e6e6",
            borderRadius: "10px",
          }}
        >
          {/* Title and Hourly Rate */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 600 }}>{title}</div>
            <motion.div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                color: "#007674",
                border: "2px solid #007674",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              whileHover={{ 
                scale: 1.05,
              }}
              whileTap={{ scale: 0.95 }}
              title="Edit Title"
              onClick={() => setShowTitleModal(true)}
            >
              <MdEdit size={16} />
            </motion.div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#007476" }}>
            {hourlyRate}
          </div>
          {/* Bio */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 32,
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 17,
                color: "#222",
                lineHeight: 1.7,
                flex: 1,
              }}
            >
              {displayedBio.split(/\n{2,}/).map((para, idx) => (
                <p key={idx} style={{ margin: "0 0 5px 0" }}>
                  {para}
                </p>
              ))}
              {isLongBio && !showFullBio && (
                <span
                  style={{
                    color: "#007476",
                    cursor: "pointer",
                    fontWeight: 500,
                    display: "inline-block",
                    marginTop: 0,
                  }}
                  onClick={() => setShowFullBio(true)}
                >
                  more
                </span>
              )}
              {showFullBio && isLongBio && (
                <span
                  style={{
                    color: "#007476",
                    cursor: "pointer",
                    fontWeight: 500,
                    display: "inline-block",
                    marginTop: 0,
                  }}
                  onClick={() => setShowFullBio(false)}
                >
                  less
                </span>
              )}
            </div>
            <motion.div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                color: "#007674",
                border: "2px solid #007674",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                marginLeft: 8,
                marginTop: 4,
                flexShrink: 0,
              }}
              whileHover={{ 
                scale: 1.05,
              }}
              whileTap={{ scale: 0.95 }}
              title="Edit Bio"
              onClick={() => {
                console.log("Opening bio modal, current bioValue:", bioValue);
                console.log("Current safeProfile.bio:", safeProfile.bio);
                console.log("Current safeSummary.bio:", safeSummary.bio);
                setShowBioModal(true);
              }}
            >
              <MdEdit size={16} />
            </motion.div>
          </div>
          {/* Skills */}
          <motion.div 
            style={{ borderTop: "1px solid #e6e6e6", paddingTop: 24 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div style={{ 
              fontWeight: 600, 
              fontSize: 22, 
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ 
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <BsStar style={{ color: "#007674", fontSize: "20px" }} />
                Skills
              </div>
              <motion.div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  color: "#007674",
                  border: "2px solid #007674",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                whileHover={{ 
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}
                title="Edit Skills"
                onClick={() => setShowSkillsModal(true)}
              >
                <MdEdit size={16} />
              </motion.div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {skills.length > 0 ? (
                skills.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    className="skill-tag"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {skill}
                  </motion.span>
                ))
              ) : (
                <span style={{ color: "#888", fontSize: 16 }}>
                  No skills listed.
                </span>
              )}
            </div>
          </motion.div>

          {/* Portfolio Section */}
          <motion.div 
            style={{ borderTop: "1px solid #e6e6e6", paddingTop: 24, marginTop: 24 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: 20
            }}>
              <div style={{ 
                fontWeight: 600, 
                fontSize: 22, 
                color: "#1a1a1a"
              }}>
                Portfolio
              </div>
              <motion.div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#007674",
                  color: "#fff",
                  border: "2px solid #007674",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                whileHover={{ 
                  scale: 1.05,
                  background: "#005a58"
                }}
                whileTap={{ scale: 0.95 }}
                title="Add Portfolio Item"
              >
                <FiPlus size={16} />
              </motion.div>
            </div>

            {/* Portfolio Tabs */}
            <div style={{ 
              display: "flex", 
              gap: 0, 
              marginBottom: 24,
              borderBottom: "1px solid #e6e6e6"
            }}>
              <motion.div
                style={{
                  padding: "12px 24px",
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#1a1a1a",
                  borderBottom: "3px solid #007674",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                whileHover={{ color: "#007674" }}
              >
                Published
              </motion.div>
              <motion.div
                style={{
                  padding: "12px 24px",
                  fontWeight: 500,
                  fontSize: 16,
                  color: "#666",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                whileHover={{ color: "#007674" }}
              >
                Drafts
              </motion.div>
            </div>

            {/* Portfolio Content */}
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              padding: "40px 20px",
              textAlign: "center"
            }}>
              <motion.div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  border: "2px solid #e6e6e6"
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <FiBriefcase size={40} style={{ color: "#007674" }} />
              </motion.div>
              
              <motion.div
                style={{
                  color: "#007674",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: "8px",
                  textDecoration: "underline",
                }}
                whileHover={{ color: "#005a58" }}
                transition={{ duration: 0.2 }}
              >
                Add a project.
              </motion.div>
              
              <div style={{
                color: "#1a1a1a",
                fontSize: 14,
                fontWeight: 500,
                maxWidth: "300px",
                lineHeight: 1.4
              }}>
                Talent are hired 9x more often if they've published a portfolio.
              </div>
            </div>
          </motion.div>

          {/* Work History Section */}
          <motion.div 
            style={{ borderTop: "1px solid #e6e6e6", paddingTop: 24, marginTop: 24 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div style={{ 
              fontWeight: 600, 
              fontSize: 20, 
              color: "#1a1a1a",
              marginBottom: 16
            }}>
              Work history
            </div>
            <div style={{ 
              color: "#666", 
              fontSize: 16,
              padding: "20px 0"
            }}>
              No items
            </div>
          </motion.div>
        </div>
      </div>
    </div>

    {/* Title Edit Modal */}
    {showTitleModal && (
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
        onClick={() => setShowTitleModal(false)}
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
            maxWidth: "500px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e6e6e6",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}>
            <h3 style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "600",
              color: "#1a1a1a",
            }}>
              Edit your title
            </h3>
            <motion.button
              onClick={() => setShowTitleModal(false)}
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
                background: "#f8f9fa"
              }}
              whileTap={{ scale: 0.95 }}
            >
              ×
            </motion.button>
          </div>

          {/* Modal Body */}
          <div style={{ marginBottom: "24px" }}>
            <p style={{
              margin: "0 0 16px 0",
              fontSize: "14px",
              color: "#666",
              lineHeight: "1.5",
            }}>
              Enter a single sentence description of your professional skills/experience (e.g. Expert Web Designer with Ajax experience)
            </p>
            
            <div style={{ marginBottom: "8px" }}>
              <label style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#1a1a1a",
                display: "block",
                marginBottom: "8px",
              }}>
                Your title
              </label>
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#007674";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                }}
                placeholder="Enter your professional title"
                autoFocus
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}>
            <motion.button
              onClick={() => setShowTitleModal(false)}
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
                background: "#f8f9fa"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={() => {
                // Here you would typically save the title to your backend
                console.log("Saving title:", titleValue);
                setShowTitleModal(false);
                // You can add API call here to save the title
              }}
              style={{
                padding: "10px 20px",
                border: "none",
                background: "#007674",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                borderRadius: "6px",
                transition: "all 0.2s ease",
              }}
              whileHover={{ 
                background: "#005a58"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Save
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}

    {/* Profile Overview Modal */}
    {showBioModal && (
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
        onClick={() => setShowBioModal(false)}
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
            maxWidth: "700px",
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
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexShrink: 0,
          }}>
            <h3 style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "600",
              color: "#1a1a1a",
            }}>
              Profile overview
            </h3>
            <motion.button
              onClick={() => setShowBioModal(false)}
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
                background: "#f8f9fa"
              }}
              whileTap={{ scale: 0.95 }}
            >
              ×
            </motion.button>
          </div>

          {/* Modal Body */}
          <div style={{ 
            flex: 1, 
            overflow: "auto",
            marginBottom: "24px"
          }}>
            <p style={{
              margin: "0 0 16px 0",
              fontSize: "14px",
              color: "#666",
              lineHeight: "1.5",
            }}>
              Use this space to show clients you have the skills and experience they're looking for.
            </p>
            
            <ul style={{
              margin: "0 0 16px 0",
              paddingLeft: "20px",
              fontSize: "14px",
              color: "#666",
              lineHeight: "1.6",
            }}>
              <li style={{ marginBottom: "8px" }}>Describe your strengths and skills</li>
              <li style={{ marginBottom: "8px" }}>Highlight projects, accomplishments and education</li>
              <li style={{ marginBottom: "8px" }}>Keep it short and make sure it's error-free</li>
            </ul>
            
            <motion.div
              style={{
                color: "#007674",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "20px",
                textDecoration: "underline",
              }}
              whileHover={{ color: "#005a58" }}
              transition={{ duration: 0.2 }}
            >
              Learn more about building your profile
            </motion.div>
            
            <div style={{ marginBottom: "8px" }}>
              <label style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#1a1a1a",
                display: "block",
                marginBottom: "8px",
              }}>
                Profile overview
              </label>
              <div style={{ position: "relative" }}>
                <textarea
                  value={bioValue || ""}
                  onChange={(e) => {
                    console.log("Textarea onChange:", e.target.value);
                    setBioValue(e.target.value);
                  }}
                  style={{
                    width: "100%",
                    minHeight: "300px",
                    padding: "16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                    boxSizing: "border-box",
                    resize: "vertical",
                    fontFamily: "inherit",
                    lineHeight: "1.6",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007674";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                  placeholder="Tell clients about your experience, skills, and what makes you the perfect fit for their project..."
                  autoFocus
                />
                <div style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "12px",
                  fontSize: "12px",
                  color: "#666",
                  background: "rgba(255, 255, 255, 0.9)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}>
                  {5000 - bioValue.length} characters left
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            flexShrink: 0,
            borderTop: "1px solid #e6e6e6",
            paddingTop: "20px",
          }}>
            <motion.button
              onClick={() => setShowBioModal(false)}
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
                background: "#f8f9fa"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={() => {
                // Here you would typically save the bio to your backend
                console.log("Saving bio:", bioValue);
                setShowBioModal(false);
                // You can add API call here to save the bio
              }}
              style={{
                padding: "10px 20px",
                border: "none",
                background: "#007674",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                borderRadius: "6px",
                transition: "all 0.2s ease",
              }}
              whileHover={{ 
                background: "#005a58"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Save
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}

    {/* Edit Skills Modal */}
    {showSkillsModal && (
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
        onClick={() => setShowSkillsModal(false)}
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
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e6e6e6",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}>
            <h3 style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "600",
              color: "#1a1a1a",
            }}>
              Edit skills
            </h3>
            <motion.button
              onClick={() => setShowSkillsModal(false)}
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
                background: "#f8f9fa"
              }}
              whileTap={{ scale: 0.95 }}
            >
              ×
            </motion.button>
          </div>

          {/* Modal Body */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ marginBottom: "8px" }}>
              <label style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#1a1a1a",
                display: "block",
                marginBottom: "8px",
              }}>
                Skills
              </label>
              <div style={{
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                padding: "12px",
                minHeight: "120px",
                background: "#fff",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                alignItems: "flex-start",
              }}>
                {skillsValue.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      background: "#f8f9fa",
                      border: "1px solid #e6e6e6",
                      borderRadius: "20px",
                      padding: "6px 12px",
                      fontSize: "14px",
                      color: "#1a1a1a",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      maxWidth: "100%",
                    }}
                  >
                    <span style={{ wordBreak: "break-word" }}>{skill}</span>
                    <motion.button
                      onClick={() => {
                        const newSkills = skillsValue.filter((_, i) => i !== index);
                        setSkillsValue(newSkills);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#666",
                        cursor: "pointer",
                        fontSize: "16px",
                        padding: "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        transition: "all 0.2s ease",
                      }}
                      whileHover={{ 
                        color: "#dc3545",
                        background: "#f8f9fa"
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ×
                    </motion.button>
                  </motion.div>
                ))}
                <input
                  type="text"
                  value={skillSearchValue}
                  onChange={(e) => setSkillSearchValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && skillSearchValue.trim()) {
                      if (skillsValue.length < 15 && !skillsValue.includes(skillSearchValue.trim())) {
                        setSkillsValue([...skillsValue, skillSearchValue.trim()]);
                        setSkillSearchValue("");
                      }
                    }
                  }}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "14px",
                    color: "#1a1a1a",
                    background: "transparent",
                    minWidth: "120px",
                    flex: 1,
                  }}
                  placeholder="Search skills"
                />
              </div>
              <div style={{
                fontSize: "12px",
                color: "#666",
                marginTop: "8px",
              }}>
                Maximum 15 skills.
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}>
            <motion.button
              onClick={() => setShowSkillsModal(false)}
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
                background: "#f8f9fa"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={() => {
                // Here you would typically save the skills to your backend
                console.log("Saving skills:", skillsValue);
                setShowSkillsModal(false);
                // You can add API call here to save the skills
              }}
              style={{
                padding: "10px 20px",
                border: "none",
                background: "#007674",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                borderRadius: "6px",
                transition: "all 0.2s ease",
              }}
              whileHover={{ 
                background: "#005a58"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Save
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}
    </>
  );
};

export default FreelancersProfilePage;
