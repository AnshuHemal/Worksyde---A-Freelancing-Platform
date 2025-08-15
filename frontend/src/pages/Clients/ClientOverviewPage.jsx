import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BsEnvelope,
  BsPhone,
  BsCreditCard,
  BsPlus,
  BsThreeDots,
  BsGrid,
  BsList,
  BsChevronLeft,
  BsChevronRight,
  BsCheckCircle,
  BsShield,
  BsFileText,
  BsPeople,
  BsChat,
} from "react-icons/bs";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const API_URL = "http://localhost:5000/api/auth";

function formatName(name) {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}

const ClientOverviewPage = () => {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });


  // Phone verification modal states
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [loadingPhoneVerification, setLoadingPhoneVerification] =
    useState(false);
  const [loadingOtpVerification, setLoadingOtpVerification] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Verification status states
  const [verificationStatus, setVerificationStatus] = useState({
    emailVerified: false,
    phoneVerified: false,
    billingMethodAdded: false,
  });
  const [loadingVerification, setLoadingVerification] = useState(true);

  const navigate = useNavigate();
  const [publishingJobId, setPublishingJobId] = useState(null);

  // Function to get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Function to check verification status
  const checkVerificationStatus = async (userId) => {
    if (!userId) return;

    setLoadingVerification(true);
    try {
      // Check email verification from current user data
      const userResponse = await axios.get(`${API_URL}/current-user/`, {
        withCredentials: true,
      });

      if (userResponse.data.success && userResponse.data.user) {
        setVerificationStatus((prev) => ({
          ...prev,
          emailVerified: userResponse.data.user.isverified || false,
          phoneVerified: userResponse.data.user.phoneVerified === true,
        }));
      }

      // Check phone verification by getting user profile
      const profileResponse = await axios.get(
        `${API_URL}/client/profile-details/${userId}/`,
        {
          withCredentials: true,
        }
      );

      if (profileResponse.data.success) {
        // Check both profile.phone and user.phone for phone verification
        const phoneVerified = !!(
          profileResponse.data.phone ||
          (profileResponse.data.user && profileResponse.data.user.phone)
        );
        setVerificationStatus((prev) => ({
          ...prev,
          phoneVerified: phoneVerified,
        }));
      }

      // Check billing methods (payment cards and PayPal accounts)
      const [cardsResponse, paypalResponse] = await Promise.all([
        axios.get(`${API_URL}/payment-cards/`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/paypal-accounts/`, {
          withCredentials: true,
        }),
      ]);

      let hasBillingMethod = false;

      if (
        cardsResponse.data.success &&
        cardsResponse.data.cards &&
        cardsResponse.data.cards.length > 0
      ) {
        hasBillingMethod = true;
      }

      if (
        !hasBillingMethod &&
        paypalResponse.data.success &&
        paypalResponse.data.accounts &&
        paypalResponse.data.accounts.length > 0
      ) {
        hasBillingMethod = true;
      }

      setVerificationStatus((prev) => ({
        ...prev,
        billingMethodAdded: hasBillingMethod,
      }));
    } catch (error) {
      console.error("Error checking verification status:", error);
    } finally {
      setLoadingVerification(false);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoadingUser(true);
      try {
        const response = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });

        if (response.data.success && response.data.user) {
          setUserId(response.data.user._id);
          // Set user name from the API response
          setUserName(response.data.user.name || "User");

          // Check verification status after getting user ID
          await checkVerificationStatus(response.data.user._id);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        toast.error("Failed to fetch user info");
        setUserName("User"); // Fallback
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoadingJobs(true);
    axios
      .get(`${API_URL}/jobposts/client/${userId}/`)
      .then((res) => {
        setJobs(res.data.data || []);
      })
      .catch(() => toast.error("Failed to fetch jobs"))
      .finally(() => setLoadingJobs(false));
  }, [userId]);



  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowProposalModal(true);
    setLoadingProposals(true);
    axios
      .get(`${API_URL}/jobproposals/job/${job.id}/`)
      .then((res) => {
        setProposals(res.data.data || []);
      })
      .catch(() => toast.error("Failed to fetch proposals"))
      .finally(() => setLoadingProposals(false));
  };

  const handleHire = async (freelancerName, jobTitle, freelancerId) => {
    try {
      // Get client name from state
      const clientName = userName;
      const clientId = userId;
      // Call the backend API to send the system message
      await axios.post(
        "http://localhost:5000/api/chats/hire-notify/",
        {
          client_id: clientId,
          freelancer_id: freelancerId,
          job_title: jobTitle,
          client_name: clientName,
        },
        {
          withCredentials: true,
        }
      );
      toast.success(`${freelancerName} hired for the Post: ${jobTitle}`);
      // Generate room id (sorted)
      const roomId = [clientId, freelancerId].sort().join("_");
      // Navigate to chat window
      navigate(`/ws/messages?room=${roomId}&user=${freelancerId}`);
    } catch (err) {
      toast.error("Failed to send hire notification.");
    }
  };

  const handleThreeDotsClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    };
    setDropdownPosition(position);
    setShowDropdown((prev) => !prev);
  };

  const handleEditDraft = () => {
    setShowDropdown(false);
    toast.success("Edit draft functionality");
    // Add your edit draft logic here
  };

  const handleRemoveDraft = () => {
    setShowDropdown(false);
    toast.success("Remove draft functionality");
    // Add your remove draft logic here
  };

  // Phone verification handlers
  const handlePhoneVerificationClick = () => {
    setShowPhoneModal(true);
  };

  // Phone number validation function
  const validatePhoneNumber = (number) => {
    // Remove any non-digit characters
    const cleanNumber = number.replace(/\D/g, "");

    // Check if it's exactly 10 digits
    if (cleanNumber.length !== 10) {
      return false;
    }

    // Check if it contains only numbers
    if (!/^\d{10}$/.test(cleanNumber)) {
      return false;
    }

    // Check if it starts with 6, 7, 8, or 9
    const firstDigit = cleanNumber.charAt(0);
    if (!["6", "7", "8", "9"].includes(firstDigit)) {
      return false;
    }

    return true;
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error(
        "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9"
      );
      return;
    }

    setLoadingPhoneVerification(true);
    try {
      const response = await axios.post(
        `${API_URL}/send-verification-code/`,
        {
          phone_number: `${countryCode}${phoneNumber}`,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Verification code sent successfully!");
        setOtpSent(true);
        setShowPhoneModal(false);
        setShowOtpModal(true);
      } else {
        toast.error(
          response.data.message || "Failed to send verification code"
        );
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Failed to send verification code");
    } finally {
      setLoadingPhoneVerification(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }

    setLoadingOtpVerification(true);
    try {
      console.log("Sending OTP verification request:", {
        url: `${API_URL}/verify-phone/`,
        data: {
          phone_number: `${countryCode}${phoneNumber}`,
          otp_code: otpCode,
        },
      });

      const response = await axios.post(
        `${API_URL}/verify-phone/`,
        {
          phone_number: `${countryCode}${phoneNumber}`,
          otp_code: otpCode,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Phone number verified successfully!");
        setShowOtpModal(false);
        setOtpCode("");
        setPhoneNumber("");
        setOtpSent(false);
        // Refresh verification status
        await checkVerificationStatus(userId);
      } else {
        toast.error(response.data.message || "Invalid OTP code");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP");
    } finally {
      setLoadingOtpVerification(false);
    }
  };

  const handleResendOtp = async () => {
    setLoadingPhoneVerification(true);
    try {
      const response = await axios.post(
        `${API_URL}/send-verification-code/`,
        {
          phone_number: `${countryCode}${phoneNumber}`,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("New verification code sent successfully!");
      } else {
        toast.error(
          response.data.message || "Failed to resend verification code"
        );
      }
    } catch (error) {
      console.error("Error resending verification code:", error);
      toast.error("Failed to resend verification code");
    } finally {
      setLoadingPhoneVerification(false);
    }
  };

  const handleClosePhoneModal = () => {
    setShowPhoneModal(false);
    setPhoneNumber("");
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setOtpCode("");
    setPhoneNumber("");
    setOtpSent(false);
  };

  // Function to get steps with verification status
  const getSteps = (verificationStatus) => [
    {
      title: "Verify your email",
      desc: "Confirm it's you and establish trust with freelancers.",
      icon: <BsEnvelope size={20} />,
      action: (
        <Link
          to="#"
          style={{
            color: verificationStatus.emailVerified ? "#007476" : "#000",
            fontWeight: 600,
            textDecoration: "underline",
          }}
        >
          {verificationStatus.emailVerified
            ? "Email verified ✓"
            : "Verify your email"}
        </Link>
      ),
      required: "Required to hire",
      verified: verificationStatus.emailVerified,
    },
    {
      title: "Verify your phone number",
      desc: "Confirm it's you, to be able to publish your first job post.",
      icon: <BsPhone size={20} />,
      action: (
        <div
          onClick={
            verificationStatus.phoneVerified
              ? undefined
              : handlePhoneVerificationClick
          }
          style={{
            color: verificationStatus.phoneVerified ? "#007476" : "#000",
            fontWeight: 600,
            textDecoration: "underline",
            cursor: verificationStatus.phoneVerified ? "default" : "pointer",
          }}
        >
          {verificationStatus.phoneVerified
            ? "Phone verified ✓"
            : "Verify your phone number"}
        </div>
      ),
      required: "Required to publish a job",
      verified: verificationStatus.phoneVerified,
    },
    {
      title: "Add a billing method",
      desc: "This can increase your hiring speed by up to 3x. There's no cost until you hire.",
      icon: <BsShield size={20} />,
      action: (
        <Link
          to="#"
          style={{
            color: verificationStatus.billingMethodAdded ? "#007476" : "#000",
            fontWeight: 600,
            textDecoration: "underline",
          }}
        >
          {verificationStatus.billingMethodAdded
            ? "Billing method added ✓"
            : "Add a billing method"}
        </Link>
      ),
      required: "Required to hire",
      verified: verificationStatus.billingMethodAdded,
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the dropdown itself
      if (event.target.closest(".dropdown-menu")) {
        return;
      }
      setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <div
      className="section-container"
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <style>{`
        .client-main-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 48px 32px 48px 32px;
        }
        .client-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }
        .client-greeting {
          font-size: 1.75rem;
          font-weight: 600;
          color: #000000;
        }
        .post-job-btn {
          background: linear-gradient(135deg, #007674 0%, #005a58 100%);
          color: #ffffff;
          border: none;
          border-radius: 15px;
          padding: 12px 24px;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(0, 118, 116, 0.3);
        }
        .post-job-btn:hover {
          background: linear-gradient(135deg, #121212 0%, #0a0a0a 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(18, 18, 18, 0.4);
        }
        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #000000;
          margin-bottom: 32px;
        }
        .steps-row {
          display: flex;
          gap: 24px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }
                 .step-card {
           background: #ffffff;
           border-radius: 8px;
           border: 1px solid #e5e7eb;
           flex: 1 1 320px;
           min-width: 320px;
           max-width: 380px;
           padding: 24px;
           display: flex;
           flex-direction: column;
           gap: 12px;
           position: relative;
           transition: all 0.3s ease;
         }
         .step-card.verified {
           border: 2px solid #007476;
           background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
           box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
         }
        .step-card .step-icon {
          position: absolute;
          top: 24px;
          right: 24px;
          color: #000000;
        }
        .step-card.verified .step-icon {
          color: #007476;
        }
        .step-required {
          font-size: 1rem;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .step-title {
          font-size: 1.325rem;
          font-weight: 600;
          color: #000000;
          margin-bottom: 8px;
        }
        .step-desc {
          color: #374151;
          font-size: 1.05rem;
          line-height: 1.5;
        }
        .overview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 48px;
        }
        .overview-card {
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          min-height: 200px;
        }
        .job-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .job-card-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.125rem;
          font-weight: 600;
          color: #000000;
        }
        .job-card-icon {
          color: #6b7280;
        }
        .job-card-menu {
          color: #007476;
          cursor: pointer;
          padding: 4px;
          width: 30px;
          height: 30px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        .job-card-menu:hover {
          background: rgba(34, 197, 94, 0.1);
        }
        .dropdown-menu {
          position: fixed;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          padding: 8px 0;
          z-index: 99999;
          min-width: 140px;
          transform: translateX(-50%);
        }
        .dropdown-menu::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid #ffffff;
          filter: drop-shadow(0 -1px 1px rgba(0, 0, 0, 0.1));
        }
        .dropdown-item {
          padding: 8px 16px;
          cursor: pointer;
          font-size: 0.875rem;
          color: #374151;
          transition: background-color 0.2s ease;
        }
        .dropdown-item:hover {
          background-color: #f3f4f6;
        }
        .job-status-badge {
          background: #dbeafe;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 4px 18px;
          display: inline-block;
          align-self: flex-start;
        }
        .job-status-message {
          color: #121212;
          padding-top: 10px;
          padding-bottom: 20px;
          font-size: 1.05rem;
          line-height: 1.5;
        }
        .job-action-btn {
          background: linear-gradient(135deg, #007674 0%, #005a58 100%);
          color: #ffffff;
          border: none;
          border-radius: 15px;
          padding: 12px 24px;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: auto;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(0, 118, 116, 0.3);
        }
        .job-action-btn:hover {
          background: linear-gradient(135deg, #121212 0%, #0a0a0a 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(18, 18, 18, 0.4);
        }
        .post-job-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #007476;
          font-size: 1rem;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .post-job-card:hover {
          background: #fff;
        }
        .post-job-icon {
          width: 40px;
          height: 40px;
          font-size: 2rem;
          color: #007476;
        }
                 @media (max-width: 900px) {
           .steps-row { flex-direction: column; gap: 20px; }
           .overview-grid { grid-template-columns: 1fr; gap: 20px; }
         }
         
         /* Phone Verification Modal Styles */
         .phone-modal-overlay {
           position: fixed;
           top: 0;
           left: 0;
           right: 0;
           bottom: 0;
           background: rgba(0, 0, 0, 0.5);
           display: flex;
           align-items: center;
           justify-content: center;
           z-index: 100000;
         }
         .phone-modal {
           background: #ffffff;
           border-radius: 12px;
           padding: 32px;
           max-width: 800px;
           width: 600px;
           position: relative;
           box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
         }
         .phone-modal-close {
           position: absolute;
           top: 16px;
           right: 16px;
           background: none;
           border: none;
           font-size: 24px;
           cursor: pointer;
           color: #6b7280;
           width: 32px;
           height: 32px;
           display: flex;
           align-items: center;
           justify-content: center;
           border-radius: 4px;
           transition: background-color 0.2s ease;
         }
         .phone-modal-close:hover {
           background: #f3f4f6;
         }
         .phone-modal-title {
           font-size: 1.5rem;
           font-weight: 600;
           color: #000000;
           margin-bottom: 8px;
           text-align: center;
         }
         .phone-modal-subtitle {
           font-size: 1rem;
           color: #6b7280;
           text-align: center;
           margin-bottom: 24px;
           line-height: 1.5;
         }
         .phone-input-container {
           margin-bottom: 16px;
         }
         .phone-input-group {
           display: flex;
           border: 1px solid #d1d5db;
           border-radius: 8px;
           overflow: hidden;
           background: #ffffff;
         }
         .country-selector {
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 8px;
           padding: 12px 16px;
           background: #f9fafb;
           border-right: 1px solid #d1d5db;
           cursor: pointer;
           min-width: 100px;
           font-size: 1.05rem;
           font-weight: 500;
           color: #121212;
         }
         .phone-input {
           flex: 1;
           border: none;
           padding: 12px 16px;
           font-size: 1rem;
           outline: none;
           background: #ffffff;
         }
         .phone-input::placeholder {
           color: #9ca3af;
         }
         .phone-modal-disclaimer {
           font-size: 1rem;
           color: #121212;
           text-align: center;
           line-height: 1.6;
           margin-top: 20px;
           margin-bottom: 24px;
         }
         .send-code-btn {
           background: linear-gradient(135deg, #007674 0%, #005a58 100%);
           color: #ffffff;
           border: none;
           border-radius: 15px;
           text-align: center;
           padding: 12px 24px;
           font-size: 1rem;
           font-weight: 600;
           transition: all 0.3s ease;
           width: 25%;
           cursor: pointer;
           box-shadow: 0 6px 20px rgba(0, 118, 116, 0.3);
         }
         .send-code-btn:hover {
           background: linear-gradient(135deg, #121212 0%, #0a0a0a 100%);
           transform: translateY(-2px);
           box-shadow: 0 8px 25px rgba(18, 18, 18, 0.4);
         }
                   .send-code-btn:disabled {
            background: #d1d5db;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          
          /* OTP Verification Modal Styles */
          .otp-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
          }
          .otp-modal {
            background: #ffffff;
            border-radius: 12px;
            padding: 32px;
            max-width: 400px;
            width: 100%;
            position: relative;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          .otp-modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background-color 0.2s ease;
          }
          .otp-modal-close:hover {
            background: #f3f4f6;
          }
          .otp-modal-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #000000;
            margin-bottom: 8px;
            text-align: center;
          }
          .otp-modal-subtitle {
            font-size: 1rem;
            color: #6b7280;
            text-align: center;
            margin-bottom: 24px;
            line-height: 1.5;
          }
          .otp-input-container {
            margin-bottom: 24px;
          }
          .otp-input {
            width: 100%;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 1.25rem;
            text-align: center;
            letter-spacing: 4px;
            font-weight: 600;
            outline: none;
            background: #ffffff;
          }
          .otp-input:focus {
            border-color: #007476;
            box-shadow: 0 0 0 3px rgba(0, 118, 116, 0.1);
          }
          .otp-input::placeholder {
            color: #9ca3af;
            letter-spacing: 2px;
          }
          .otp-phone-display {
            text-align: center;
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 16px;
          }
          .verify-otp-btn {
            background: linear-gradient(135deg, #007674 0%, #005a58 100%);
            color: #ffffff;
            border: none;
            border-radius: 15px;
            text-align: center;
            padding: 12px 24px;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            width: 100%;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.3);
            margin-bottom: 16px;
          }
          .verify-otp-btn:hover {
            background: linear-gradient(135deg, #121212 0%, #0a0a0a 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(18, 18, 18, 0.4);
          }
          .verify-otp-btn:disabled {
            background: #d1d5db;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          .resend-otp-btn {
            background: none;
            border: none;
            color: #007476;
            font-size: 0.875rem;
            cursor: pointer;
            text-decoration: underline;
            transition: color 0.2s ease;
          }
          .resend-otp-btn:hover {
            color: #005a58;
          }
          .resend-otp-btn:disabled {
            color: #9ca3af;
            cursor: not-allowed;
            text-decoration: none;
          }
      `}</style>
      <div className="client-main-container">
        {/* Header Row */}
        <div className="client-header-row">
          <div className="client-greeting">
            {loadingUser ? "Loading..." : `${getGreeting()}, ${userName}.`}
          </div>
          <Link to="/client/post-job">
            <button className="post-job-btn">
              <BsPlus size={18} /> Post a job
            </button>
          </Link>
        </div>

        {/* Last steps before you can hire */}
        <div className="section-title">Last steps before you can hire</div>
        <div className="steps-row">
          {loadingVerification
            ? // Loading skeleton
              Array.from({ length: 3 }).map((_, idx) => (
                <div className="step-card" key={idx}>
                  <div className="step-icon">
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        background: "#e5e7eb",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                  <div
                    className="step-required"
                    style={{
                      background: "#e5e7eb",
                      height: "16px",
                      width: "60%",
                      borderRadius: "4px",
                    }}
                  ></div>
                  <div
                    className="step-title"
                    style={{
                      background: "#e5e7eb",
                      height: "20px",
                      width: "80%",
                      borderRadius: "4px",
                    }}
                  ></div>
                  <div
                    className="step-desc"
                    style={{
                      background: "#e5e7eb",
                      height: "40px",
                      width: "100%",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
              ))
            : getSteps(verificationStatus).map((step, idx) => (
                <div
                  className={`step-card ${step.verified ? "verified" : ""}`}
                  key={idx}
                >
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-required">{step.required}</div>
                  <div className="step-title">{step.action}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
              ))}
        </div>

        {/* Overview Section */}
        <div className="overview-header">
          <div className="section-title">Overview</div>
        </div>

        <div className="overview-grid">
          {/* Job Posts Grid */}
          {loadingJobs ? (
            <div
              className="overview-card"
              style={{ gridColumn: "1 / -1", textAlign: "center" }}
            >
              Loading job posts...
            </div>
          ) : jobs.length === 0 ? (
            <div
              className="overview-card"
              style={{ gridColumn: "1 / -1", textAlign: "center" }}
            >
              No job posts yet.{" "}
              <Link to="/client/post-job">Post your first job</Link>!
            </div>
          ) : (
            jobs.map((job) => {
              const isVerified = job.status === "verified";
              const allVerificationsDone =
                verificationStatus.emailVerified &&
                verificationStatus.phoneVerified;
              const handleJobButtonClick = async (e) => {
                e.stopPropagation();
                if (isVerified) {
                  handleJobClick(job);
                } else if (!allVerificationsDone) {
                  // Check which verification is missing
                  if (!verificationStatus.phoneVerified) {
                    setShowPhoneModal(true);
                  } else if (!verificationStatus.emailVerified) {
                    toast.error(
                      "Please verify your email to publish your job post."
                    );
                    // Optionally scroll to steps section
                    const stepsSection = document.querySelector(".steps-row");
                    if (stepsSection)
                      stepsSection.scrollIntoView({ behavior: "smooth" });
                  } else {
                    toast.error("Please complete all required verifications.");
                  }
                } else {
                  // All verifications done but job is not published
                  setPublishingJobId(job.id);
                  try {
                    const res = await axios.post(
                      `${API_URL}/jobpost/publish/${job.id}/`,
                      {},
                      { withCredentials: true }
                    );
                    if (res.data.success) {
                      toast.success("Job post published successfully!");
                      setJobs((prevJobs) =>
                        prevJobs.map((j) =>
                          j.id === job.id ? { ...j, status: "verified" } : j
                        )
                      );
                    } else {
                      toast.error(
                        res.data.message || "Failed to publish job post."
                      );
                    }
                  } catch (err) {
                    toast.error("Failed to publish job post.");
                  } finally {
                    setPublishingJobId(null);
                  }
                }
              };
              return (
                <div
                  key={job.id}
                  className="overview-card"
                  style={{ cursor: "pointer", minHeight: 320 }}
                  onClick={() => navigate(`/ws/client/applicants/${job.id}`)}
                >
                  {isVerified ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background: "#f3f4f6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <BsFileText
                              style={{ color: "#bdbdbd", fontSize: 22 }}
                            />
                          </div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 20,
                              color: "#222",
                            }}
                          >
                            {job.title || "Untitled Job"}
                          </div>
                        </div>
                        <BsThreeDots
                          className="job-card-menu"
                          style={{
                            fontSize: 22,
                            color: "#888",
                            cursor: "pointer",
                          }}
                          onClick={handleThreeDotsClick}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            background: "#f1f8ff",
                            color: "#007476",
                            fontWeight: 600,
                            fontSize: 17,
                            borderRadius: 12,
                            padding: "4px 14px",
                            display: "inline-block",
                          }}
                        >
                          Open job post
                        </span>
                        <span style={{ color: "#888", fontSize: 16 }}>
                          {formatJobTimestamp(job)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          margin: "10px 0 10px 0",
                          fontSize: 15,
                          color: "#222",
                          fontWeight: 500,
                        }}
                      >
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div
                            style={{
                              color: "#121212",
                              fontSize: 16,
                              marginBottom: 2,
                            }}
                          >
                            Invited
                          </div>
                          <div
                            style={{
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                            }}
                          >
                            <BsEnvelope style={{ fontSize: 17 }} /> 0/30
                          </div>
                        </div>
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div
                            style={{
                              color: "#121212",
                              fontSize: 16,
                              marginBottom: 2,
                            }}
                          >
                            Proposals
                          </div>
                          <div
                            style={{
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                            }}
                          >
                            <BsPeople style={{ fontSize: 17 }} /> 
                            {loadingJobs ? (
                              <span style={{ fontSize: "14px", color: "#6b7280" }}>...</span>
                            ) : (
                              job.applicants !== undefined && job.applicants !== null ? job.applicants : 0
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div
                            style={{
                              color: "#121212",
                              fontSize: 16,
                              marginBottom: 2,
                            }}
                          >
                            Messaged
                          </div>
                          <div
                            style={{
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                            }}
                          >
                            <BsChat style={{ fontSize: 17 }} /> 0
                          </div>
                        </div>
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div
                            style={{
                              color: "#121212",
                              fontSize: 16,
                              marginBottom: 2,
                            }}
                          >
                            Hired
                          </div>
                          <div
                            style={{
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                            }}
                          >
                            <BsCheckCircle style={{ fontSize: 17 }} /> 0/1
                          </div>
                        </div>
                      </div>
                      <button
                        className="job-action-btn"
                        style={{
                          marginTop: 18,
                          background:
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 15,
                          fontWeight: 600,
                          fontSize: 17,
                          boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                          width: "100%",
                          padding: "12px 0",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ws/client/applicants/${job.id}`);
                        }}
                      >
                        Find talent
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="job-card-header">
                        <div className="job-card-title">
                          <BsFileText className="job-card-icon" />
                          {job.title || "Untitled Job"}
                        </div>
                        <span className="job-status-badge">
                          {job.status === "draft"
                            ? "Draft"
                            : job.status === "verified"
                            ? "Live"
                            : job.status}
                        </span>
                      </div>
                      <div
                        className="job-status-message"
                        style={{ minHeight: 40 }}
                      >
                        {job.description
                          ? job.description.slice(0, 100) +
                            (job.description.length > 100 ? "..." : "")
                          : "No description."}
                      </div>
                      <button
                        className="job-action-btn"
                        style={{ marginTop: 16 }}
                        onClick={handleJobButtonClick}
                        disabled={
                          !isVerified && allVerificationsDone
                            ? publishingJobId === job.id
                            : !isVerified && allVerificationsDone
                        }
                      >
                        {isVerified
                          ? "View Proposals"
                          : !allVerificationsDone
                          ? "Verify and Publish your job post"
                          : publishingJobId === job.id
                          ? "Publishing..."
                          : "Publish your job post"}
                      </button>
                    </>
                  )}
                </div>
              );
            })
          )}

          {/* Post Job Card */}
          <div className="overview-card">
            <Link
              to="/client/post-job"
              style={{ textDecoration: "none", height: "100%" }}
            >
              <div className="post-job-card">
                <BsPlus className="post-job-icon" />
                <span>Post a job</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div
            style={{
              position: "fixed",
              left: dropdownPosition.x,
              top: dropdownPosition.y,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
              padding: "8px 0",
              zIndex: 99999,
              minWidth: "140px",
              transform: "translateX(-50%)",
            }}
          >
            <div
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: "#374151",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
              onClick={handleEditDraft}
            >
              Edit draft
            </div>
            <div
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: "#374151",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
              onClick={handleRemoveDraft}
            >
              Remove draft
            </div>
          </div>
        )}

        {/* Phone Verification Modal */}
        {showPhoneModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              margin: 0,
            }}
            onClick={handleClosePhoneModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              style={{
                background: "#fff",
                borderRadius: 16,
                width: "600px",
                boxShadow: "0 20px 48px 0 rgba(0,0,0,0.18)",
                border: "1px solid #e6e6e6",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                padding: 40,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="phone-modal-close"
                onClick={handleClosePhoneModal}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#6b7280",
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  transition: "background-color 0.2s ease",
                  zIndex: 2,
                }}
              >
                ×
              </button>
              <div
                className="phone-modal-title"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "#000",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                Please verify your phone number
              </div>
              <div
                className="phone-modal-subtitle"
                style={{
                  fontSize: "1rem",
                  color: "#6b7280",
                  textAlign: "center",
                  marginBottom: 24,
                  lineHeight: 1.5,
                }}
              >
                We'll text you a code to verify your number.
              </div>
              <div
                className="phone-input-container"
                style={{ marginBottom: 16 }}
              >
                <div
                  className="phone-input-group"
                  style={{
                    display: "flex",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  <div
                    className="country-selector"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "12px 16px",
                      background: "#f9fafb",
                      borderRight: "1px solid #d1d5db",
                      minWidth: 100,
                      fontSize: "1.05rem",
                      fontWeight: 500,
                      color: "#121212",
                    }}
                  >
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    className="phone-input"
                    placeholder="Enter number"
                    value={phoneNumber}
                    onChange={(e) => {
                      // Only allow digits
                      const value = e.target.value.replace(/\D/g, "");
                      // Limit to 10 digits
                      if (value.length <= 10) {
                        setPhoneNumber(value);
                      }
                    }}
                    maxLength="10"
                    style={{
                      flex: 1,
                      border: "none",
                      padding: "12px 16px",
                      fontSize: "1rem",
                      outline: "none",
                      background: "#fff",
                    }}
                  />
                </div>
              </div>
              <div
                className="phone-modal-disclaimer"
                style={{
                  fontSize: "1rem",
                  color: "#121212",
                  textAlign: "center",
                  lineHeight: 1.6,
                  marginTop: 20,
                  marginBottom: 24,
                }}
              >
                Messaging rates may apply.
                <br />
                We'll use this number for verification purposes only — we won't
                share it or use it for marketing.
              </div>
              <div className="text-center" style={{ textAlign: "center" }}>
                <button
                  className="send-code-btn"
                  onClick={handleSendCode}
                  disabled={
                    loadingPhoneVerification ||
                    !validatePhoneNumber(phoneNumber)
                  }
                  style={{
                    background:
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 15,
                    textAlign: "center",
                    padding: "12px 24px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    width: "40%",
                    cursor:
                      loadingPhoneVerification ||
                      !validatePhoneNumber(phoneNumber)
                        ? "not-allowed"
                        : "pointer",
                    boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                  }}
                >
                  {loadingPhoneVerification ? "Sending..." : "Send code"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div className="otp-modal-overlay" onClick={handleCloseOtpModal}>
            <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
              <button className="otp-modal-close" onClick={handleCloseOtpModal}>
                ×
              </button>

              <div className="otp-modal-title">Enter verification code</div>
              <div className="otp-modal-subtitle">
                We've sent a 6-digit code to your phone number.
              </div>

              <div className="otp-phone-display">
                {countryCode} {phoneNumber}
              </div>

              <div className="otp-input-container">
                <input
                  type="text"
                  className="otp-input"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => {
                    // Only allow digits
                    const value = e.target.value.replace(/\D/g, "");
                    // Limit to 6 digits
                    if (value.length <= 6) {
                      setOtpCode(value);
                    }
                  }}
                  maxLength="6"
                  autoFocus
                />
              </div>

              <button
                className="verify-otp-btn"
                onClick={handleVerifyOtp}
                disabled={loadingOtpVerification || otpCode.length !== 6}
              >
                {loadingOtpVerification ? "Verifying..." : "Verify"}
              </button>

              <div className="text-center">
                <button
                  className="resend-otp-btn"
                  onClick={handleResendOtp}
                  disabled={loadingPhoneVerification}
                >
                  {loadingPhoneVerification ? "Sending..." : "Resend code"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOverviewPage;

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 60000); // minutes
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff} minute${diff > 1 ? "s" : ""} ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function formatJobTimestamp(job) {
  if (!job.updatedAt && !job.createdAt) return "";

  const updatedAt = job.updatedAt ? new Date(job.updatedAt) : null;
  const createdAt = job.createdAt ? new Date(job.createdAt) : null;

  // If there's an update time and it's different from creation time, show "Updated"
  if (updatedAt && createdAt && updatedAt.getTime() !== createdAt.getTime()) {
    return `Created ${timeAgo(job.updatedAt)}`;
  }

  // Otherwise show "Created"
  return `Created ${timeAgo(job.createdAt || job.updatedAt)}`;
}
