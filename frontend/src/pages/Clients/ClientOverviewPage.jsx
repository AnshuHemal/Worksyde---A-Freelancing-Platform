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
} from "react-icons/bs";
import axios from "axios";
import toast from "react-hot-toast";
import ProposalDetailsModal from "./ProposalDetailsModal";

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
  const [loadingPhoneVerification, setLoadingPhoneVerification] = useState(false);
  const [loadingOtpVerification, setLoadingOtpVerification] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  // Verification status states
  const [verificationStatus, setVerificationStatus] = useState({
    emailVerified: false,
    phoneVerified: false,
    billingMethodAdded: false
  });
  const [loadingVerification, setLoadingVerification] = useState(true);
  
  const navigate = useNavigate();

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
        setVerificationStatus(prev => ({
          ...prev,
          emailVerified: userResponse.data.user.isverified || false
        }));
      }

      // Check phone verification by getting user profile
      const profileResponse = await axios.get(`${API_URL}/profile/`, {
        withCredentials: true,
      });
      
      if (profileResponse.data.success) {
        // Check both profile.phone and user.phone for phone verification
        const phoneVerified = !!(profileResponse.data.phone || 
                                (profileResponse.data.user && profileResponse.data.user.phone));
        setVerificationStatus(prev => ({
          ...prev,
          phoneVerified: phoneVerified
        }));
      }

      // Check billing methods (payment cards and PayPal accounts)
      const [cardsResponse, paypalResponse] = await Promise.all([
        axios.get(`${API_URL}/payment-cards/`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/paypal-accounts/`, {
          withCredentials: true,
        })
      ]);

      let hasBillingMethod = false;

      if (cardsResponse.data.success && cardsResponse.data.cards && cardsResponse.data.cards.length > 0) {
        hasBillingMethod = true;
      }

      if (!hasBillingMethod && paypalResponse.data.success && paypalResponse.data.accounts && paypalResponse.data.accounts.length > 0) {
        hasBillingMethod = true;
      }

      setVerificationStatus(prev => ({
        ...prev,
        billingMethodAdded: hasBillingMethod
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
      await axios.post("http://localhost:5000/api/chats/hire-notify/", {
        client_id: clientId,
        freelancer_id: freelancerId,
        job_title: jobTitle,
        client_name: clientName,
      }, {
        withCredentials: true,
      });
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
      y: rect.bottom + 8
    };
    setDropdownPosition(position);
    setShowDropdown(prev => !prev);
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
    const cleanNumber = number.replace(/\D/g, '');
    
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
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
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
      toast.error("Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9");
      return;
    }

    setLoadingPhoneVerification(true);
    try {
      const response = await axios.post(`${API_URL}/send-verification-code/`, {
        phone_number: `${countryCode}${phoneNumber}`,
      }, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success("Verification code sent successfully!");
        setOtpSent(true);
        setShowPhoneModal(false);
        setShowOtpModal(true);
      } else {
        toast.error(response.data.message || "Failed to send verification code");
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
        }
      });
      
      const response = await axios.post(`${API_URL}/verify-phone/`, {
        phone_number: `${countryCode}${phoneNumber}`,
        otp_code: otpCode,
      }, {
        withCredentials: true,
      });

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
      const response = await axios.post(`${API_URL}/send-verification-code/`, {
        phone_number: `${countryCode}${phoneNumber}`,
      }, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success("New verification code sent successfully!");
      } else {
        toast.error(response.data.message || "Failed to resend verification code");
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
          {verificationStatus.emailVerified ? "Email verified ✓" : "Verify your email"}
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
          onClick={verificationStatus.phoneVerified ? undefined : handlePhoneVerificationClick}
          style={{
            color: verificationStatus.phoneVerified ? "#007476" : "#000",
            fontWeight: 600,
            textDecoration: "underline",
            cursor: verificationStatus.phoneVerified ? "default" : "pointer",
          }}
        >
          {verificationStatus.phoneVerified ? "Phone verified ✓" : "Verify your phone number"}
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
            color: verificationStatus.billingMethodAdded ? "#22c55e" : "#000",
            fontWeight: 600,
            textDecoration: "underline",
          }}
        >
          {verificationStatus.billingMethodAdded ? "Billing method added ✓" : "Add a billing method"}
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
      if (event.target.closest('.dropdown-menu')) {
        return;
      }
      setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <div className="section-container"
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <style>{`
        .client-main-container {
          max-width: 1200px;
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
           background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
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
          background: #f0fdf4;
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
           {loadingVerification ? (
             // Loading skeleton
             Array.from({ length: 3 }).map((_, idx) => (
               <div className="step-card" key={idx}>
                 <div className="step-icon">
                   <div style={{ width: 20, height: 20, background: '#e5e7eb', borderRadius: '4px' }}></div>
                 </div>
                 <div className="step-required" style={{ background: '#e5e7eb', height: '16px', width: '60%', borderRadius: '4px' }}></div>
                 <div className="step-title" style={{ background: '#e5e7eb', height: '20px', width: '80%', borderRadius: '4px' }}></div>
                 <div className="step-desc" style={{ background: '#e5e7eb', height: '40px', width: '100%', borderRadius: '4px' }}></div>
               </div>
             ))
           ) : (
             getSteps(verificationStatus).map((step, idx) => (
               <div className={`step-card ${step.verified ? 'verified' : ''}`} key={idx}>
                 <div className="step-icon">{step.icon}</div>
                 <div className="step-required">{step.required}</div>
                 <div className="step-title">{step.action}</div>
                 <div className="step-desc">{step.desc}</div>
               </div>
             ))
           )}
         </div>

        {/* Overview Section */}
        <div className="overview-header">
          <div className="section-title">Overview</div>
        </div>

        <div className="overview-grid">
          {/* Job Post Status Card */}
          <div className="overview-card">
            <div className="job-card-header">
              <div className="job-card-title">
                <BsFileText className="job-card-icon" />
                Freelancing Website Development Project
              </div>
              <BsThreeDots 
                className="job-card-menu" 
                onClick={handleThreeDotsClick}
              />
            </div>
            <div className="job-status-badge">Pending job post</div>
            <div className="job-status-message">
              Your job post is not live yet.<br />
              You need to verify your email and phone number first.
            </div>
            <button className="job-action-btn">
              Verify and publish your job
            </button>
          </div>

          {/* Post Job Card */}
          <div className="overview-card">
            <Link to="/client/post-job" style={{ textDecoration: 'none', height: '100%' }}>
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
              position: 'fixed',
              left: dropdownPosition.x,
              top: dropdownPosition.y,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              padding: '8px 0',
              zIndex: 99999,
              minWidth: '140px',
              transform: 'translateX(-50%)',
            }}
          >
            <div 
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#374151',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={handleEditDraft}
            >
              Edit draft
            </div>
            <div 
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#374151',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={handleRemoveDraft}
            >
              Remove draft
            </div>
          </div>
        )}

                 <ProposalDetailsModal
           show={showProposalModal}
           onClose={() => setShowProposalModal(false)}
           proposals={proposals}
           jobTitle={selectedJob ? selectedJob.title : ""}
           onHire={(freelancerName, jobTitle, freelancerId) =>
             handleHire(freelancerName, jobTitle, freelancerId)
           }
         />

                   {/* Phone Verification Modal */}
          {showPhoneModal && (
            <div className="phone-modal-overlay" onClick={handleClosePhoneModal}>
              <div className="phone-modal" onClick={(e) => e.stopPropagation()}>
                <button className="phone-modal-close" onClick={handleClosePhoneModal}>
                  ×
                </button>
                
                <div className="phone-modal-title">Please verify your phone number</div>
                <div className="phone-modal-subtitle">
                  We'll text you a code to verify your number.
                </div>
                
                <div className="phone-input-container">
                  <div className="phone-input-group">
                    <div className="country-selector">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      className="phone-input"
                      placeholder="Enter number"
                      value={phoneNumber}
                      onChange={(e) => {
                        // Only allow digits
                        const value = e.target.value.replace(/\D/g, '');
                        // Limit to 10 digits
                        if (value.length <= 10) {
                          setPhoneNumber(value);
                        }
                      }}
                      maxLength="10"
                    />
                  </div>
                </div>
                
                <div className="phone-modal-disclaimer">
                  Messaging rates may apply.<br />
                  We'll use this number for verification purposes only — we won't share it or use it for marketing.
                </div>
                
                <div className="text-center">
                  <button
                    className="send-code-btn"
                    onClick={handleSendCode}
                    disabled={loadingPhoneVerification || !validatePhoneNumber(phoneNumber)}
                  >
                    {loadingPhoneVerification ? "Sending..." : "Send code"}
                  </button>
                </div>
              </div>
            </div>
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
                      const value = e.target.value.replace(/\D/g, '');
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
