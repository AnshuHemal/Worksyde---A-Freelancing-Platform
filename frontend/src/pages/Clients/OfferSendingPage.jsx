import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header2 from "../../components/Header2";
import { BsLightbulb, BsPaperclip, BsTrash, BsPencil } from "react-icons/bs";
import { createPortal } from "react-dom";

const API_URL = "http://localhost:5000/api/auth";

// DatePicker Component
const DatePicker = ({
  isOpen,
  onClose,
  onDateSelect,
  currentDate,
  onNavigateMonth,
  fieldId = null,
}) => {
  if (!isOpen) return null;

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const datePickerContent = (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          zIndex: 99998,
        }}
        onClick={onClose}
      />
      <div
        className="date-picker-container"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          zIndex: 99999,
          width: "280px",
        }}
      >
        {/* Calendar Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <button
            onClick={() => onNavigateMonth(-1)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#666",
            }}
          >
            ‹
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            <span>
              {currentDate.toLocaleDateString("en-US", { month: "long" })}
            </span>
            <span>{currentDate.getFullYear()}</span>
            <span style={{ fontSize: "12px", cursor: "pointer" }}>▼</span>
          </div>
          <button
            onClick={() => onNavigateMonth(1)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#666",
            }}
          >
            ›
          </button>
        </div>

        {/* Days of Week */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            padding: "8px 16px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#666",
                padding: "8px 0",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            padding: "8px",
          }}
        >
          {getDaysInMonth(currentDate).map((dayObj, index) => (
            <button
              key={index}
              onClick={() => onDateSelect(dayObj.date, fieldId)}
              style={{
                background: "none",
                border: "none",
                padding: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: dayObj.isCurrentMonth ? "#121212" : "#ccc",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "32px",
              }}
              onMouseEnter={(e) => {
                if (dayObj.isCurrentMonth) {
                  e.target.style.backgroundColor = "#f0f0f0";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              {dayObj.date.getDate()}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #f0f0f0",
            textAlign: "right",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#28a745",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(datePickerContent, document.body);
};

const OfferSendingPage = () => {
  const { freelancerId, jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [freelancer, setFreelancer] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerData, setOfferData] = useState({
    contractTitle: "",
    workDescription: "",
    projectAmount: "₹2500", // Keep this static as requested
    attachments: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    weeklyPayments: false,
    fixedPriceContracts: false,
    contractFee: false,
  });

  const [paymentSchedule, setPaymentSchedule] = useState("whole-project");
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      description: "",
      amount: "₹0",
      dueDate: "",
    },
  ]);

  const [openDatePicker, setOpenDatePicker] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch freelancer details
        const freelancerResponse = await axios.get(
          `${API_URL}/freelancer/profile/${freelancerId}`
        );
        setFreelancer(freelancerResponse.data);

        // Try to get job data from multiple sources
        let jobData = null;

        // First, try to get jobId from URL params
        if (jobId) {
          try {
            const jobResponse = await axios.get(`${API_URL}/job/${jobId}`);
            jobData = jobResponse.data;
          } catch (error) {
            console.error("Error fetching job from API:", error);
          }
        }

        // If no job data from API, try location state
        if (!jobData && location.state?.job) {
          jobData = location.state.job;
        }

        // If still no job data, try jobId from location state
        if (!jobData && location.state?.jobId) {
          try {
            const jobResponse = await axios.get(
              `${API_URL}/job/${location.state.jobId}`
            );
            jobData = jobResponse.data;
          } catch (error) {
            console.error(
              "Error fetching job from location state jobId:",
              error
            );
          }
        }

        // Set job data if found
        if (jobData) {
          setJob(jobData);
          setOfferData((prev) => ({
            ...prev,
            contractTitle: jobData.title || "",
            workDescription: jobData.description || "",
            attachments: jobData.attachments || "",
          }));
        } else {
          // Set fallback data
          setJob({
            id: jobId || location.state?.jobId || "unknown",
            title: "",
            description: "",
            budget: "",
          });
          setOfferData((prev) => ({
            ...prev,
            contractTitle: "",
            workDescription: "",
            attachments: "",
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set fallback data if API fails
        setJob({
          id: jobId || "unknown",
          title: "",
          description: "",
          budget: "",
        });
        setOfferData((prev) => ({
          ...prev,
          contractTitle: "",
          workDescription: "",
          attachments: "",
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [freelancerId, jobId, location.state]);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDatePicker && !event.target.closest(".date-picker-container")) {
        setOpenDatePicker(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDatePicker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare the data for the job offer
      const jobOfferData = {
        freelancerId: freelancerId,
        jobId: job?.id,
        contractTitle: offerData.contractTitle,
        workDescription: offerData.workDescription,
        projectAmount: offerData.projectAmount,
        paymentSchedule: paymentSchedule,
        dueDate: offerData.dueDate,
        attachments: offerData.attachments,
        milestones: milestones,
      };

      // Create job offer API call
      const response = await axios.post(
        `${API_URL}/job-offers/create/`,
        jobOfferData,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Navigate to checkout page with the job offer ID
        navigate(`/ws/client/payments/checkout/${response.data.jobOfferId}`);
      }
    } catch (error) {
      console.error("Error creating job offer:", error);
      alert("Error creating job offer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleProjectAmountChange = (e) => {
    const value = e.target.value;
    // Remove all non-numeric characters except ₹ symbol
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue === "") {
      setOfferData({ ...offerData, projectAmount: "₹" });
    } else {
      setOfferData({ ...offerData, projectAmount: `₹${numericValue}` });
    }
  };

  const handleMilestoneChange = (id, field, value) => {
    setMilestones((prev) =>
      prev.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  const addMilestone = () => {
    const newMilestone = {
      id: Date.now(),
      description: "",
      amount: "₹0",
      dueDate: "",
    };
    setMilestones((prev) => [...prev, newMilestone]);
  };

  const removeMilestone = (id) => {
    if (milestones.length > 1) {
      setMilestones((prev) => prev.filter((milestone) => milestone.id !== id));
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}, ${day} ${year}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handleDateSelect = (date, fieldId = null) => {
    if (fieldId) {
      // For milestone due dates
      handleMilestoneChange(fieldId, "dueDate", formatDate(date));
    } else {
      // For main due date
      setSelectedDate(date);
    }
    setOpenDatePicker(null);
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Form validation using useMemo to prevent infinite re-renders
  const formValidation = useMemo(() => {
    const errors = {};

    // Validate contract title
    if (!offerData.contractTitle || offerData.contractTitle.trim() === "") {
      errors.contractTitle = "Contract title is required";
    }

    // Validate work description
    if (!offerData.workDescription || offerData.workDescription.trim() === "") {
      errors.workDescription = "Work description is required";
    }

    // Validate project amount
    if (!offerData.projectAmount || offerData.projectAmount.trim() === "") {
      errors.projectAmount = "Project amount is required";
    }

    // Validate payment schedule
    if (!paymentSchedule) {
      errors.paymentSchedule = "Payment schedule is required";
    }

    // Validate milestones if payment schedule is milestones
    if (paymentSchedule === "milestones") {
      if (!milestones || milestones.length === 0) {
        errors.milestones = "At least one milestone is required";
      } else {
        milestones.forEach((milestone, index) => {
          if (!milestone.description || milestone.description.trim() === "") {
            errors[`milestone_${index}_description`] =
              "Milestone description is required";
          }
          if (!milestone.amount || milestone.amount.trim() === "") {
            errors[`milestone_${index}_amount`] =
              "Milestone amount is required";
          }
          if (!milestone.dueDate || milestone.dueDate.trim() === "") {
            errors[`milestone_${index}_dueDate`] =
              "Milestone due date is required";
          }
        });
      }
    }

    // Validate terms acceptance
    if (!termsAccepted) {
      errors.terms = "";
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
    };
  }, [
    offerData.contractTitle,
    offerData.workDescription,
    offerData.projectAmount,
    paymentSchedule,
    milestones,
    termsAccepted,
  ]);

  // Update form errors when validation changes
  useEffect(() => {
    setFormErrors(formValidation.errors);
  }, [formValidation.errors]);

  // Check if form is valid
  const isFormValid = () => {
    return formValidation.isValid;
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#fff",
        }}
      >
        <div style={{ color: "#007674" }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Header2 />
      <div
        className="section-container"
        style={{
          maxWidth: 1400,
          margin: "60px auto 0 auto",
          padding: 24,
          backgroundColor: "#fff",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <h1
          style={{
            fontSize: 38,
            fontWeight: 600,
            marginBottom: 30,
            letterSpacing: 0.3,
            color: "#121212",
          }}
        >
          Send an offer
        </h1>

        {/* Informational Banner */}
        {/* <div style={{
          backgroundColor: "#e3f2fd",
          border: "1px solid #bbdefb",
          borderRadius: "8px",
          padding: "16px 20px",
          marginBottom: 32,
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <BsLightbulb style={{ 
            color: "#1976d2", 
            fontSize: 20,
            flexShrink: 0
          }} />
          <span style={{
            color: "#1976d2",
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1.4
          }}>
            Did you know? You can send up to 5 offers a day.
          </span>
        </div> */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 420px",
            gap: 40,
            alignItems: "flex-start",
          }}
        >
          {/* Left Column - Main Content */}
          <div>
            <form onSubmit={handleSubmit}>
              {/* Job Details Section */}
              <div style={{ marginBottom: 40 }}>
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: "#121212",
                    marginBottom: 24,
                    letterSpacing: 0.3,
                  }}
                >
                  Job details
                </h2>

                {/* Related job listing */}
                <div style={{ marginBottom: 24 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#121212",
                      marginBottom: 16,
                    }}
                  >
                    Related job listing
                  </label>
                  <div>
                    <span
                      style={{
                        color: "#007674",
                        fontWeight: 600,
                        fontSize: 20,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {loading
                        ? "Loading..."
                        : job?.title || "Job title not available"}
                    </span>
                  </div>
                </div>

                {/* Contract title */}
                <div style={{ marginBottom: 24 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#121212",
                      marginBottom: 8,
                    }}
                  >
                    Contract title
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <input
                      type="text"
                      value={loading ? "Loading..." : offerData.contractTitle}
                      onChange={(e) =>
                        setOfferData({
                          ...offerData,
                          contractTitle: e.target.value,
                        })
                      }
                      style={{
                        flex: 1,
                        border: formErrors.contractTitle
                          ? "1px solid #dc3545"
                          : "1px solid #e0e0e0",
                        borderRadius: "6px",
                        padding: "12px 16px",
                        fontSize: 18,
                        outline: "none",
                        fontFamily: "inherit",
                        backgroundColor: loading ? "#f8f9fa" : "#fff",
                      }}
                    />
                    {formErrors.contractTitle && (
                      <div
                        style={{
                          color: "#dc3545",
                          fontSize: 14,
                          marginTop: 4,
                        }}
                      >
                        {formErrors.contractTitle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Work description */}
                <div style={{ marginBottom: 40 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#121212",
                      marginBottom: 8,
                    }}
                  >
                    Work description
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <textarea
                      rows="8"
                      value={
                        loading
                          ? "Loading job description..."
                          : offerData.workDescription
                      }
                      onChange={(e) =>
                        setOfferData({
                          ...offerData,
                          workDescription: e.target.value,
                        })
                      }
                      style={{
                        flex: 1,
                        border: formErrors.workDescription
                          ? "1px solid #dc3545"
                          : "1px solid #e0e0e0",
                        borderRadius: "6px",
                        padding: "16px",
                        fontSize: 18,
                        outline: "none",
                        resize: "none",
                        fontFamily: "inherit",
                        lineHeight: 1.5,
                        backgroundColor: loading ? "#f8f9fa" : "#fff",
                      }}
                    />
                    {formErrors.workDescription && (
                      <div
                        style={{
                          color: "#dc3545",
                          fontSize: 14,
                          marginTop: 4,
                        }}
                      >
                        {formErrors.workDescription}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      marginTop: 8,
                    }}
                  >
                    <span
                      style={{
                        color: "#121212",
                        fontSize: 16,
                      }}
                    >
                      {offerData.workDescription.length}/50,000
                    </span>
                  </div>
                </div>

                {/* File Attachment Section */}
                {offerData.attachments &&
                typeof offerData.attachments === "string" &&
                offerData.attachments.trim() !== "" ? (
                  <div style={{ marginBottom: 40 }}>
                    <h2
                      style={{
                        fontSize: 32,
                        fontWeight: 600,
                        color: "#121212",
                        marginBottom: 24,
                        letterSpacing: 0.3,
                      }}
                    >
                      Attachments
                    </h2>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "16px 20px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() =>
                        window.open(offerData.attachments, "_blank")
                      }
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f0f8f8";
                        e.target.style.borderColor = "#007674";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#f8f9fa";
                        e.target.style.borderColor = "#e0e0e0";
                      }}
                    >
                      <BsPaperclip
                        style={{
                          color: "#007674",
                          fontSize: 24,
                          marginRight: 16,
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: 18,
                            color: "#121212",
                            fontWeight: 500,
                            marginBottom: 4,
                          }}
                        >
                          View Attachment
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#666",
                          }}
                        >
                          Click to open file
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <hr style={{ margin: "24px 0" }} />

                {/* Contract Terms Section */}
                <div style={{ marginBottom: 40 }}>
                  <h2
                    style={{
                      fontSize: 32,
                      fontWeight: 600,
                      color: "#121212",
                      marginBottom: 24,
                      letterSpacing: 0.3,
                    }}
                  >
                    Contract terms
                  </h2>

                  {/* Upwork Payment Protection */}
                  <div style={{ marginBottom: 24 }}>
                    <span
                      style={{
                        color: "#007674",
                        fontSize: 18,
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Worksyde Payment Protection
                    </span>
                    <span
                      style={{
                        color: "#121212",
                        fontSize: 18,
                        marginLeft: 8,
                      }}
                    >
                      Only pay for the work you authorize.
                    </span>
                  </div>

                  {/* Payment Option */}
                  <div style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 20,
                          fontWeight: 600,
                          color: "#121212",
                        }}
                      >
                        Payment option
                      </label>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          backgroundColor: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontSize: 14, color: "#666" }}>?</span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 18,
                          color: "#121212",
                          fontWeight: 500,
                        }}
                      >
                        Fixed Price
                      </span>
                    </div>
                  </div>

                  {/* Project Amount */}
                  <div style={{ marginBottom: 24 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#121212",
                        marginBottom: 12,
                      }}
                    >
                      Project amount
                    </label>
                    <div
                      style={{
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      <input
                        type="text"
                        value={offerData.projectAmount}
                        onChange={handleProjectAmountChange}
                        style={{
                          border: formErrors.projectAmount
                            ? "1px solid #dc3545"
                            : "1px solid #e0e0e0",
                          borderRadius: "6px",
                          padding: "12px 16px",
                          fontSize: 18,
                          outline: "none",
                          fontFamily: "inherit",
                          width: "200px",
                          textAlign: "right",
                          backgroundColor: "#fff",
                          cursor: "text",
                        }}
                      />
                      {formErrors.projectAmount && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: 14,
                            marginTop: 4,
                          }}
                        >
                          {formErrors.projectAmount}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        color: "#121212",
                        fontSize: 16,
                        marginTop: 8,
                        display: "block",
                      }}
                    >
                      This is the price you and {freelancer?.name || "Hemal K."}{" "}
                      have agreed upon.
                    </span>
                  </div>

                  {/* Payment Schedule */}
                  <div style={{ marginBottom: 24 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#121212",
                        marginBottom: 16,
                      }}
                    >
                      Payment schedule
                    </label>
                    <p
                      style={{
                        color: "#121212",
                        fontSize: 16,
                        lineHeight: 1.5,
                        marginBottom: 22,
                      }}
                    >
                      You can create optional milestones to help you budget and
                      align on scope with the freelancer. With either payment
                      schedule, you'll pay into project funds, a neutral holding
                      place that protects your money until you approve the work.
                    </p>

                    {/* Radio Button Options */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          marginBottom: 12,
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "8px",
                          transition: "all 0.3s ease-in-out",
                        }}
                        onClick={() => setPaymentSchedule("whole-project")}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            backgroundColor:
                              paymentSchedule === "whole-project"
                                ? "#007674"
                                : "#fff",
                            border:
                              paymentSchedule === "whole-project"
                                ? "none"
                                : "2px solid #e0e0e0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                            marginTop: 10,
                          }}
                        >
                          {paymentSchedule === "whole-project" && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#fff",
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 600,
                              color: "#121212",
                              marginBottom: 4,
                            }}
                          >
                            Pay for the whole project
                          </div>
                          <div
                            style={{
                              fontSize: 16,
                              color: "#121212",
                            }}
                          >
                            Make the full {offerData.projectAmount} payment
                            today
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "8px",
                          transition: "all 0.3s ease-in-out",
                        }}
                        onClick={() => setPaymentSchedule("milestones")}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            backgroundColor:
                              paymentSchedule === "milestones"
                                ? "#007674"
                                : "#fff",
                            border:
                              paymentSchedule === "milestones"
                                ? "none"
                                : "2px solid #e0e0e0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                            marginTop: 10,
                          }}
                        >
                          {paymentSchedule === "milestones" && (
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#fff",
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 600,
                              color: "#121212",
                              marginBottom: 4,
                            }}
                          >
                            Pay in installments with milestones
                          </div>
                          <div
                            style={{
                              fontSize: 16,
                              color: "#121212",
                            }}
                          >
                            Only pay for the first milestone today
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Milestones Section */}
                    {paymentSchedule === "milestones" && (
                      <div
                        style={{
                          marginTop: 24,
                          maxHeight: "2000px",
                          overflow: "hidden",
                          opacity: 1,
                          transform: "translateY(0)",
                          transition:
                            "max-height 0.5s ease-in-out, opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
                        }}
                      >
                        {milestones.map((milestone, index) => (
                          <div
                            key={milestone.id}
                            style={{
                              border: "1px solid #e0e0e0",
                              borderRadius: "8px",
                              padding: "20px",
                              marginBottom: "16px",
                              backgroundColor: "#fff",
                              position: "relative",
                              minHeight:
                                openDatePicker === `milestone-${milestone.id}`
                                  ? "400px"
                                  : "auto",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "16px",
                              }}
                            >
                              <h4
                                style={{
                                  fontSize: 20,
                                  fontWeight: 600,
                                  color: "#121212",
                                  margin: 0,
                                }}
                              >
                                Milestone {index + 1}
                              </h4>
                              {milestones.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeMilestone(milestone.id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#dc3545",
                                    cursor: "pointer",
                                    fontSize: 16,
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    transition: "all 0.3s ease-in-out",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = "#dc3545";
                                    e.target.style.color = "#fff";
                                    e.target.style.transform =
                                      "translateY(-1px)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = "none";
                                    e.target.style.color = "#dc3545";
                                    e.target.style.transform = "translateY(0)";
                                  }}
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            {/* Description Field */}
                            <div style={{ marginBottom: "16px" }}>
                              <label
                                style={{
                                  display: "block",
                                  fontSize: 16,
                                  fontWeight: 500,
                                  color: "#121212",
                                  marginBottom: "8px",
                                }}
                              >
                                Description
                              </label>
                              <input
                                type="text"
                                placeholder="What is the task?"
                                value={milestone.description}
                                onChange={(e) =>
                                  handleMilestoneChange(
                                    milestone.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                style={{
                                  width: "100%",
                                  border: formErrors[
                                    `milestone_${index}_description`
                                  ]
                                    ? "1px solid #dc3545"
                                    : "1px solid #e0e0e0",
                                  borderRadius: "6px",
                                  padding: "12px 16px",
                                  fontSize: 18,
                                  outline: "none",
                                  fontFamily: "inherit",
                                }}
                              />
                              {formErrors[`milestone_${index}_description`] && (
                                <div
                                  style={{
                                    color: "#dc3545",
                                    fontSize: 14,
                                    marginTop: 4,
                                  }}
                                >
                                  {formErrors[`milestone_${index}_description`]}
                                </div>
                              )}
                            </div>

                            {/* Amount and Due Date Row */}
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "16px",
                              }}
                            >
                              {/* Amount Field */}
                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: 18,
                                    fontWeight: 500,
                                    color: "#121212",
                                    marginBottom: "8px",
                                  }}
                                >
                                  Amount
                                </label>
                                <input
                                  type="text"
                                  value={milestone.amount}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numericValue = value.replace(
                                      /[^0-9]/g,
                                      ""
                                    );
                                    if (numericValue === "") {
                                      handleMilestoneChange(
                                        milestone.id,
                                        "amount",
                                        "₹"
                                      );
                                    } else {
                                      handleMilestoneChange(
                                        milestone.id,
                                        "amount",
                                        `₹${numericValue}`
                                      );
                                    }
                                  }}
                                  style={{
                                    width: "100%",
                                    border: formErrors[
                                      `milestone_${index}_amount`
                                    ]
                                      ? "1px solid #dc3545"
                                      : "1px solid #e0e0e0",
                                    borderRadius: "6px",
                                    padding: "12px 16px",
                                    fontSize: 18,
                                    outline: "none",
                                    fontFamily: "inherit",
                                    textAlign: "right",
                                  }}
                                />
                                {formErrors[`milestone_${index}_amount`] && (
                                  <div
                                    style={{
                                      color: "#dc3545",
                                      fontSize: 14,
                                      marginTop: 4,
                                    }}
                                  >
                                    {formErrors[`milestone_${index}_amount`]}
                                  </div>
                                )}
                              </div>

                              {/* Due Date Field */}
                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "8px",
                                  }}
                                >
                                  <label
                                    style={{
                                      fontSize: 18,
                                      fontWeight: 500,
                                      color: "#121212",
                                    }}
                                  >
                                    Due date (optional)
                                  </label>
                                  <div
                                    style={{
                                      width: 16,
                                      height: 16,
                                      borderRadius: "50%",
                                      backgroundColor: "#f0f0f0",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <span
                                      style={{ fontSize: 10, color: "#666" }}
                                    >
                                      ?
                                    </span>
                                  </div>
                                </div>
                                <div
                                  style={{
                                    position: "relative",
                                    display: "inline-block",
                                    width: "100%",
                                  }}
                                >
                                  <input
                                    type="text"
                                    placeholder="mm, dd yyyy"
                                    value={milestone.dueDate}
                                    readOnly
                                    onClick={() =>
                                      setOpenDatePicker(
                                        `milestone-${milestone.id}`
                                      )
                                    }
                                    style={{
                                      width: "100%",
                                      border: formErrors[
                                        `milestone_${index}_dueDate`
                                      ]
                                        ? "1px solid #dc3545"
                                        : "1px solid #e0e0e0",
                                      borderRadius: "6px",
                                      padding: "12px 40px 12px 16px",
                                      fontSize: 18,
                                      outline: "none",
                                      fontFamily: "inherit",
                                      cursor: "pointer",
                                      backgroundColor: "#fff",
                                    }}
                                  />
                                  {formErrors[`milestone_${index}_dueDate`] && (
                                    <div
                                      style={{
                                        color: "#dc3545",
                                        fontSize: 14,
                                        marginTop: 4,
                                      }}
                                    >
                                      {formErrors[`milestone_${index}_dueDate`]}
                                    </div>
                                  )}

                                  {/* Date Picker Component for Milestone */}
                                  <DatePicker
                                    isOpen={
                                      openDatePicker ===
                                      `milestone-${milestone.id}`
                                    }
                                    onClose={() => setOpenDatePicker(null)}
                                    onDateSelect={handleDateSelect}
                                    currentDate={currentDate}
                                    onNavigateMonth={navigateMonth}
                                    fieldId={milestone.id}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add Milestone Button */}
                        <button
                          type="button"
                          onClick={addMilestone}
                          style={{
                            background: "#fff",
                            border: "1px solid #007674",
                            color: "#007674",
                            borderRadius: "6px",
                            padding: "12px 24px",
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "all 0.3s ease-in-out",
                            ":hover": {
                              background: "#007674",
                              color: "#fff",
                              boxShadow: "0 4px 8px rgba(40, 167, 69, 0.3)",
                            },
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#007674";
                            e.target.style.color = "#fff";
                            e.target.style.boxShadow =
                              "0 4px 8px rgba(40, 167, 69, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#fff";
                            e.target.style.color = "#007674";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          Add milestone
                        </button>
                        {formErrors.milestones && (
                          <div
                            style={{
                              color: "#dc3545",
                              fontSize: 14,
                              marginTop: 8,
                            }}
                          >
                            {formErrors.milestones}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Due Date */}
                  <div style={{ marginBottom: 34, marginTop: 20 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 20,
                          fontWeight: 600,
                          color: "#121212",
                        }}
                      >
                        Due date (optional)
                      </label>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          backgroundColor: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontSize: 14, color: "#666" }}>?</span>
                      </div>
                    </div>
                    <div
                      style={{
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="mm, dd yyyy"
                        value={selectedDate ? formatDate(selectedDate) : ""}
                        readOnly
                        onClick={() => setOpenDatePicker("main")}
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: "6px",
                          padding: "12px 40px 12px 16px",
                          fontSize: 18,
                          outline: "none",
                          fontFamily: "inherit",
                          width: "200px",
                          cursor: "pointer",
                          backgroundColor: "#fff",
                        }}
                      />

                      {/* Date Picker Component for Main Due Date */}
                      <DatePicker
                        isOpen={openDatePicker === "main"}
                        onClose={() => setOpenDatePicker(null)}
                        onDateSelect={handleDateSelect}
                        currentDate={currentDate}
                        onNavigateMonth={navigateMonth}
                      />
                    </div>
                  </div>

                  {/* Expandable Sections */}
                  <div style={{ marginBottom: 32 }}>
                    <div
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      {/* First Section - Fixed Price Contracts */}
                      <div>
                        <div
                          onClick={() => toggleSection("fixedPriceContracts")}
                          style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #f0f0f0",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 20,
                              fontWeight: 600,
                              color: "#121212",
                            }}
                          >
                            How do fixed-price contracts work?
                          </span>
                          <span
                            style={{
                              fontSize: 14,
                              color: "#666",
                              transform: expandedSections.fixedPriceContracts
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.2s",
                            }}
                          >
                            ▼
                          </span>
                        </div>
                        <div
                          style={{
                            maxHeight: expandedSections.fixedPriceContracts
                              ? "500px"
                              : "0px",
                            overflow: "hidden",
                            transition: "max-height 0.3s ease-in-out",
                            backgroundColor: "#fff",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          <div
                            style={{
                              padding: "20px",
                              opacity: expandedSections.fixedPriceContracts
                                ? 1
                                : 0,
                              transform: expandedSections.fixedPriceContracts
                                ? "translateY(0)"
                                : "translateY(-10px)",
                              transition:
                                "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 18,
                                color: "#121212",
                                lineHeight: 1.6,
                                margin: "0 0 16px 0",
                              }}
                            >
                              Fixed-price contracts differ from hourly contracts
                              because they have milestones, which break down
                              larger projects into manageable chunks. Before
                              work begins, agree on milestones with your
                              freelancer. You'll deposit money into your project
                              funds, a neutral holding place that protects your
                              payment while the work is in progress.
                            </p>
                            <p
                              style={{
                                fontSize: 18,
                                color: "#121212",
                                lineHeight: 1.6,
                                margin: 0,
                              }}
                            >
                              Over the course of your contract, the freelancer
                              will submit milestones for review. After you
                              approve the work, you'll release payment through
                              your project funds. Failing to respond to a
                              milestone submission within 14 days is deemed
                              approval, so payment will be automatically
                              released to the freelancer.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Second Section - Contract Initiation Fee */}
                      <div>
                        <div
                          onClick={() => toggleSection("contractFee")}
                          style={{
                            padding: "16px 20px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 20,
                              fontWeight: 600,
                              color: "#121212",
                            }}
                          >
                            What is a Contract Initiation Fee?
                          </span>
                          <span
                            style={{
                              fontSize: 14,
                              color: "#666",
                              transform: expandedSections.contractFee
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.2s",
                            }}
                          >
                            ▼
                          </span>
                        </div>
                        <div
                          style={{
                            maxHeight: expandedSections.contractFee
                              ? "300px"
                              : "0px",
                            overflow: "hidden",
                            transition: "max-height 0.3s ease-in-out",
                            backgroundColor: "#fff",
                          }}
                        >
                          <div
                            style={{
                              padding: "20px",
                              opacity: expandedSections.contractFee ? 1 : 0,
                              transform: expandedSections.contractFee
                                ? "translateY(0)"
                                : "translateY(-10px)",
                              transition:
                                "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 18,
                                color: "#121212",
                                lineHeight: 1.6,
                                margin: 0,
                              }}
                            >
                              This is a one-time Contract Initiation Fee ranging
                              from ₹50 to ₹1,200 INR for each new Marketplace
                              and Project Catalog contract. We charge this fee
                              when you make the first payment to a freelancer
                              for hourly contracts. For fixed-price contracts,
                              you pay this fee when you fund the contract or
                              first milestone.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions Checkbox */}
                  <div style={{ marginBottom: 32 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        style={{
                          width: 20,
                          height: 20,
                          marginTop: 2,
                          cursor: "pointer",
                        }}
                      />
                      {formErrors.terms && (
                        <div
                          style={{
                            color: "#dc3545",
                            fontSize: 14,
                            marginTop: 4,
                            marginLeft: 32,
                          }}
                        >
                          {formErrors.terms}
                        </div>
                      )}
                      <span
                        style={{
                          fontSize: 18,
                          color: "#121212",
                          lineHeight: 1.5,
                        }}
                      >
                        Yes, I understand and agree to the{" "}
                        <span
                          style={{
                            color: "#007674",
                            fontWeight: 600,
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          Worksyde Terms of Service
                        </span>
                        , including the{" "}
                        <span
                          style={{
                            color: "#007674",
                            fontWeight: 600,
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          User Agreement
                        </span>{" "}
                        and{" "}
                        <span
                          style={{
                            color: "#007674",
                            fontWeight: 600,
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          Privacy Policy
                        </span>
                        .
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      style={{
                        backgroundColor: "#fff",
                        color: "#007674",
                        border: "1px solid #007674",
                        borderRadius: "6px",
                        padding: "12px 24px",
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.3s ease-in-out",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#f8f9fa";
                        e.target.style.boxShadow =
                          "0 4px 8px rgba(0, 118, 116, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#fff";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !isFormValid()}
                      style={{
                        backgroundColor: isFormValid() ? "#007674" : "#ccc",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "12px 24px",
                        fontSize: 16,
                        fontWeight: 600,
                        cursor:
                          submitting || !isFormValid()
                            ? "not-allowed"
                            : "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.3s ease-in-out",
                        opacity: submitting ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting && isFormValid()) {
                          e.target.style.backgroundColor = "#005a5a";
                          e.target.style.boxShadow =
                            "0 4px 8px rgba(0, 118, 116, 0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting && isFormValid()) {
                          e.target.style.backgroundColor = "#007674";
                          e.target.style.boxShadow = "none";
                        }
                      }}
                    >
                      {submitting ? "Sending..." : "Continue"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Freelancer Profile */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: 24,
              position: "sticky",
              top: 24,
            }}
          >
            {freelancer && (
              <div>
                {/* Profile Picture and Details */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  {/* Profile Picture */}
                  <div
                    style={{
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "#007674",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 24,
                        fontWeight: 600,
                        backgroundImage:
                          "url('https://via.placeholder.com/60x60/007674/FFFFFF?text=H')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {loading
                        ? "L"
                        : freelancer.name?.charAt(0)?.toUpperCase() || "H"}
                    </div>
                    {/* Online Status Indicator */}
                    <div
                      style={{
                        position: "absolute",
                        top: 2,
                        left: 2,
                        width: 12,
                        height: 12,
                        backgroundColor: "#666",
                        borderRadius: "50%",
                        border: "2px solid #fff",
                      }}
                    />
                  </div>

                  {/* Name and Details */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 22,
                        fontWeight: 600,
                        color: "#007674",
                        margin: "0 0 8px 0",
                        textDecoration: "underline",
                        letterSpacing: 0.3,
                        cursor: "pointer",
                      }}
                    >
                      {loading
                        ? "Loading..."
                        : freelancer.name || "Freelancer name not available"}
                    </h3>
                    <p
                      style={{
                        fontSize: 16,
                        color: "#121212",
                        margin: "0 0 12px 0",
                        lineHeight: 1.4,
                      }}
                    >
                      {loading
                        ? "Loading..."
                        : freelancer.title ||
                          "Professional title not available"}
                    </p>
                  </div>
                </div>

                {/* Location and Time */}
                <div
                  style={{
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 16,
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      color: "#121212",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {loading
                      ? "Loading..."
                      : freelancer.location || "Location not available"}
                  </p>
                  <p
                    style={{
                      fontSize: 16,
                      color: "#121212",
                      margin: "0",
                    }}
                  >
                    {new Date()
                      .toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                      .toLowerCase()}{" "}
                    local time
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferSendingPage;
