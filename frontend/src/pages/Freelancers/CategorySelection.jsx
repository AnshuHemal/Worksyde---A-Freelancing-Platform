import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BsArrowRight,
  BsCheckCircle,
  BsLightbulb,
  BsCode,
  BsPalette,
  BsGraphUp,
  BsMegaphone,
  BsPencil,
  BsGear,
  BsGlobe,
  BsBook,
  BsCamera,
  BsCalculator,
  BsShield,
  BsHeart,
  BsHouse,
  BsBriefcase,
} from "react-icons/bs";

const CategorySelection = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";

  // Category icons mapping
  const categoryIcons = {
    "Web Development": BsCode,
    "Design & Creative": BsPalette,
    "Digital Marketing": BsMegaphone,
    "Writing & Translation": BsPencil,
    "Video & Animation": BsCamera,
    "Music & Audio": BsLightbulb,
    "Programming & Tech": BsGear,
    Business: BsBriefcase,
    Lifestyle: BsHeart,
    "Data Science": BsCalculator,
    Education: BsBook,
    Engineering: BsShield,
    "Sales & Marketing": BsGraphUp,
    Translation: BsGlobe,
    Automotive: BsGear,
    "Real Estate": BsHouse,
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoadingProgress(30);
        const res = await axios.get(`${API_URL}/current-user/`, {
            withCredentials: true,
        });
        setUserId(res.data.user._id);
        setLoadingProgress(60);
      } catch (error) {
        toast.error("Failed to fetch user.");
        console.error(error);
        setDataLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingProgress(80);
        const res = await axios.get(`${API_URL}/categories-with-specialities/`); 
        setCategoryData(res.data);
        setLoadingProgress(100);
        setTimeout(() => {
          setDataLoading(false);
        }, 500);
      } catch (err) {
        console.error("Error fetching categories", err);
        setDataLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Reset category styling when selection changes
  useEffect(() => {
    const categoryElements = document.querySelectorAll(".category-item");
    categoryElements.forEach((element) => {
      const categoryId = element.getAttribute("data-category-id");
      if (categoryId !== selectedCategoryId) {
        element.style.background =
          "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)";
        element.style.borderColor = "transparent";
        element.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
        element.style.transform = "translateY(0)";
      }
    });
  }, [selectedCategoryId]);

  const handleSpecialityToggle = (id) => {
    setSelectedSpecialities((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      } else {
        if (prev.length >= 3) {
          // toast.error("You can only select up to 3 specialities.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleNext = async () => {
    if (selectedSpecialities.length === 0) {
      toast.error("Please select at least one speciality.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/save-specialities/`, {
          userId,
          categoryId: selectedCategoryId,
          specialities: selectedSpecialities,
      });

      if (res.status === 200) {
        // toast.success("Specialities saved successfully!");
        setTimeout(() => {
        navigate("/create-profile/title");
        }, 100);
      }
    } catch (err) {
      console.error("Error saving specialities", err);
      toast.error("An error occurred while saving your specialities.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const IconComponent = categoryIcons[categoryName] || BsLightbulb;
    return <IconComponent size={24} />;
  };

  return (
    <>
      <style>
        {`
          .categories-container::-webkit-scrollbar,
          .specialities-container::-webkit-scrollbar {
            display: none;
          }
          
          .category-item *,
          .speciality-item * {
            pointer-events: none;
          }
          
          .category-item,
          .speciality-item {
            pointer-events: auto;
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
              <BsLightbulb size={40} />
            </div>
            <h3
              className="fw-semibold mb-3"
              style={{ color: "#121212", fontSize: "1.8rem" }}
            >
              Loading Categories
          </h3>
            <p
              className="mb-4"
              style={{ color: "#666", fontSize: "1rem" }}
            >
              Please wait while we fetch your available categories...
            </p>
            
            {/* Progress Bar */}
            <div
              style={{
                width: "300px",
                height: "8px",
                backgroundColor: "#f0f0f0",
                borderRadius: "10px",
                overflow: "hidden",
                margin: "0 auto",
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #007674 0%, #da8535 100%)",
                  borderRadius: "10px",
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            
            <div className="mt-3">
              <span
                style={{
                  color: "#007674",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                {loadingProgress}% Complete
              </span>
            </div>
          </div>
        </div>
      )}
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center section-container"
        style={{
          backgroundColor: "#fff",
          padding: "20px 0",
          fontFamily: "Urbanist, sans-serif",
          fontWeight: 500,
        }}
      >
        <div className="container-fluid px-4">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="row g-4">
                {/* Left Column - Categories */}
                <div className="col-lg-4">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="h-100"
                  >
                    <div
                      className="cardd border-0 h-100"
                      style={{
                        borderRadius: "20px",
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                        boxShadow:
                          "0 10px 30px rgba(0, 118, 116, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <div className="card-body p-4">
                        {/* Header */}
                        <div className="text-center mb-4">
                          <h3
                            className="fw-semibold mb-2"
                            style={{ color: "#121212", fontSize: "32px" }}
                          >
                            Choose Your Category
                          </h3>
                          <p
                            className="mb-0"
                            style={{ color: "#666", fontSize: "0.95rem" }}
                          >
                            Select the main category that best describes your
                            work
                          </p>
                        </div>

                        {/* Categories List */}
                        <div
                          className="categories-container"
                          style={{
                            maxHeight: "500px",
                            overflowY: "auto",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
            >
                          {categoryData.map((item, index) => (
                            <motion.div
                  key={item.category._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.3 }}
                              onClick={() =>
                                setSelectedCategoryId(item.category._id)
                              }
                              className={`p-3 mb-3 rounded-3 cursor-pointer ${
                    selectedCategoryId === item.category._id
                                  ? "selected-category"
                                  : "category-item"
                              }`}
                              data-category-id={item.category._id}
                              style={{
                                background:
                                  "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                                color: "#121212",
                                border:
                                  selectedCategoryId === item.category._id
                                    ? "2px solid #007674"
                                    : "2px solid transparent",
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                cursor: "pointer",
                                boxShadow:
                                  selectedCategoryId === item.category._id
                                    ? "0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08)"
                                    : "0 2px 8px rgba(0, 0, 0, 0.05)",
                                transform:
                                  selectedCategoryId === item.category._id
                                    ? "translateY(0)"
                                    : "translateY(0)",
                              }}
                              onMouseEnter={(e) => {
                                if (selectedCategoryId !== item.category._id) {
                                  e.currentTarget.style.background =
                                    "linear-gradient(135deg, #e8f4f4 0%, #d1e7e7 100%)";
                                  e.currentTarget.style.borderColor = "#007674";
                                  e.currentTarget.style.boxShadow =
                                    "0 4px 15px rgba(0, 118, 116, 0.1), 0 2px 6px rgba(0, 0, 0, 0.06)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedCategoryId !== item.category._id) {
                                  e.currentTarget.style.background =
                                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)";
                                  e.currentTarget.style.borderColor =
                                    "transparent";
                                  e.currentTarget.style.boxShadow =
                                    "0 2px 8px rgba(0, 0, 0, 0.05)";
                                } else {
                                  // Reset to selected state styling
                                  e.currentTarget.style.background =
                                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)";
                                  e.currentTarget.style.borderColor = "#007674";
                                  e.currentTarget.style.boxShadow =
                                    "0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08)";
                                }
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                  <h6
                                    className="fw-semibold mb-1"
                                    style={{ fontSize: "1rem" }}
                >
                  {item.category.name}
                                  </h6>
                                  <small style={{ opacity: 0.8 }}>
                                    {item.specialities.length} specialities
                                  </small>
                                </div>
                                {selectedCategoryId === item.category._id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    <BsCheckCircle
                                      size={20}
                                      style={{ color: "#007674" }}
                                    />
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Specialities */}
                <div className="col-lg-8">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="h-100"
                  >
                    <div
                      className="cardd border-0 h-100"
                      style={{
                        borderRadius: "20px",
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                        boxShadow:
                          "0 10px 30px rgba(0, 118, 116, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <div className="card-body p-4">
                        {/* Header */}
                        <div className="text-center mb-4">
                          <h3
                            className="fw-semibold mb-2"
                            style={{ color: "#121212", fontSize: "32px" }}
                          >
                            Select Your Specialities
                          </h3>
                          <p
                            className="mb-0"
                            style={{ color: "#666", fontSize: "0.95rem" }}
                          >
                            Choose up to 3 specialities that best match your
                            expertise
                          </p>
                          <div className="mt-3">
                            <span
                              className="badge px-3 py-2"
                              style={{
                                background:
                                  "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                                color: "white",
                                fontSize: "0.85rem",
                                borderRadius: "20px",
                                boxShadow: "0 2px 8px rgba(0, 118, 116, 0.3)",
                              }}
                            >
                              {selectedSpecialities.length}/3 selected
                            </span>
                          </div>
            </div>

                        {/* Specialities Grid */}
            <div
                          className="specialities-container"
                          style={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
            >
              {(() => {
                const selectedCategory = categoryData.find(
                  (item) => item.category._id === selectedCategoryId
                );

                if (!selectedCategory) {
                  return (
                                <div className="text-center py-5">
                                  <div
                                    className="d-inline-flex align-items-center justify-content-center mb-3"
                                    style={{
                                      width: "80px",
                                      height: "80px",
                                      borderRadius: "50%",
                                      background:
                                        "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                                      color: "#da8535",
                                    }}
                                  >
                                    <BsLightbulb size={40} />
                                  </div>
                                  <h5 style={{ color: "#121212" }}>
                                    Select a Category
                                  </h5>
                                  <p style={{ color: "#666" }}>
                                    Choose a category from the left to see
                                    available specialities
                    </p>
                                </div>
                  );
                }

                            return (
                              <div className="row g-3">
                                {selectedCategory.specialities.map(
                                  (spec, index) => (
                                    <motion.div
                                      key={spec._id}
                                      className="col-md-6 col-lg-4"
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        delay: index * 0.05,
                                        duration: 0.3,
                                      }}
                                    >
                                      <div
                                        className={`p-3 rounded-3 border-2 cursor-pointer ${
                                          selectedSpecialities.includes(
                                            spec._id
                                          )
                                            ? "selected-speciality"
                                            : "speciality-item"
                                        }`}
                                        style={{
                                          background:
                                            selectedSpecialities.includes(
                                              spec._id
                                            )
                                              ? "linear-gradient(135deg, #e8f4f4 0%, #d1e7e7 100%)"
                                              : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                                          borderColor:
                                            selectedSpecialities.includes(
                                              spec._id
                                            )
                                              ? "#007674"
                                              : "#e3e3e3",
                                          borderWidth:
                                            selectedSpecialities.includes(
                                              spec._id
                                            )
                                              ? "2px"
                                              : "1px",
                                          transition:
                                            "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                          cursor: "pointer",
                                          height: "100px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          position: "relative",
                                          boxShadow:
                                            selectedSpecialities.includes(
                                              spec._id
                                            )
                                              ? "0 6px 20px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08)"
                                              : "0 2px 8px rgba(0, 0, 0, 0.05)",
                                          transform:
                                            selectedSpecialities.includes(
                                              spec._id
                                            )
                                              ? "translateY(-2px)"
                                              : "translateY(0)",
                                        }}
                                        onClick={() =>
                                          handleSpecialityToggle(spec._id)
                                        }
                                        onMouseEnter={(e) => {
                                          if (
                                            !selectedSpecialities.includes(
                                              spec._id
                                            )
                                          ) {
                                            e.currentTarget.style.borderColor =
                                              "#007674";
                                            e.currentTarget.style.background =
                                              "linear-gradient(135deg, #f0f8f8 0%, #e8f4f4 100%)";
                                            e.currentTarget.style.boxShadow =
                                              "0 4px 15px rgba(0, 118, 116, 0.1), 0 2px 6px rgba(0, 0, 0, 0.06)";
                                            e.currentTarget.style.transform =
                                              "translateY(-1px)";
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (
                                            !selectedSpecialities.includes(
                                              spec._id
                                            )
                                          ) {
                                            e.currentTarget.style.borderColor =
                                              "#e3e3e3";
                                            e.currentTarget.style.background =
                                              "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)";
                                            e.currentTarget.style.boxShadow =
                                              "0 2px 8px rgba(0, 0, 0, 0.05)";
                                            e.currentTarget.style.transform =
                                              "translateY(0)";
                                          }
                                        }}
                                      >
                                        {selectedSpecialities.includes(
                                          spec._id
                                        ) && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            style={{
                                              position: "absolute",
                                              top: "8px",
                                              right: "8px",
                                              background: "#007674",
                                              borderRadius: "50%",
                                              width: "24px",
                                              height: "24px",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <BsCheckCircle
                                              size={14}
                                              style={{ color: "white" }}
                                            />
                                          </motion.div>
                                        )}
                                        <h6
                                          className="fw-semibold mb-0 text-center"
                                          style={{
                                            color: "#121212",
                                            fontSize: "1.1rem",
                                            lineHeight: "1.3",
                                          }}
                                        >
                                          {spec.name}
                                        </h6>
                                      </div>
                                    </motion.div>
                                  )
                                )}
                  </div>
                            );
              })()}
            </div>

                        {/* Continue Button */}
                        <div className="text-center mt-4">
                          <button
                            className="login-button border-0 px-5 py-3 fw-semibold"
                            style={{
                              fontSize: "1.0rem",
                              borderRadius: "50px",
                              background:
                                selectedSpecialities.length > 0
                                  ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                                  : "linear-gradient(135deg, #cccccc 0%, #bbbbbb 100%)",
                              color: "#fff",
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              opacity:
                                selectedSpecialities.length > 0 ? 1 : 0.6,
                              cursor:
                                selectedSpecialities.length > 0
                                  ? "pointer"
                                  : "not-allowed",
                              boxShadow:
                                selectedSpecialities.length > 0
                                  ? "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)"
                                  : "0 2px 8px rgba(0, 0, 0, 0.1)",
                              transform:
                                selectedSpecialities.length > 0
                                  ? "translateY(0)"
                                  : "translateY(0)",
                            }}
                            onClick={handleNext}
                            disabled={
                              loading || selectedSpecialities.length === 0
                            }
                            onMouseEnter={(e) => {
                              if (selectedSpecialities.length > 0) {
                                e.target.style.background =
                                  "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                                e.target.style.boxShadow =
                                  "0 8px 25px rgba(18, 18, 18, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)";
                                e.target.style.transform = "translateY(-2px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedSpecialities.length > 0) {
                                e.target.style.background =
                                  "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                                e.target.style.boxShadow =
                                  "0 6px 20px rgba(0, 118, 116, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)";
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
                                Next, Add Skills
                                <BsArrowRight className="ms-2" size={20} />
                              </>
                            )}
              </button>

                          {selectedSpecialities.length === 0 && (
                            <p
                              className="mt-3 mb-0"
                              style={{ color: "#666", fontSize: "0.85rem" }}
                            >
                              Please select at least one speciality to continue
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategorySelection;
