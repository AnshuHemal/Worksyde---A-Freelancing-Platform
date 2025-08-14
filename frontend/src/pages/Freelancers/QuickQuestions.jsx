import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faSearch,
  faComments,
  faBullseye,
  faArrowRight,
  faCheck,
  faUserGraduate,
  faBriefcase,
  faHandshake,
  faGlobe,
  faNetworkWired,
  faUserFriends,
  faShieldAlt,
  faLightbulb,
  faStar,
  faGraduationCap,
  faClock,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import Header1 from "../../components/Header1";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RiLightbulbFlashLine } from "react-icons/ri";

const QuickQuestions = () => {
  const API_URL = "http://localhost:5000/api/auth";
  const navigate = useNavigate();
  const questions = [
    {
      id: 1,
      question: "What best describes your freelancing journey so far?",
      description:
        "Let us understand where you are in your freelancing career.",
      options: [
        { text: "I'm just starting out", icon: faRocket, color: "#007674" },
        {
          text: "I've completed a few small gigs",
          icon: faBriefcase,
          color: "#da8535",
        },
        {
          text: "I've been freelancing consistently",
          icon: faChartLine,
          color: "#007674",
        },
      ],
    },
    {
      id: 2,
      question: "How do you usually find freelance work?",
      description: "Knowing your method helps us provide better opportunities.",
      options: [
        {
          text: "I haven't looked for work yet",
          icon: faSearch,
          color: "#007674",
        },
        {
          text: "Through personal contacts or referrals",
          icon: faHandshake,
          color: "#da8535",
        },
        {
          text: "Through freelance platforms or job boards",
          icon: faGlobe,
          color: "#007674",
        },
      ],
    },
    {
      id: 3,
      question:
        "How confident are you in handling client communication and project deadlines?",
      description:
        "This helps us tailor resources based on your confidence level.",
      options: [
        {
          text: "I'm still learning to manage both",
          icon: faUserGraduate,
          color: "#007674",
        },
        {
          text: "I'm fairly confident with some guidance",
          icon: faLightbulb,
          color: "#da8535",
        },
        {
          text: "I'm fully confident and independent",
          icon: faStar,
          color: "#007674",
        },
      ],
    },
    {
      id: 4,
      question: "Which of these best describes your current freelancing goal?",
      description:
        "Your goal helps us match you with relevant clients and gigs.",
      options: [
        {
          text: "Exploring freelancing alongside studies/job",
          icon: faGraduationCap,
          color: "#007674",
        },
        {
          text: "Looking to build a part-time freelancing career",
          icon: faClock,
          color: "#da8535",
        },
        {
          text: "Aiming for full-time freelancing income",
          icon: faNetworkWired,
          color: "#007674",
        },
      ],
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [userId, setUserId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const progress = (currentStep / questions.length) * 100;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        setUserId(res.data.user._id);
        console.log(res.data.user._id);
      } catch (error) {
        console.error("Failed to fetch current user", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleOptionSelect = (option) => {
    const updatedAnswers = { ...answers, [currentStep]: option };
    setAnswers(updatedAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      // All questions answered, show loading and save data
      setIsCompleted(true);
    }
  };

  useEffect(() => {
    if (isCompleted && userId) {
      submitAnswers(answers);
    }
  }, [isCompleted, userId]);

  const submitAnswers = async (answersObj) => {
    setIsLoading(true);
    const structuredAnswers = {};
    questions.forEach((q, index) => {
      structuredAnswers[q.question] = answersObj[index];
    });

    try {
      if (!userId) {
        toast.error("User ID not available.");
        setIsLoading(false);
        return;
      }

      await axios.post(
        `${API_URL}/user/survey/${userId}/`,
        { answers: structuredAnswers },
        { withCredentials: true }
      );

      // toast.success("Profile information saved successfully!");

      setTimeout(() => {
        navigate("/create-profile/resume-import");
      }, 1500);
    } catch (error) {
      console.error("Error submitting survey answers", error);
      toast.error("Submission failed. Please try again.");
      setIsLoading(false);
      setIsCompleted(false); // Reset completion state to allow retry
    }
  };

  if (isLoading) {
    return (
      <>
        <Header1 />
        <div
          className="min-vh-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "#fff",
            fontFamily: "Urbanist, sans-serif",
            fontWeight: 500,
          }}
        >
          <div className="text-center">
            <div
              className="spinner-border mb-3"
              style={{ color: "#007674" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 style={{ color: "#121212" }}>
              Saving the Survey information...
            </h4>
            <p style={{ color: "#666" }}>
              Please wait while we save your answers and prepare your profile
              setup.
            </p>
            <div className="mt-3">
              <small style={{ color: "#007674" }}>
                This will only take a moment...
              </small>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header1 />

      {/* Add shimmer animation CSS */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>

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
                {/* Progress Section - Left Column */}
                <div className="col-lg-4">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="h-100"
                  >
                    {/* Progress Header */}
                    <div className="text-center mb-4">
                      <h4
                        className="fw-semibold mb-2"
                        style={{ color: "#121212" }}
                      >
                        Profile Setup Progress
                      </h4>
                      <p
                        className="mb-0"
                        style={{ color: "#666", fontSize: "1rem" }}
                      >
                        {Math.round(progress)}% Complete • Step{" "}
                        {currentStep + 1} of {questions.length}
                      </p>
                    </div>

                    {/* Step Indicators */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      {questions.map((_, index) => (
                        <motion.div
                          key={index}
                          className="d-flex flex-column align-items-center"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <div
                            className="d-flex align-items-center justify-content-center mb-2"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              backgroundColor:
                                index <= currentStep ? "#007674" : "#f0f0f0",
                              color: index <= currentStep ? "white" : "#999",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                              border:
                                index === currentStep
                                  ? "3px solid #da8535"
                                  : "none",
                              transition: "all 0.3s ease",
                            }}
                          >
                            {index < currentStep ? (
                              <FontAwesomeIcon icon={faCheck} size="sm" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <small
                            className="text-center"
                            style={{
                              color: index <= currentStep ? "#007674" : "#999",
                              fontWeight: index === currentStep ? "600" : "500",
                              fontSize: "0.8rem",
                            }}
                          >
                            Q{index + 1}
                          </small>
                        </motion.div>
                      ))}
                    </div>

                    {/* Modern Progress Bar */}
                    <div
                      className="position-relative mb-4"
                      style={{
                        height: "12px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "20px",
                        overflow: "hidden",
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      {/* Background Pattern */}
                      <div
                        className="position-absolute w-100 h-100"
                        style={{
                          background:
                            "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                          backgroundSize: "20px 20px",
                          animation: "shimmer 2s infinite linear",
                        }}
                      />

                      {/* Progress Fill */}
                      <motion.div
                        className="position-relative h-100"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{
                          background:
                            "linear-gradient(90deg, #007674 0%, #da8535 100%)",
                          borderRadius: "20px",
                          boxShadow: "0 2px 8px rgba(0, 119, 116, 0.3)",
                        }}
                      >
                        {/* Progress Glow Effect */}
                        <div
                          className="position-absolute top-0 end-0 h-100"
                          style={{
                            width: "20px",
                            background:
                              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 100%)",
                            borderRadius: "0 20px 20px 0",
                          }}
                        />
                      </motion.div>

                      {/* Progress Percentage Overlay */}
                      <motion.div
                        className="position-absolute top-50 start-50 translate-middle"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        <span
                          className="fw-bold px-2 py-1 rounded-pill"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.95)",
                            color: "#007674",
                            fontSize: "0.75rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          {Math.round(progress)}%
                        </span>
                      </motion.div>
                    </div>

                    {/* Progress Status */}
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                    >
                      <span
                        className="fw-semibold"
                        style={{
                          color: progress === 100 ? "#007674" : "#da8535",
                          fontSize: "1.1rem",
                        }}
                      >
                        {progress === 100
                          ? "🎉 Almost Done!"
                          : "Keep going, you're doing great!"}
                      </span>
                    </motion.div>

                    {/* Quick Tips Section */}
                    <div
                      className="mt-5 p-3 rounded"
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid #e3e3e3",
                      }}
                    >
                      <h6
                        className="fw-semibold mb-2"
                        style={{ color: "#121212" }}
                      >
                        <RiLightbulbFlashLine
                          size={25}
                          style={{ color: "#007674" }}
                        />{" "}
                        Quick Tips
                      </h6>
                      <ul
                        className="mb-0"
                        style={{ fontSize: "1rem", color: "#121212" }}
                      >
                        <li>Be honest about your experience level</li>
                        <li>
                          Your answers help us personalize your experience
                        </li>
                        <li>You can always update your profile later</li>
                      </ul>
                    </div>
                  </motion.div>
                </div>

                {/* Question Section - Right Column */}
                <div className="col-lg-8 ">
                  {/* Question Card */}
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="card border-0 shadow-lg h-100"
                    style={{
                      borderRadius: "20px",
                      overflow: "hidden",
                    }}
                  >
                    <div className="card-body p-4">
                      {/* Question Header */}
                      <div className="text-center mb-4">
                        <h2
                          className="fw-semibold mb-3"
                          style={{
                            color: "#121212",
                            fontSize: "1.75rem",
                            lineHeight: "1.3",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {questions[currentStep].question}
                        </h2>
                        <p
                          className="mb-0"
                          style={{
                            color: "#121212",
                            fontSize: "1.1rem",
                            lineHeight: "1.5",
                          }}
                        >
                          {questions[currentStep].description}
                        </p>
                      </div>

                      {/* Options Grid */}
                      <div className="row g-2">
                        {questions[currentStep].options.map((option, index) => (
                          <motion.div
                            key={index}
                            className="col-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                          >
                            <button
                              className={`w-100 p-4 border-0 rounded-3 text-start position-relative ${
                                answers[currentStep] === option.text
                                  ? "selected"
                                  : ""
                              }`}
                              style={{
                                backgroundColor: "transparent",
                                border:
                                  answers[currentStep] === option.text
                                    ? "2px solid #007674"
                                    : "2px solid #e3e3e3",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                transform: "translateY(0)",
                                boxShadow:
                                  answers[currentStep] === option.text
                                    ? "0 8px 25px rgba(0, 119, 116, 0.15)"
                                    : "0 2px 8px rgba(0,0,0,0.08)",
                              }}
                              onClick={() => handleOptionSelect(option.text)}
                              onMouseEnter={(e) => {
                                if (answers[currentStep] !== option.text) {
                                  e.target.style.borderColor = "#007674";
                                  e.target.style.backgroundColor =
                                    "transparent";
                                  e.target.style.transform =
                                    "translateY(-3px) scale(1.02)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (answers[currentStep] !== option.text) {
                                  e.target.style.borderColor = "#e3e3e3";
                                  e.target.style.backgroundColor =
                                    "transparent";
                                  e.target.style.transform =
                                    "translateY(0) scale(1)";
                                }
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <div
                                  className="d-flex align-items-center justify-content-center me-3"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    backgroundColor: option.color,
                                    color: "white",
                                    transition: "all 0.3s ease",
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={option.icon}
                                    size="lg"
                                  />
                                </div>
                                <div className="flex-grow-1">
                                  <h5
                                    className="fw-semibold mb-1"
                                    style={{
                                      color: "#121212",
                                      fontSize: "1.1rem",
                                      transition: "color 0.3s ease",
                                      textShadow: "none",
                                      boxShadow: "none",
                                    }}
                                  >
                                    {option.text}
                                  </h5>
                                </div>
                                {answers[currentStep] === option.text && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    style={{
                                      color: "#007674",
                                      fontSize: "1.2rem",
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faCheck} />
                                  </motion.div>
                                )}
                              </div>
                            </button>
                          </motion.div>
                        ))}
                      </div>

                      {/* Navigation */}
                      <div className="d-flex justify-content-between align-items-center mt-5">
                        <div
                          className="text-black"
                          style={{ fontSize: "1.2rem" }}
                        >
                          <small>
                            {currentStep + 1} of {questions.length} questions
                          </small>
                        </div>

                        {answers[currentStep] && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="d-flex align-items-center"
                            style={{ color: "#007674" }}
                          >
                            <span className="me-2 fw-semibold">
                              {currentStep === questions.length - 1
                                ? "Complete Setup"
                                : "Next Question"}
                            </span>
                            <FontAwesomeIcon icon={faArrowRight} />
                          </motion.div>
                        )}
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

export default QuickQuestions;
