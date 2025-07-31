import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsArrowRight,
  BsTranslate,
  BsPlus,
  BsCheckCircle,
} from "react-icons/bs";
import toast from "react-hot-toast";
import axios from "axios";

const LanguagesSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    proficiency: "",
  });
  const [editingLanguageId, setEditingLanguageId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";

  // Fetch userId from /current-user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        setUserId(res.data.user._id);
      } catch (error) {
        toast.error("Failed to fetch user.");
        console.error(error);
      } finally {
        setUserLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // Proficiency levels with descriptions
  const proficiencyLevels = [
    {
      level: "Basic",
      description: "Can communicate simple ideas in the language.",
      color: "#ff6b6b",
    },
    {
      level: "Conversational",
      description: "Can hold daily conversations with limited vocabulary.",
      color: "#4ecdc4",
    },
    {
      level: "Fluent",
      description: "Speaks the language comfortably and accurately.",
      color: "#45b7d1",
    },
    {
      level: "Native or Bilingual",
      description: "Speaks like a native or is fully bilingual.",
      color: "#96ceb4",
    },
  ];

  // Available languages
  const availableLanguages = [
    "English",
    "Hindi",
    "Spanish",
    "French",
    "German",
    "Chinese (Mandarin)",
    "Chinese (Cantonese)",
    "Japanese",
    "Korean",
    "Arabic",
    "Russian",
    "Portuguese",
    "Italian",
    "Dutch",
    "Swedish",
    "Norwegian",
    "Danish",
    "Finnish",
    "Polish",
    "Czech",
    "Hungarian",
    "Romanian",
    "Bulgarian",
    "Greek",
    "Turkish",
    "Hebrew",
    "Persian",
    "Urdu",
    "Bengali",
    "Tamil",
    "Telugu",
    "Kannada",
    "Malayalam",
    "Marathi",
    "Gujarati",
    "Punjabi",
    "Odia",
    "Assamese",
    "Nepali",
    "Sinhala",
    "Thai",
    "Vietnamese",
    "Indonesian",
    "Malay",
    "Filipino",
    "Swahili",
    "Zulu",
    "Afrikaans",
    "Amharic",
    "Yoruba",
    "Igbo",
    "Hausa",
    "Somali",
    "Eritrean",
    "Tigrinya",
    "Other",
  ];

  // Add or update language in local state only
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.proficiency) {
      toast.error("Please fill in all the required fields.");
      return;
    }
    if (editingLanguageId !== null) {
      // Update existing language
      setLanguages((prev) =>
        prev.map((lang, idx) =>
          idx === editingLanguageId ? { ...formData } : lang
        )
      );
      // toast.success("Language updated successfully!");
    } else {
      // Add new language
      setLanguages((prev) => [...prev, { ...formData }]);
      // toast.success("Language added successfully!");
    }
    setFormData({ name: "", proficiency: "" });
    setShowForm(false);
    setEditingLanguageId(null);
  };

  // Edit by index
  const handleEdit = (idx) => {
    const language = languages[idx];
    if (language) {
      setFormData({ name: language.name, proficiency: language.proficiency });
      setEditingLanguageId(idx);
      setShowForm(true);
    } else {
      toast.error("Language not found");
    }
  };

  // Delete by index
  const handleDelete = (idx) => {
    setLanguages((prev) => prev.filter((_, i) => i !== idx));
    // toast.success("Language deleted successfully");
  };

  // Remove skip button and update handleNext to save to backend
  const handleNext = async () => {
    if (languages.length === 0) {
      toast.error("Please add at least one language before proceeding.");
      return;
    }
    if (!userId) {
      toast.error("User not loaded. Please wait.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await axios.post(
        `${API_URL}/add-language/`,
        { userId, languages },
        { withCredentials: true }
      );
      if (res.status === 200) {
        // toast.success("Languages saved successfully!");
        navigate("/create-profile/skills");
      } else {
        toast.error("Failed to save languages. Try again.");
      }
    } catch (err) {
      toast.error("Failed to save languages. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getProficiencyColor = (proficiency) => {
    const level = proficiencyLevels.find((p) => p.level === proficiency);
    return level ? level.color : "#666";
  };

  return (
    <>
      <style>
        {`
          .language-input {
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
          
          .language-input:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-2px);
          }
          
          .language-input::placeholder {
            color: #999;
            font-weight: 400;
          }
          
          .language-card {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .language-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 118, 116, 0.1);
          }
          
          .proficiency-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            color: white;
            display: inline-block;
          }
        `}
      </style>
      <Header1 />

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
            {/* Left Column - Languages List */}
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
                          Languages
                        </h3>
                        <p
                          className="mb-0"
                          style={{
                            fontSize: "1rem",
                            color: "#666",
                            lineHeight: "1.5",
                          }}
                        >
                          Showcase your multilingual skills and global reach
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Languages List */}
                  <div
                    className="languages-container"
                    style={{
                      maxHeight: "500px",
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {languages.length > 0 ? (
                      languages.map((language, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.3 + index * 0.1,
                            duration: 0.3,
                          }}
                          className="language-card p-3 mb-3 rounded-3 border"
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderColor: "#e3e3e3",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#e8f4f4";
                            e.target.style.borderColor = "#007674";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#f8f9fa";
                            e.target.style.borderColor = "#e3e3e3";
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1">
                              <h6
                                className="fw-semibold mb-1"
                                style={{
                                  color: "#121212",
                                  fontSize: "1.1rem",
                                }}
                              >
                                {language.name}
                              </h6>
                              <div
                                className="proficiency-badge"
                                style={{
                                  backgroundColor: getProficiencyColor(
                                    language.proficiency
                                  ),
                                }}
                              >
                                {language.proficiency}
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm"
                                onClick={() => handleEdit(index)}
                                style={{
                                  backgroundColor: "#007674",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  padding: "6px 10px",
                                }}
                              >
                                <MdModeEditOutline size={16} />
                              </button>
                              <button
                                className="btn btn-sm"
                                onClick={() => handleDelete(index)}
                                style={{
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  padding: "6px 10px",
                                }}
                              >
                                <MdDelete size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
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
                          <BsTranslate size={40} />
                        </div>
                        <h5 style={{ color: "#121212" }}>No Languages Added</h5>
                        <p style={{ color: "#666" }}>
                          Start building your multilingual profile by adding
                          your language skills
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Add Language Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-center mt-4"
                  >
                    <button
                      className="btn border-0 px-4 py-2 fw-semibold"
                      style={{
                        fontSize: "1rem",
                        borderRadius: "50px",
                        background:
                          "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                        color: "#fff",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: "0 4px 15px rgba(0, 118, 116, 0.3)",
                      }}
                      onClick={() => setShowForm(true)}
                      onMouseEnter={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(18, 18, 18, 0.4)";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                        e.target.style.boxShadow =
                          "0 4px 15px rgba(0, 118, 116, 0.3)";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      <BsPlus className="me-2" size={20} />
                      Add Language
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Form */}
            <div className="col-lg-7">
              {showForm ? (
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
                    {/* Form Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="mb-4"
                    >
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center">
                          <h4
                            className="fw-semibold mb-0"
                            style={{ color: "#121212", fontSize: "1.5rem" }}
                          >
                            {editingLanguageId
                              ? "Edit Language"
                              : "Add Language"}
                          </h4>
                        </div>
                        <button
                          className="btn-close"
                          onClick={() => {
                            setShowForm(false);
                            setEditingLanguageId(null);
                            setFormData({
                              name: "",
                              proficiency: "",
                            });
                          }}
                          style={{ fontSize: "1.2rem" }}
                        ></button>
                      </div>
                    </motion.div>

                    {/* Form Content */}
                    <div
                      className="form-container"
                      style={{
                        maxHeight: "600px",
                        overflowY: "auto",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
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
                          Language *
                        </label>
                        <select
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="language-input"
                        >
                          <option value="">Select Language</option>
                          {availableLanguages.map((language, index) => (
                            <option key={index} value={language}>
                              {language}
                            </option>
                          ))}
                        </select>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="mb-4"
                      >
                        <label
                          className="form-label fw-semibold"
                          style={{ color: "#121212" }}
                        >
                          Proficiency Level *
                        </label>
                        <select
                          name="proficiency"
                          value={formData.proficiency}
                          onChange={handleChange}
                          className="language-input"
                        >
                          <option value="">Select Proficiency Level</option>
                          {proficiencyLevels.map((level, index) => (
                            <option key={index} value={level.level}>
                              {level.level} - {level.description}
                            </option>
                          ))}
                        </select>
                      </motion.div>

                      {/* Proficiency Level Descriptions */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="mb-4"
                      >
                        <h6
                          className="fw-semibold mb-3"
                          style={{ color: "#121212" }}
                        >
                          Proficiency Level Guide
                        </h6>
                        <div className="row g-3">
                          {proficiencyLevels.map((level, index) => (
                            <div key={index} className="col-md-6">
                              <div
                                className="p-3 rounded-3 border"
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  borderColor: "#e3e3e3",
                                }}
                              >
                                <div
                                  className="proficiency-badge mb-2"
                                  style={{
                                    backgroundColor: level.color,
                                  }}
                                >
                                  {level.level}
                                </div>
                                <p
                                  className="mb-0"
                                  style={{
                                    fontSize: "0.9rem",
                                    color: "#666",
                                    lineHeight: "1.4",
                                  }}
                                >
                                  {level.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="text-center"
                      >
                        <button
                          className="btn border-0 px-5 py-3 fw-semibold"
                          style={{
                            fontSize: "1.1rem",
                            borderRadius: "50px",
                            background:
                              "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                            color: "#fff",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                          }}
                          onClick={handleSubmit}
                          onMouseEnter={(e) => {
                            e.target.style.background =
                              "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                            e.target.style.boxShadow =
                              "0 8px 25px rgba(18, 18, 18, 0.4)";
                            e.target.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background =
                              "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                            e.target.style.boxShadow =
                              "0 6px 20px rgba(0, 118, 116, 0.3)";
                            e.target.style.transform = "translateY(0)";
                          }}
                        >
                          {editingLanguageId !== null
                            ? (<><span>Update Language</span> <BsCheckCircle className="ms-2" size={20} /></>)
                            : (<><span>Save Language</span> <BsCheckCircle className="ms-2" size={20} /></>)}
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ) : (
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
                  <div className="card-body p-4 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                      <div
                        className="d-inline-flex align-items-center justify-content-center mb-4"
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                          color: "#007674",
                        }}
                      >
                        <BsPlus size={50} />
                      </div>
                      <h4 style={{ color: "#121212", marginBottom: "10px" }}>
                        Add Your Languages
                      </h4>
                      <p style={{ color: "#666", marginBottom: "20px" }}>
                        Click the "Add Language" button to start building your
                        multilingual profile
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-4 d-flex justify-content-end"
          >
            <div>
              <button
                className="btn border-0 px-5 py-2 fw-semibold"
                style={{
                  fontSize: "1rem",
                  borderRadius: "50px",
                  background:
                    languages.length > 0 && userId && !userLoading
                      ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                      : "linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%)",
                  color: "#fff",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  opacity: languages.length > 0 && userId && !userLoading ? 1 : 0.6,
                  cursor: languages.length > 0 && userId && !userLoading ? "pointer" : "not-allowed",
                  boxShadow:
                    languages.length > 0 && userId && !userLoading
                      ? "0 6px 20px rgba(0, 118, 116, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
                onClick={handleNext}
                disabled={isSaving || userLoading || !userId || languages.length === 0}
                onMouseEnter={(e) => {
                  if (languages.length > 0 && userId && !userLoading) {
                    e.target.style.background =
                      "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(18, 18, 18, 0.4)";
                    e.target.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (languages.length > 0 && userId && !userLoading) {
                    e.target.style.background =
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(0, 118, 116, 0.3)";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Saving...
                  </>
                ) : userLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Loading User...
                  </>
                ) : (
                  <>
                    Next, Share Your Skills
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

export default LanguagesSection;
