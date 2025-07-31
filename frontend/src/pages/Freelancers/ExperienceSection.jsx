import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsArrowRight,
  BsBriefcase,
  BsPlus,
  BsCheckCircle,
} from "react-icons/bs";
import toast from "react-hot-toast";
import axios from "axios";

const ExperienceSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    city: "",
    country: "",
    isCurrentlyWorking: false,
    startDateMonth: "",
    startDateYear: "",
    endDateMonth: "",
    endDateYear: "",
    description: "",
  });
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
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

  // Fetch work experiences when userId is available
  useEffect(() => {
    if (userId) {
      const fetchWorkExperiences = async () => {
        try {
          const res = await axios.get(
            `${API_URL}/get-work-experiences/${userId}/`,
            { withCredentials: true }
          );
          const experiences = res.data.workExperience || [];
          console.log(experiences);
          setWorkExperiences(experiences);
        } catch (error) {
          toast.error("Failed to fetch work experiences.");
          console.error(error);
        }
      };

      fetchWorkExperiences();
    }
  }, [userId]);

  // List of months and years
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 50 },
    (_, index) => new Date().getFullYear() - index
  ); // Last 50 years

  // List of countries (You can replace this with a dynamic list from an API)
  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "India",
    "Germany",
    "France",
    "Italy",
    "Brazil",
    "Mexico",
    "China",
    "Japan",
    "South Korea",
    "Russia",
    "South Africa",
    "Spain",
    "Netherlands",
    "Sweden",
    "Norway",
    "Denmark",
    "Switzerland",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If the field is related to startDate or endDate
    if (
      name === "startDateMonth" ||
      name === "startDateYear" ||
      name === "endDateMonth" ||
      name === "endDateYear"
    ) {
      // Create a new Date object based on current formData
      const updatedDate = new Date(
        formData.startDateYear,
        months.indexOf(formData.startDateMonth)
      );

      if (name === "startDateMonth")
        updatedDate.setMonth(months.indexOf(value)); // Update startDate month
      if (name === "startDateYear") updatedDate.setFullYear(value); // Update startDate year

      // Similarly for endDate fields
      if (name === "endDateMonth") updatedDate.setMonth(months.indexOf(value));
      if (name === "endDateYear") updatedDate.setFullYear(value);

      // Update formData state with new date
      setFormData({
        ...formData,
        [name]: value,
        startDate: updatedDate, // Update the full startDate
      });
    } else {
      // Handle all other fields normally
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleCheckboxChange = () => {
    setFormData((prevData) => ({
      ...prevData,
      isCurrentlyWorking: !prevData.isCurrentlyWorking,
      endDateMonth: "", // Clear end date when checkbox is checked
      endDateYear: "", // Clear end date when checkbox is checked
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.company ||
      !formData.city ||
      !formData.country ||
      !formData.startDateMonth ||
      !formData.startDateYear ||
      !formData.description
    ) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    setLoading(true);
    const requestData = {
      userId: userId,
      title: formData.title,
      company: formData.company,
      city: formData.city,
      country: formData.country,
      startDate: `${formData.startDateMonth} ${formData.startDateYear}`,
      endDate: formData.isCurrentlyWorking
        ? "Present"
        : `${formData.endDateMonth} ${formData.endDateYear}`,
      description: formData.description,
    };

    try {
      if (editingExperienceId) {
        // Update existing work experience
        const response = await axios.put(
          `${API_URL}/update-experience/${editingExperienceId}/`,
          requestData
        );
        if (response.status === 200) {
          // Re-fetch work experiences after updating
          const updatedExperiences = await axios.get(
            `${API_URL}/get-work-experiences/${userId}/`,
            { withCredentials: true }
          );
          setWorkExperiences(updatedExperiences.data.workExperience);

          // toast.success("Work experience updated successfully!");
        }
      } else {
        // Create new work experience
        const response = await axios.post(
          `${API_URL}/add-experience/`,
          requestData
        );
        if (response.status === 200) {
          // Re-fetch work experiences after adding
          const updatedExperiences = await axios.get(
            `${API_URL}/get-work-experiences/${userId}/`,
            { withCredentials: true }
          );
          setWorkExperiences(updatedExperiences.data.workExperience);

          // toast.success("Work experience added successfully!");
        }
      }

      // Clear form and close the form
      setFormData({
        title: "",
        company: "",
        city: "",
        country: "",
        isCurrentlyWorking: false,
        startDateMonth: "",
        startDateYear: "",
        endDateMonth: "",
        endDateYear: "",
        description: "",
      });
      setShowForm(false);
      setEditingExperienceId(null);
    } catch (error) {
      console.error("Error saving work experience:", error.message);
      toast.error("There was an error saving the work experience.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/delete-experience/${id}/${userId}/`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Re-fetch work experiences after deleting
        const updatedExperiences = await axios.get(
          `${API_URL}/get-work-experiences/${userId}/`,
          { withCredentials: true }
        );
        setWorkExperiences(updatedExperiences.data.workExperience);

        toast.success("Experience deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting work experience:", error.message);
      toast.error("There was an error deleting the work experience.");
    }
  };

  const handleEdit = (id) => {
    const experience = workExperiences.find((exp) => exp._id == id);

    if (experience) {
      // Extract start and end date values for months and years
      const startDate = new Date(experience.startDate);
      const endDate =
        experience.endDate === "Present" ? null : new Date(experience.endDate);

      // Set formData based on the experience to pre-fill the form
      setFormData({
        title: experience.title,
        company: experience.company,
        city: experience.city,
        country: experience.country,
        isCurrentlyWorking: experience.endDate === "Present", // Set checkbox for currently working
        startDateMonth: startDate ? months[startDate.getMonth()] : "",
        startDateYear: startDate ? startDate.getFullYear() : "",
        endDateMonth: endDate ? months[endDate.getMonth()] : "",
        endDateYear: endDate ? endDate.getFullYear() : "",
        description: experience.description,
      });
      setEditingExperienceId(id);
      setShowForm(true);
    } else {
      toast.error("Experience not found");
    }
  };

  const handleSkip = () => {
    navigate("/create-profile/education"); // Navigate to education page
  };

  const handleNext = () => {
    if (workExperiences.length > 0) {
      navigate("/create-profile/education"); // Navigate to education page
    } else {
      toast.error("Please add at least one work experience before proceeding.");
    }
  };

  return (
    <>
      <style>
        {`
          .experience-input {
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
          
          .experience-input:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-2px);
          }
          
          .experience-input::placeholder {
            color: #999;
            font-weight: 400;
          }
          
          .experience-textarea {
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
            min-height: 120px;
            resize: vertical;
          }
          
          .experience-textarea:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-2px);
          }
          
          .experience-card {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .experience-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 118, 116, 0.1);
          }
          
          .custom-checkbox {
            width: 20px;
            height: 20px;
            accent-color: #007674;
            cursor: pointer;
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
              <BsBriefcase size={40} />
            </div>
            <h3
              className="fw-semibold mb-3"
              style={{ color: "#121212", fontSize: "1.8rem" }}
            >
              Loading Experience Section
            </h3>
            <p className="mb-0" style={{ color: "#666", fontSize: "1rem" }}>
              Preparing your work experience setup...
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
            {/* Left Column - Experiences List */}
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
                          Work Experience
                        </h3>
                        <p
                          className="mb-0"
                          style={{
                            fontSize: "1rem",
                            color: "#666",
                            lineHeight: "1.5",
                          }}
                        >
                          Showcase your professional journey and achievements
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Experiences List */}
                  <div
                    className="experiences-container"
                    style={{
                      maxHeight: "500px",
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {workExperiences.length > 0 ? (
                      workExperiences.map((experience, index) => {
                        const startDate = new Date(experience.startDate);
                        const startDateMonth = startDate.toLocaleString(
                          "default",
                          {
                            month: "long",
                          }
                        );
                        const startDateYear = startDate.getFullYear();
                        const endDate = new Date(experience.endDate);
                        const endDateMonth = endDate.toLocaleString("default", {
                          month: "long",
                        });
                        const endDateYear = endDate.getFullYear();

                        return (
                          <motion.div
                            key={experience._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.3 + index * 0.1,
                              duration: 0.3,
                            }}
                            className="experience-card p-3 mb-3 rounded-3 border"
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
                                  {experience.title}
                                </h6>
                                <p
                                  className="mb-1"
                                  style={{
                                    color: "#007674",
                                    fontSize: "0.95rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {experience.company}
                                </p>
                                <p
                                  className="mb-1"
                                  style={{ color: "#666", fontSize: "0.85rem" }}
                                >
                                  {startDateMonth} {startDateYear} -{" "}
                                  {experience.endDate == "Present" ||
                                  experience.isCurrentlyWorking
                                    ? "Present"
                                    : `${endDateMonth} ${endDateYear}`}
                                </p>
                                <p
                                  className="mb-2"
                                  style={{ color: "#666", fontSize: "0.85rem" }}
                                >
                                  📍 {experience.city}, {experience.country}
                                </p>
                              </div>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm"
                                  onClick={() => handleEdit(experience._id)}
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
                                  onClick={() => handleDelete(experience._id)}
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
                            <p
                              className="mb-0"
                              style={{
                                color: "#666",
                                fontSize: "0.9rem",
                                lineHeight: "1.4",
                              }}
                            >
                              {experience.description}
                            </p>
                          </motion.div>
                        );
                      })
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
                          <BsBriefcase size={40} />
                        </div>
                        <h5 style={{ color: "#121212" }}>
                          No Experience Added
                        </h5>
                        <p style={{ color: "#666" }}>
                          Start building your professional profile by adding
                          your work experience
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Add Experience Button */}
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
                      Add Experience
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
                            {editingExperienceId
                              ? "Edit Experience"
                              : "Add Experience"}
                          </h4>
                        </div>
                        <button
                          className="btn-close"
                          onClick={() => {
                            setShowForm(false);
                            setEditingExperienceId(null);
                            setFormData({
                              title: "",
                              company: "",
                              city: "",
                              country: "",
                              isCurrentlyWorking: false,
                              startDateMonth: "",
                              startDateYear: "",
                              endDateMonth: "",
                              endDateYear: "",
                              description: "",
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
                          Job Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className="experience-input"
                          placeholder="e.g., Senior Software Engineer"
                        />
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
                          Company *
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="experience-input"
                          placeholder="e.g., Google, Microsoft"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="mb-4"
                      >
                        <label
                          className="form-label fw-semibold"
                          style={{ color: "#121212" }}
                        >
                          Location
                        </label>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className="experience-input"
                              placeholder="City"
                            />
                          </div>
                          <div className="col-md-6">
                            <select
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                              className="experience-input"
                            >
                              <option value="">Select Country</option>
                              {countries.map((country, index) => (
                                <option key={index} value={country}>
                                  {country}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="mb-4"
                      >
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input custom-checkbox"
                            checked={formData.isCurrentlyWorking}
                            onChange={handleCheckboxChange}
                            id="currentlyWorking"
                          />
                          <label
                            className="form-check-label ms-2"
                            htmlFor="currentlyWorking"
                            style={{ color: "#666" }}
                          >
                            I am currently working in this role
                          </label>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="mb-4"
                      >
                        <label
                          className="form-label fw-semibold"
                          style={{ color: "#121212" }}
                        >
                          Duration
                        </label>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="mb-2">
                              <small style={{ color: "#666" }}>
                                Start Date *
                              </small>
                            </div>
                            <div className="row g-2">
                              <div className="col-6">
                                <select
                                  name="startDateMonth"
                                  value={formData.startDateMonth}
                                  onChange={handleChange}
                                  className="experience-input"
                                >
                                  <option value="">Month</option>
                                  {months.map((month, index) => (
                                    <option key={index} value={month}>
                                      {month}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-6">
                                <select
                                  name="startDateYear"
                                  value={formData.startDateYear}
                                  onChange={handleChange}
                                  className="experience-input"
                                >
                                  <option value="">Year</option>
                                  {years.map((year) => (
                                    <option key={year} value={year}>
                                      {year}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-2">
                              <small style={{ color: "#666" }}>End Date</small>
                            </div>
                            <div className="row g-2">
                              <div className="col-6">
                                <select
                                  name="endDateMonth"
                                  value={formData.endDateMonth}
                                  onChange={handleChange}
                                  className="experience-input"
                                  disabled={formData.isCurrentlyWorking}
                                >
                                  <option value="">Month</option>
                                  {months.map((month, index) => (
                                    <option key={index} value={month}>
                                      {month}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-6">
                                <select
                                  name="endDateYear"
                                  value={formData.endDateYear}
                                  onChange={handleChange}
                                  className="experience-input"
                                  disabled={formData.isCurrentlyWorking}
                                >
                                  <option value="">Year</option>
                                  {years.map((year) => (
                                    <option key={year} value={year}>
                                      {year}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="mb-4"
                      >
                        <label
                          className="form-label fw-semibold"
                          style={{ color: "#121212" }}
                        >
                          Description *
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          className="experience-textarea"
                          placeholder="Describe your role, responsibilities, and achievements..."
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
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
                          disabled={loading}
                          onMouseEnter={(e) => {
                            if (!loading) {
                              e.target.style.background =
                                "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                              e.target.style.boxShadow =
                                "0 8px 25px rgba(18, 18, 18, 0.4)";
                              e.target.style.transform = "translateY(-2px)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!loading) {
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
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                              Saving...
                            </div>
                          ) : (
                            <>
                              {editingExperienceId
                                ? "Update Experience"
                                : "Save Experience"}
                              <BsCheckCircle className="ms-2" size={20} />
                            </>
                          )}
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
                        Add Your Experience
                      </h4>
                      <p style={{ color: "#666", marginBottom: "20px" }}>
                        Click the "Add Experience" button to start building your
                        professional profile
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
            className="mt-4 d-flex justify-content-between"
          >
            <div className="align-items-center">
              <button
                className="btn border-0 px-5 py-3 fw-semibold"
                style={{
                  fontSize: "1rem",
                  borderRadius: "50px",
                  background:
                    "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                  color: "#666",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                  border: "2px solid #e3e3e3",
                }}
                onClick={handleSkip}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";
                  e.target.style.borderColor = "#007674";
                  e.target.style.color = "#007674";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.08)";
                  e.target.style.borderColor = "#e3e3e3";
                  e.target.style.color = "#666";
                }}
              >
                Skip for now
              </button>
            </div>
            <div>
              <button
                className="btn border-0 px-5 py-2 fw-semibold"
                style={{
                  fontSize: "1rem",
                  borderRadius: "50px",
                  background:
                    workExperiences.length > 0
                      ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                      : "linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%)",
                  color: "#fff",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  opacity: workExperiences.length > 0 ? 1 : 0.6,
                  cursor:
                    workExperiences.length > 0 ? "pointer" : "not-allowed",
                  boxShadow:
                    workExperiences.length > 0
                      ? "0 6px 20px rgba(0, 118, 116, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
                onClick={handleNext}
                disabled={workExperiences.length === 0}
                onMouseEnter={(e) => {
                  if (workExperiences.length > 0) {
                    e.target.style.background =
                      "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(18, 18, 18, 0.4)";
                    e.target.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (workExperiences.length > 0) {
                    e.target.style.background =
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(0, 118, 116, 0.3)";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                Next, Add Education
                <BsArrowRight className="ms-2" size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ExperienceSection;
