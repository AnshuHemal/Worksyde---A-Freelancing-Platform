import React, { useState, useEffect } from "react";
import axios from "axios";
import Header1 from "../../components/Header1";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsArrowRight,
  BsLightning,
  BsPlus,
  BsCheckCircle,
  BsX,
} from "react-icons/bs";

const SkillsSelection = () => {
  const [allSkills, setAllSkills] = useState([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [userId, setUserId] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    // Fetch userId first
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        setUserId(res.data.user._id); // Set userId when fetched
        setDataLoading(false);
      } catch (error) {
        toast.error("Failed to fetch user.");
        console.error(error);
        setDataLoading(false);
      }
    };

    fetchCurrentUser();
  }, []); // Run only once when the component mounts

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get(`${API_URL}/get-skills/`);
        const skillNames = response.data.skills.map((skill) => skill.name);
        setAllSkills(skillNames);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchSkills();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setHighlightedIndex(-1);

    if (value.length > 0) {
      const filtered = allSkills.filter(
        (skill) =>
          skill.toLowerCase().includes(value.toLowerCase()) &&
          !selectedSkills.includes(skill)
      );
      setSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
    } else {
      setSuggestions([]);
    }
  };

  const addSkill = (skill) => {
    if (selectedSkills.length >= 15) {
      toast.error("You can select up to 15 skills only.");
      return;
    }

    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setInput("");
      setSuggestions([]);
      setHighlightedIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        addSkill(suggestions[highlightedIndex]);
      }
    }
  };

  const removeSkill = (skill) => {
    const updated = selectedSkills.filter((s) => s !== skill);
    setSelectedSkills(updated);
  };

  const handleSkip = () => {
    navigate("/create-profile/overview");
  };

  const handleNext = async () => {
    if (selectedSkills.length < 5) {
      toast.error("Please select at least 5 skills.");
      return;
    }

    if (selectedSkills.length > 15) {
      toast.error("You can select up to 15 skills only.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/add-skills/`, {
        userId: userId,
        skills: selectedSkills,
      });

      if (response.status === 200) {
        navigate("/create-profile/overview");
      }
    } catch (error) {
      console.error("Error saving skills:", error.message);
      toast.error("Failed to save skills.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .skills-input {
            border: 2px solid #e3e3e3;
            border-radius: 12px;
            padding: 15px 20px;
            font-size: 1rem;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            width: 100%;
          }
          
          .skills-input:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-2px);
          }
          
          .skills-input::placeholder {
            color: #999;
            font-weight: 400;
          }
          
          .skills-input:disabled {
            background: #f5f5f5;
            color: #999;
            cursor: not-allowed;
          }
          
          .skill-tag {
            display: inline-flex;
            align-items: center;
            background: linear-gradient(135deg, #007674 0%, #005a58 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            margin: 4px;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 118, 116, 0.2);
          }
          
          .skill-tag:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 118, 116, 0.3);
          }
          
          .skill-remove-btn {
            background: none;
            border: none;
            color: white;
            margin-left: 8px;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: bold;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
          }
          
          .skill-remove-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
          }
          
          .suggestions-list {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 2px solid #007674;
            border-top: none;
            border-radius: 0 0 12px 12px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.15);
          }
          
          .suggestion-item {
            padding: 12px 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .suggestion-item:hover,
          .suggestion-item.highlighted {
            background: #e8f4f4;
            color: #007674;
          }
          
          .suggestion-item:last-child {
            border-bottom: none;
          }
        `}
      </style>
      <Header1 />

      {/* Loading Screen */}
      {dataLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            fontFamily: "Urbanist, sans-serif",
          }}
        >
          <div className="text-center">
            <div
              className="d-inline-flex align-items-center justify-content-center mb-4"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                color: "white",
                boxShadow: "0 8px 25px rgba(0, 118, 116, 0.3)",
              }}
            >
              <BsLightning size={40} />
            </div>
            <h3
              className="fw-semibold mb-3"
              style={{ color: "#121212", fontSize: "1.8rem" }}
            >
              Loading Skills Section
            </h3>
            <p className="mb-0" style={{ color: "#666", fontSize: "1rem" }}>
              Preparing your skills setup...
            </p>
          </div>
        </div>
      )}

      <div
        className="min-vh-100 section-container"
        style={{
          backgroundColor: "#fff",
          padding: "40px 0",
          fontFamily: "Urbanist, sans-serif",
          fontWeight: 500,
        }}
      >
        <div className="container-fluid px-4">
          <div className="row g-4">
            {/* Left Column - Skills List */}
            <div className="col-lg-5">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="card border-0 shadow-lg h-100"
                style={{
                  borderRadius: "25px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  border: "1px solid rgba(0, 118, 116, 0.1)",
                }}
              >
                <div className="card-body p-4">
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-4"
                  >
                    <div className="d-flex align-items-center mb-3">
                      <div>
                        <h3
                          className="fw-semibold mb-1"
                          style={{ color: "#121212", fontSize: "1.8rem" }}
                        >
                          Your Skills
                        </h3>
                        <p
                          className="mb-0"
                          style={{
                            fontSize: "1rem",
                            color: "#666",
                            lineHeight: "1.5",
                          }}
                        >
                          Showcase your expertise and stand out to clients
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Skills Counter */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-3"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        style={{
                          fontSize: "0.9rem",
                          color: "#666",
                          fontWeight: 500,
                        }}
                      >
                        Selected Skills ({selectedSkills.length}/15)
                      </span>
                      <div
                        className="progress"
                        style={{
                          width: "60%",
                          height: "8px",
                          borderRadius: "10px",
                          backgroundColor: "#e9ecef",
                        }}
                      >
                        <div
                          className="progress-bar"
                          style={{
                            width: `${(selectedSkills.length / 15) * 100}%`,
                            backgroundColor: "#007674",
                            borderRadius: "10px",
                            transition: "width 0.3s ease",
                          }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Selected Skills */}
                  <div
                    className="selected-skills-container"
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {selectedSkills.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="selected-skills"
                      >
                        {selectedSkills.map((skill, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.5 + index * 0.1,
                              duration: 0.3,
                            }}
                            className="skill-tag"
                          >
                            {skill}
                            <button
                              className="skill-remove-btn"
                              onClick={() => removeSkill(skill)}
                            >
                              <BsX size={16} />
                            </button>
                          </motion.span>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-center py-5"
                      >
                        <div
                          className="d-inline-flex align-items-center justify-content-center mb-3"
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                            color: "#007674",
                          }}
                        >
                          <BsLightning size={40} />
                        </div>
                        <h5 style={{ color: "#121212" }}>No Skills Added</h5>
                        <p style={{ color: "#666" }}>
                          Start building your skills profile by adding your
                          expertise
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Skills Guidelines */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-4"
                  >
                    <div
                      className="p-3 rounded-3"
                      style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e3e3e3",
                      }}
                    >
                      <h6
                        className="fw-semibold mb-2"
                        style={{ color: "#121212" }}
                      >
                        💡 Tips for selecting skills:
                      </h6>
                      <ul
                        className="mb-0"
                        style={{
                          fontSize: "1rem",
                          color: "#666",
                          paddingLeft: "1.2rem",
                        }}
                      >
                        <li>
                          Choose skills that best represent your expertise
                        </li>
                        <li>Include both technical and soft skills</li>
                        <li>Select 5-15 skills for optimal visibility</li>
                        <li>Focus on skills relevant to your target clients</li>
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Skills Input */}
            <div className="col-lg-7">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="card border-0 shadow-lg h-100"
                style={{
                  borderRadius: "25px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  border: "1px solid rgba(0, 118, 116, 0.1)",
                }}
              >
                <div className="card-body p-4">
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-4"
                  >
                    <div className="d-flex align-items-center mb-3">
                      <h4
                        className="fw-semibold mb-0"
                        style={{ color: "#121212", fontSize: "1.5rem" }}
                      >
                        Add Your Skills
                      </h4>
                    </div>
                    <p
                      className="mb-0"
                      style={{
                        fontSize: "1rem",
                        color: "#666",
                        lineHeight: "1.5",
                      }}
                    >
                      Your skills are your superpower — they tell clients
                      exactly what you bring to the table and help us match you
                      with the right opportunities.
                    </p>
                  </motion.div>

                  {/* Skills Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-4"
                  >
                    <label
                      className="form-label fw-semibold"
                      style={{ color: "#121212" }}
                    >
                      Search and Add Skills
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="skills-input"
                        placeholder="Start typing to search for skills..."
                        value={input}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        disabled={selectedSkills.length >= 15}
                      />
                      {suggestions.length > 0 && (
                        <ul className="suggestions-list">
                          {suggestions.map((skill, index) => (
                            <li
                              key={index}
                              className={`suggestion-item ${
                                index === highlightedIndex ? "highlighted" : ""
                              }`}
                              onClick={() => addSkill(skill)}
                            >
                              {skill}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <small
                      className="text-muted mt-2 d-block"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {selectedSkills.length >= 15
                        ? "Maximum 15 skills reached"
                        : `${15 - selectedSkills.length} skills remaining`}
                    </small>
                  </motion.div>

                  {/* Popular Skills */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mb-4"
                  >
                    <h6
                      className="fw-semibold mb-3"
                      style={{ color: "#121212" }}
                    >
                      Popular Skills
                    </h6>
                    <div className="row g-2">
                      {[
                        "JavaScript",
                        "ReactJS",
                        "Python",
                        "Node.js",
                        "UI Design",
                        "Content Creation",
                        "Digital Marketing",
                        "Data Analysis",
                      ].map((skill, index) => (
                        <div key={index} className="col-md-6">
                          <button
                            className="btn w-100 text-start"
                            style={{
                              backgroundColor: "#f8f9fa",
                              border: "1px solid #e3e3e3",
                              borderRadius: "8px",
                              fontSize: "1rem",
                              color: "#666",
                              transition: "all 0.2s ease",
                            }}
                            onClick={() => addSkill(skill)}
                            disabled={selectedSkills.includes(skill)}
                            onMouseEnter={(e) => {
                              if (!selectedSkills.includes(skill)) {
                                e.target.style.backgroundColor = "#e8f4f4";
                                e.target.style.borderColor = "#007674";
                                e.target.style.color = "#007674";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!selectedSkills.includes(skill)) {
                                e.target.style.backgroundColor = "#f8f9fa";
                                e.target.style.borderColor = "#e3e3e3";
                                e.target.style.color = "#666";
                              }
                            }}
                          >
                            <BsPlus className="me-2" size={16} />
                            {skill}
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-4 d-flex justify-content-between"
          >
            <div className="align-items-center"></div>
            <div>
              <button
                className="btn border-0 px-5 py-2 fw-semibold"
                style={{
                  fontSize: "1rem",
                  borderRadius: "50px",
                  background:
                    selectedSkills.length >= 5
                      ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                      : "linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%)",
                  color: "#fff",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  opacity: selectedSkills.length >= 5 ? 1 : 0.6,
                  cursor:
                    selectedSkills.length >= 5 ? "pointer" : "not-allowed",
                  boxShadow:
                    selectedSkills.length >= 5
                      ? "0 6px 20px rgba(0, 118, 116, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
                onClick={handleNext}
                disabled={selectedSkills.length < 5 || loading}
                onMouseEnter={(e) => {
                  if (selectedSkills.length >= 5 && !loading) {
                    e.target.style.background =
                      "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(18, 18, 18, 0.4)";
                    e.target.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedSkills.length >= 5 && !loading) {
                    e.target.style.background =
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(0, 118, 116, 0.3)";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                {loading ? (
                  <div className="d-flex align-items-center">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      style={{ color: "#fff" }}
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Saving...
                  </div>
                ) : (
                  <>
                    Next, Add Your Bio
                    <BsArrowRight className="ms-2" size={20} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SkillsSelection;
