import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsArrowRight,
  BsMortarboard,
  BsPlus,
  BsCheckCircle,
} from "react-icons/bs";
import toast from "react-hot-toast";
import axios from "axios";

const EducationSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [educationExperiences, setEducationExperiences] = useState([]);
  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
    description: "",
  });
  const [editingEducationId, setEditingEducationId] = useState(null);
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

  // Fetch education experiences when userId is available
  useEffect(() => {
    if (userId) {
      const fetchEducationExperiences = async () => {
        try {
          const res = await axios.get(`${API_URL}/get-educations/${userId}/`, {
            withCredentials: true,
          });
          const educations = res.data.education || [];
          console.log(educations);
          setEducationExperiences(educations);
        } catch (error) {
          toast.error("Failed to fetch education experiences.");
          console.error(error);
        }
      };

      fetchEducationExperiences();
    }
  }, [userId]);

  // List of degrees and fields of study
  const degrees = [
    "High School Diploma",
    "Associate's Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD",
    "Certificate",
    "Diploma",
    "Other",
  ];

  const fieldsOfStudy = [
    "Computer Science",
    "Information Technology",
    "Software Engineering",
    "Data Science",
    "Business Administration",
    "Marketing",
    "Finance",
    "Economics",
    "Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Design",
    "Graphic Design",
    "Web Design",
    "UI/UX Design",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Medicine",
    "Law",
    "Education",
    "Psychology",
    "Sociology",
    "History",
    "Literature",
    "Languages",
    "Arts",
    "Music",
    "Film",
    "Journalism",
    "Communication",
    "Public Relations",
    "Human Resources",
    "Supply Chain Management",
    "Project Management",
    "Healthcare",
    "Nursing",
    "Pharmacy",
    "Architecture",
    "Urban Planning",
    "Environmental Science",
    "Agriculture",
    "Veterinary Medicine",
    "Dentistry",
    "Optometry",
    "Physical Therapy",
    "Occupational Therapy",
    "Social Work",
    "Criminal Justice",
    "Political Science",
    "International Relations",
    "Anthropology",
    "Geography",
    "Geology",
    "Astronomy",
    "Statistics",
    "Actuarial Science",
    "Accounting",
    "Management",
    "Entrepreneurship",
    "Real Estate",
    "Hospitality Management",
    "Tourism",
    "Sports Management",
    "Event Management",
    "Fashion Design",
    "Interior Design",
    "Industrial Design",
    "Product Design",
    "Game Design",
    "Animation",
    "Digital Media",
    "Photography",
    "Videography",
    "Audio Engineering",
    "Sound Design",
    "Theater",
    "Dance",
    "Culinary Arts",
    "Nutrition",
    "Exercise Science",
    "Kinesiology",
    "Public Health",
    "Epidemiology",
    "Biostatistics",
    "Biotechnology",
    "Bioinformatics",
    "Neuroscience",
    "Cognitive Science",
    "Linguistics",
    "Philosophy",
    "Religious Studies",
    "Theology",
    "Classics",
    "Archaeology",
    "Museum Studies",
    "Library Science",
    "Information Science",
    "Cybersecurity",
    "Network Administration",
    "Database Administration",
    "Cloud Computing",
    "Artificial Intelligence",
    "Machine Learning",
    "Robotics",
    "Automation",
    "Quality Assurance",
    "DevOps",
    "Mobile Development",
    "Web Development",
    "Full Stack Development",
    "Frontend Development",
    "Backend Development",
    "Other",
  ];

  const years = Array.from(
    { length: 50 },
    (_, index) => new Date().getFullYear() - index
  ); // Last 50 years

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.school ||
      !formData.degree ||
      !formData.fieldOfStudy ||
      !formData.startYear ||
      !formData.endYear ||
      !formData.description
    ) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    setLoading(true);
    const requestData = {
      userId: userId,
      school: formData.school,
      degree: formData.degree,
      fieldOfStudy: formData.fieldOfStudy,
      startYear: formData.startYear,
      endYear: formData.endYear,
      description: formData.description,
    };

    try {
      if (editingEducationId) {
        // Update existing education experience
        const response = await axios.put(
          `${API_URL}/update-education/${editingEducationId}/`,
          requestData
        );
        if (response.status === 200) {
          // Re-fetch education experiences after updating
          const updatedEducations = await axios.get(
            `${API_URL}/get-educations/${userId}/`,
            { withCredentials: true }
          );
          setEducationExperiences(updatedEducations.data.education);

          // toast.success("Education experience updated successfully!");
        }
      } else {
        // Create new education experience
        const response = await axios.post(
          `${API_URL}/add-education/`,
          requestData
        );
        if (response.status === 200) {
          // Re-fetch education experiences after adding
          const updatedEducations = await axios.get(
            `${API_URL}/get-educations/${userId}/`,
            { withCredentials: true }
          );
          setEducationExperiences(updatedEducations.data.education);

          // toast.success("Education experience added successfully!");
        }
      }

      // Clear form and close the form
      setFormData({
        school: "",
        degree: "",
        fieldOfStudy: "",
        startYear: "",
        endYear: "",
        description: "",
      });
      setShowForm(false);
      setEditingEducationId(null);
    } catch (error) {
      console.error("Error saving education experience:", error.message);
      toast.error("There was an error saving the education experience.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/delete-education/${id}/${userId}/`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Re-fetch education experiences after deleting
        const updatedEducations = await axios.get(
          `${API_URL}/get-educations/${userId}/`,
          { withCredentials: true }
        );
        setEducationExperiences(updatedEducations.data.education);

        toast.success("Education experience deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting education experience:", error.message);
      toast.error("There was an error deleting the education experience.");
    }
  };

  const handleEdit = (id) => {
    const education = educationExperiences.find((edu) => edu._id == id);

    if (education) {
      // Set formData based on the education to pre-fill the form
      setFormData({
        school: education.school,
        degree: education.degree,
        fieldOfStudy: education.fieldOfStudy,
        startYear: education.startYear,
        endYear: education.endYear,
        description: education.description,
      });
      setEditingEducationId(id);
      setShowForm(true);
    } else {
      toast.error("Education experience not found");
    }
  };

  const handleSkip = () => {
    navigate("/create-profile/languages"); // Navigate to languages page
  };

  const handleNext = () => {
    if (educationExperiences.length > 0) {
      navigate("/create-profile/languages"); // Navigate to languages page
    } else {
      toast.error(
        "Please add at least one education experience before proceeding."
      );
    }
  };

  return (
    <>
      <style>
        {`
          .education-input {
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
          
          .education-input:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-2px);
          }
          
          .education-input::placeholder {
            color: #999;
            font-weight: 400;
          }
          
          .education-textarea {
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
          
          .education-textarea:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-2px);
          }
          
          .education-card {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .education-card:hover {
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
              <BsMortarboard size={40} />
            </div>
            <h3
              className="fw-semibold mb-3"
              style={{
                color: "#121212",
                fontSize: "1.8rem",
                letterSpacing: "0.3px",
              }}
            >
              Loading Education Section
            </h3>
            <p
              className="mb-0"
              style={{ color: "#121212", fontSize: "1.2rem" }}
            >
              Preparing your education setup...
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
            {/* Left Column - Education List */}
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
                          style={{
                            color: "#121212",
                            fontSize: "1.8rem",
                            letterSpacing: "0.3px",
                          }}
                        >
                          Education
                        </h3>
                        <p
                          className="mb-0"
                          style={{
                            fontSize: "1.1rem",
                            color: "#121212",
                            lineHeight: "1.5",
                          }}
                        >
                          Showcase your academic achievements and qualifications
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Education List */}
                  <div
                    className="education-container"
                    style={{
                      maxHeight: "500px",
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {educationExperiences.length > 0 ? (
                      educationExperiences.map((education, index) => (
                        <motion.div
                          key={education._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.3 + index * 0.1,
                            duration: 0.3,
                          }}
                          className="education-card p-3 mb-3 rounded-3 border"
                          style={{
                            backgroundColor: "#fff",
                            borderColor: "#e3e3e3",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.borderColor = "#007674";
                          }}
                          onMouseLeave={(e) => {
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
                                {education.school}
                              </h6>
                              <p
                                className="mb-1"
                                style={{
                                  color: "#007674",
                                  fontSize: "1rem",
                                  fontWeight: 600,
                                }}
                              >
                                {education.degree} in {education.fieldOfStudy}
                              </p>
                              <p
                                className="mb-1"
                                style={{ color: "#121212", fontSize: "1rem" }}
                              >
                                {education.startYear} - {education.endYear}
                              </p>
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm"
                                onClick={() => handleEdit(education._id)}
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
                                onClick={() => handleDelete(education._id)}
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
                              color: "#121212",
                              fontSize: "1.1rem",
                              lineHeight: "1.4",
                            }}
                          >
                            {education.description}
                          </p>
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
                          <BsMortarboard size={40} />
                        </div>
                        <h5 style={{ color: "#121212" }}>No Education Added</h5>
                        <p style={{ color: "#121212", fontSize: "1.2rem" }}>
                          Start building your academic profile by adding your
                          education experiences
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Add Education Button */}
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
                      Add Education
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
                            style={{
                              color: "#121212",
                              fontSize: "1.5rem",
                              letterSpacing: "0.3px",
                            }}
                          >
                            {editingEducationId
                              ? "Edit Education"
                              : "Add Education"}
                          </h4>
                        </div>
                        <button
                          className="btn-close"
                          onClick={() => {
                            setShowForm(false);
                            setEditingEducationId(null);
                            setFormData({
                              school: "",
                              degree: "",
                              fieldOfStudy: "",
                              startYear: "",
                              endYear: "",
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
                          School/Institution *
                        </label>
                        <input
                          type="text"
                          name="school"
                          value={formData.school}
                          onChange={handleChange}
                          className="education-input"
                          placeholder="e.g., Harvard University, Stanford University"
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
                          Degree *
                        </label>
                        <select
                          name="degree"
                          value={formData.degree}
                          onChange={handleChange}
                          className="education-input"
                        >
                          <option value="">Select Degree</option>
                          {degrees.map((degree, index) => (
                            <option key={index} value={degree}>
                              {degree}
                            </option>
                          ))}
                        </select>
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
                          Field of Study *
                        </label>
                        <select
                          name="fieldOfStudy"
                          value={formData.fieldOfStudy}
                          onChange={handleChange}
                          className="education-input"
                        >
                          <option value="">Select Field of Study</option>
                          {fieldsOfStudy.map((field, index) => (
                            <option key={index} value={field}>
                              {field}
                            </option>
                          ))}
                        </select>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
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
                                Start Year *
                              </small>
                            </div>
                            <select
                              name="startYear"
                              value={formData.startYear}
                              onChange={handleChange}
                              className="education-input"
                            >
                              <option value="">Select Year</option>
                              {years.map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-2">
                              <small style={{ color: "#666" }}>
                                End Year *
                              </small>
                            </div>
                            <select
                              name="endYear"
                              value={formData.endYear}
                              onChange={handleChange}
                              className="education-input"
                            >
                              <option value="">Select Year</option>
                              {years.map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
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
                          Description *
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          className="education-textarea"
                          placeholder="Describe your academic achievements, projects, research, or any relevant activities..."
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
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
                          }}
                          onClick={handleSubmit}
                          disabled={loading}
                          onMouseEnter={(e) => {
                            if (!loading) {
                              e.target.style.transform = "translateY(-2px)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!loading) {
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
                              {editingEducationId
                                ? "Update Education"
                                : "Save Education"}
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
                        Add Your Education
                      </h4>
                      <p
                        style={{
                          color: "#121212",
                          marginBottom: "20px",
                          fontSize: "1.2rem",
                        }}
                      >
                        Click the "Add Education" button to start building your
                        academic profile
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
                className="login-button border-0 px-5 py-3 fw-semibold"
                style={{
                  fontSize: "1.1rem",
                  borderRadius: "50px",
                  background:
                    educationExperiences.length > 0
                      ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                      : "linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%)",
                  color: "#fff",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  opacity: educationExperiences.length > 0 ? 1 : 0.6,
                  cursor:
                    educationExperiences.length > 0 ? "pointer" : "not-allowed",
                  boxShadow:
                    educationExperiences.length > 0
                      ? "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)"
                      : "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
                onClick={handleNext}
                disabled={educationExperiences.length === 0}
                onMouseEnter={(e) => {
                  if (educationExperiences.length > 0) {
                    e.target.style.background =
                      "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(18, 18, 18, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)";
                    e.target.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (educationExperiences.length > 0) {
                    e.target.style.background =
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                Next, Add Languages
                <BsArrowRight className="ms-2" size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default EducationSection;
