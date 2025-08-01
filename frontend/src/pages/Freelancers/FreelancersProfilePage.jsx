import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FiEdit2,
  FiShare2,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiBriefcase,
  FiFolder,
  FiZoomIn,
  FiRotateCw,
  FiMove,
  FiExternalLink,
} from "react-icons/fi";
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
  const [showOtherExperiencesModal, setShowOtherExperiencesModal] =
    useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [bioValue, setBioValue] = useState("");
  const [skillsValue, setSkillsValue] = useState([]);
  const [skillSearchValue, setSkillSearchValue] = useState("");
  const [employmentHistory, setEmploymentHistory] = useState([]);
  const [otherExperienceSubject, setOtherExperienceSubject] = useState("");
  const [otherExperienceDescription, setOtherExperienceDescription] =
    useState("");
  const [educationInstitution, setEducationInstitution] = useState("");
  const [educationDegree, setEducationDegree] = useState("");
  const [educationField, setEducationField] = useState("");
  const [educationStartYear, setEducationStartYear] = useState("");
  const [educationEndYear, setEducationEndYear] = useState("");
  const [educationDescription, setEducationDescription] = useState("");
  const [educationIsExpected, setEducationIsExpected] = useState(false);
  const [editingEducationIndex, setEditingEducationIndex] = useState(null);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = React.useRef(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [savedVideoUrl, setSavedVideoUrl] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState("");
  const [showProficiencyDropdown, setShowProficiencyDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [showEditLanguageModal, setShowEditLanguageModal] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState("");
  const [editingProficiency, setEditingProficiency] = useState("");
  const [showEditProficiencyDropdown, setShowEditProficiencyDropdown] = useState(false);
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(0);
  const [editingLanguages, setEditingLanguages] = useState([]);
  const [showHourlyRateModal, setShowHourlyRateModal] = useState(false);
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);
  const [isEditingEmployment, setIsEditingEmployment] = useState(false);
  const [editingEmploymentIndex, setEditingEmploymentIndex] = useState(null);
  const [hourlyRateValue, setHourlyRateValue] = useState("1000");
  
  // Employment form state
  const [employmentCompany, setEmploymentCompany] = useState("");
  const [employmentCity, setEmploymentCity] = useState("");
  const [employmentCountry, setEmploymentCountry] = useState("");
  const [employmentTitle, setEmploymentTitle] = useState("");
  const [employmentStartMonth, setEmploymentStartMonth] = useState("");
  const [employmentStartYear, setEmploymentStartYear] = useState("");
  const [employmentEndMonth, setEmploymentEndMonth] = useState("");
  const [employmentEndYear, setEmploymentEndYear] = useState("");
  const [employmentCurrentlyWorking, setEmploymentCurrentlyWorking] = useState(false);
  const [employmentDescription, setEmploymentDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, profileRes, employmentRes] = await Promise.all([
          axios.get(`${API_URL}/freelancer/summary/${freelancerId}/`),
          axios.get(`${API_URL}/profile/${freelancerId}/`),
          axios.get(`${API_URL}/get-work-experiences/${freelancerId}/`),
        ]);
        setSummary(summaryRes.data);
        setProfile(profileRes.data);
        setEmploymentHistory(employmentRes.data.workExperience || []);
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

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  // Handle image file selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract YouTube video ID and generate thumbnail
  const extractYouTubeInfo = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      const videoId = match[2];
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      return { videoId, thumbnailUrl };
    }
    return null;
  };

  // Handle editing education
  const handleEditEducation = (index) => {
    const edu = education[index];

    if (edu) {
      setEducationInstitution(edu.school || "");
      setEducationDegree(edu.degree || "");
      setEducationField(edu.fieldOfStudy || "");
      setEducationStartYear(edu.startYear || "");
      setEducationEndYear(edu.endYear || "");
      setEducationDescription(edu.description || "");
      setEducationIsExpected(edu.isExpected || false);
      setEditingEducationIndex(index);
      setIsEditingEducation(true);
      setShowEducationModal(true);
    }
  };

  // Handle adding new education
  const handleAddEducation = () => {
    // Reset form for adding new education
    setEducationInstitution("");
    setEducationDegree("");
    setEducationField("");
    setEducationStartYear("");
    setEducationEndYear("");
    setEducationDescription("");
    setEducationIsExpected(false);
    setEditingEducationIndex(null);
    setIsEditingEducation(false);
    setShowEducationModal(true);
  };

  // Handle closing education modal
  const handleCloseEducationModal = () => {
    setShowEducationModal(false);
    setEditingEducationIndex(null);
    setIsEditingEducation(false);
    // Reset form
    setEducationInstitution("");
    setEducationDegree("");
    setEducationField("");
    setEducationStartYear("");
    setEducationEndYear("");
    setEducationDescription("");
    setEducationIsExpected(false);
  };

  const handleAddEmployment = () => {
    setShowEmploymentModal(true);
    setIsEditingEmployment(false);
    setEditingEmploymentIndex(null);
    setEmploymentCompany("");
    setEmploymentCity("");
    setEmploymentCountry("");
    setEmploymentTitle("");
    setEmploymentStartMonth("");
    setEmploymentStartYear("");
    setEmploymentEndMonth("");
    setEmploymentEndYear("");
    setEmploymentCurrentlyWorking(false);
  };

  const handleEditEmployment = (index) => {
    const experience = employmentHistory[index];
    setShowEmploymentModal(true);
    setIsEditingEmployment(true);
    setEditingEmploymentIndex(index);
    setEmploymentCompany(experience.company || "");
    setEmploymentCity(experience.city || "");
    setEmploymentCountry(experience.country || "");
    setEmploymentTitle(experience.title || "");
    setEmploymentDescription(experience.description || "")
    
    // Parse start date
    if (experience.startDate) {
      const startDate = new Date(experience.startDate);
      setEmploymentStartMonth((startDate.getMonth() + 1).toString());
      setEmploymentStartYear(startDate.getFullYear().toString());
    }
    
    // Parse end date
    if (experience.endDate && experience.endDate !== "Present") {
      const endDate = new Date(experience.endDate);
      setEmploymentEndMonth((endDate.getMonth() + 1).toString());
      setEmploymentEndYear(endDate.getFullYear().toString());
      setEmploymentCurrentlyWorking(false);
    } else {
      setEmploymentCurrentlyWorking(true);
    }
  };

  const handleCloseEmploymentModal = () => {
    setShowEmploymentModal(false);
    setIsEditingEmployment(false);
    setEditingEmploymentIndex(null);
    setEmploymentCompany("");
    setEmploymentCity("");
    setEmploymentCountry("");
    setEmploymentTitle("");
    setEmploymentStartMonth("");
    setEmploymentStartYear("");
    setEmploymentEndMonth("");
    setEmploymentEndYear("");
    setEmploymentCurrentlyWorking(false);
  };

  // Fetch available languages from LanguageTool API
  const fetchAvailableLanguages = async () => {
    setLoadingLanguages(true);
    try {
      const response = await axios.get('https://api.languagetoolplus.com/v2/languages');
      if (response.data && Array.isArray(response.data)) {
        // Extract language names and sort them alphabetically
        const languageNames = response.data
          .map(lang => lang.name)
          .filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates
          .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

        setAvailableLanguages(languageNames);
      } else {
        // Fallback to static list if API doesn't return expected format
        setAvailableLanguages([
          "Afrikaans", "Albanian", "Arabic", "Austrian German", "Basque", "Belarusian",
          "Belgian French", "Bengali", "Bosnian", "Brazilian Portuguese", "Breton",
          "Bulgarian", "Canadian French", "Catalan", "Chinese (Cantonese)",
          "Chinese (Mandarin)", "Corsican", "Croatian", "Czech", "Danish", "Dutch",
          "East Timorese Portuguese", "Emilian", "English", "Estonian",
          "European Portuguese", "Filipino", "Finnish", "Flemish", "French",
          "Frisian", "Friulian", "Galician", "German", "Goan Portuguese", "Greek",
          "Guinea-Bissau Portuguese", "Gujarati", "Hebrew", "Hindi", "Hungarian", "Icelandic",
          "Indonesian", "Irish", "Italian", "Japanese", "Korean", "Ladin",
          "Latvian", "Lithuanian", "Lombard", "Low German", "Luxembourgish",
          "Macedonian", "Macanese Portuguese", "Malay", "Norwegian", "Occitan",
          "Persian", "Piedmontese", "Polish", "Portuguese", "Romanian", "Romansh",
          "Romagnol", "Russian", "Sardinian", "Scottish Gaelic", "Serbian",
          "Sicilian", "Slovak", "Slovenian", "Spanish", "Swedish", "Swiss French",
          "Swiss German", "Swiss Italian", "São Tomé and Príncipe Portuguese",
          "Thai", "Turkish", "Ukrainian", "Urdu", "Venetian", "Vietnamese",
          "Welsh", "Yiddish"
        ]);
      }
    } catch (error) {
      console.error("Error fetching languages from LanguageTool API:", error);
      // Fallback to static list on error
      setAvailableLanguages([
        "Afrikaans", "Albanian", "Arabic", "Austrian German", "Basque", "Belarusian",
        "Belgian French", "Bengali", "Bosnian", "Brazilian Portuguese", "Breton",
        "Bulgarian", "Canadian French", "Catalan", "Chinese (Cantonese)",
        "Chinese (Mandarin)", "Corsican", "Croatian", "Czech", "Danish", "Dutch",
        "East Timorese Portuguese", "Emilian", "English", "Estonian",
        "European Portuguese", "Filipino", "Finnish", "Flemish", "French",
        "Frisian", "Friulian", "Galician", "German", "Goan Portuguese", "Greek",
        "Guinea-Bissau Portuguese", "Hebrew", "Hindi", "Hungarian", "Icelandic",
        "Indonesian", "Irish", "Italian", "Japanese", "Korean", "Ladin",
        "Latvian", "Lithuanian", "Lombard", "Low German", "Luxembourgish",
        "Macedonian", "Macanese Portuguese", "Malay", "Norwegian", "Occitan",
        "Persian", "Piedmontese", "Polish", "Portuguese", "Romanian", "Romansh",
        "Romagnol", "Russian", "Sardinian", "Scottish Gaelic", "Serbian",
        "Sicilian", "Slovak", "Slovenian", "Spanish", "Swedish", "Swiss French",
        "Swiss German", "Swiss Italian", "São Tomé and Príncipe Portuguese",
        "Thai", "Turkish", "Ukrainian", "Urdu", "Venetian", "Vietnamese",
        "Welsh", "Yiddish"
      ]);
    } finally {
      setLoadingLanguages(false);
    }
  };

  // Initialize title and bio values when profile loads
  useEffect(() => {
    if (profile || summary) {
      const currentTitle =
        safeSummary.title || safeProfile.title || "Interface Specialist";
      const currentBio = safeProfile.bio || safeSummary.bio || "";
      setTitleValue(currentTitle);
      setBioValue(currentBio);
    }
  }, [profile, summary, safeProfile.bio, safeSummary.bio]);

  // Update bio value when modal opens
  useEffect(() => {
    if (showBioModal) {
      const currentBio = safeProfile.bio || safeSummary.bio || "";
      setBioValue(currentBio);
    }
  }, [showBioModal, safeProfile.bio, safeSummary.bio]);

  // Update skills value when modal opens
  useEffect(() => {
    if (showSkillsModal) {
      const currentSkills = (safeSummary.skills || safeProfile.skills || [])
        .map((s) => s.name)
        .filter(Boolean);
      setSkillsValue([...currentSkills]);
    }
  }, [showSkillsModal, safeSummary.skills, safeProfile.skills]);

  // Fetch languages when language modal opens
  useEffect(() => {
    if (showLanguageModal && availableLanguages.length === 0) {
      fetchAvailableLanguages();
    }
  }, [showLanguageModal, availableLanguages.length]);

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

          /* Custom range input styling */
          input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
          }

          input[type="range"]::-webkit-slider-track {
            background: #e5e7eb;
            height: 4px;
            border-radius: 2px;
          }

          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            background: #007476;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            cursor: pointer;
          }

          input[type="range"]::-webkit-slider-thumb:hover {
            background: #005a58;
            transform: scale(1.1);
          }

          input[type="range"]::-moz-range-track {
            background: #e5e7eb;
            height: 4px;
            border-radius: 2px;
            border: none;
          }

          input[type="range"]::-moz-range-thumb {
            background: #007476;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            cursor: pointer;
          }

          input[type="range"]::-moz-range-thumb:hover {
            background: #005a58;
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
                  boxShadow: "0 4px 12px rgba(0, 118, 116, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                title="Edit Profile Photo"
                onClick={() => setShowProfileImageModal(true)}
              >
                <MdEdit size={16} />
              </motion.div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  marginBottom: "6px",
                  color: "#1a1a1a",
                  letterSpacing: "-0.5px",
                }}
              >
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
                <GoLocation style={{ color: "#007674", fontSize: "18px" }} />
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
                  fontSize: "18px",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  minWidth: "140px",
                }}
                whileHover={{
                  scale: 1.02,
                  background: "#f8f9fa",
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
                  fontSize: "18px",
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
                  boxShadow: "0 4px 12px rgba(0, 118, 116, 0.3)",
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
                fontSize: "18px",
                fontWeight: "600",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "6px",
                transition: "all 0.2s ease",
              }}
              whileHover={{
                background: "rgba(0, 118, 116, 0.1)",
                scale: 1.02,
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
            margin: "0px 20px 20px 20px",
            marginBottom: "10px",
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
            {/* Tokens Box */}
            <div
              style={{
                background: "#fafbfb",
                borderRadius: 12,
                padding: "18px 20px 14px 20px",
                marginBottom: 32,
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                fontSize: 19,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>
                WS-Tokens: 90
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
                  Buy Tokens
                </span>
              </div>
            </div>

            {/* Video introduction */}
            {!savedVideoUrl ? (
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
                  onClick={() => setShowVideoModal(true)}
                >
                  <FiPlus size={16} />
                </motion.div>
              </div>
            ) : (
              <div style={{ marginBottom: 28 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 20 }}>
                    {videoTitle}
                  </span>
                  <motion.div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      color: "#dc2626",
                      border: "2px solid #dc2626",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    whileHover={{
                      scale: 1.05,
                      background: "#dc2626",
                      color: "#fff",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSavedVideoUrl("");
                      setVideoThumbnail("");
                      setVideoTitle("");
                    }}
                    title="Remove video"
                  >
                    <FiTrash2 size={16} />
                  </motion.div>
                </div>

                {/* Video Thumbnail Card */}
                <motion.div
                  style={{
                    position: "relative",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                    background: "#000",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowVideoPlayerModal(true)}
                >
                  {/* Thumbnail Image */}
                  <img
                    src={videoThumbnail}
                    alt="Video thumbnail"
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x160?text=Video+Thumbnail";
                    }}
                  />

                  {/* Play Button Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: "12px solid #007476",
                        borderTop: "8px solid transparent",
                        borderBottom: "8px solid transparent",
                        marginLeft: "4px",
                      }}
                    />
                  </div>


                </motion.div>
              </div>
            )}

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
                      style={{
                        color: "#121212",
                        fontSize: 17,
                        marginTop: "10px",
                      }}
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
                  onClick={() => setShowLanguageModal(true)}
                >
                  <FiPlus size={16} />
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
                  onClick={() => {
                    if (languages.length > 0) {
                      // Parse all languages and create editing array
                      const parsedLanguages = languages.map((lang, index) => {
                        const languageParts = lang.split(": ");
                        return {
                          id: index,
                          language: languageParts[0] || "",
                          proficiency: languageParts[1] || "Basic",
                          original: lang
                        };
                      });

                      setEditingLanguages(parsedLanguages);
                      setShowEditLanguageModal(true);
                    } else {
                      // If no languages exist, open the add language modal instead
                      setShowLanguageModal(true);
                    }
                  }}
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
                    <div key={idx} style={{
                      marginTop: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px"
                    }}>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: "#121212",
                            fontSize: 17,
                            fontWeight: 600,
                            marginBottom: "4px",
                          }}
                        >
                          {edu.School || "LJ University"}
                        </div>
                        <div
                          style={{
                            color: "#666",
                            fontSize: 16,
                            marginBottom: "2px",
                          }}
                        >
                          {edu.degree || "Bachelor of Engineering (BEng)"},{" "}
                          {edu.fieldOfStudy || "Computer science"}
                        </div>
                        <div
                          style={{
                            color: "#666",
                            fontSize: 16,
                          }}
                        >
                          {edu.startYear || "2023"}-{edu.endYear || "2027"}{" "}
                          {edu.isExpected ? "(expected)" : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
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
                          onClick={() => handleEditEducation(idx)}
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
                    </div>
                  ))
                ) : (
                  <div style={{ marginTop: "12px" }}>
                    <div
                      style={{
                        color: "#121212",
                        fontSize: 17,
                        fontWeight: 600,
                        marginBottom: "4px",
                      }}
                    >
                      LJ University
                    </div>
                    <div
                      style={{
                        color: "#666",
                        fontSize: 16,
                        marginBottom: "2px",
                      }}
                    >
                      Bachelor of Engineering (BEng), Computer science
                    </div>
                    <div
                      style={{
                        color: "#666",
                        fontSize: 16,
                      }}
                    >
                      2023-2027 (expected)
                    </div>
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  justifyContent: "end",
                  alignItems: "end",
                }}
              >
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
                  onClick={handleAddEducation}
                >
                  <FiPlus size={16} />
                </motion.div>

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
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12
              }}>
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
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 22,
                fontWeight: 600,
                color: "#007476"
              }}>
                <div>{hourlyRate}</div>
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
                  title="Edit Hourly Rate"
                  onClick={() => {
                    // Extract numeric value from hourly rate (e.g., "₹1000/hr" -> "1000")
                    const numericValue = hourlyRate.replace(/[^0-9]/g, "");
                    setHourlyRateValue(numericValue || "1000");
                    setShowHourlyRateModal(true);
                  }}
                >
                  <MdEdit size={16} />
                </motion.div>
              </div>
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
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 22,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
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
              style={{
                borderTop: "1px solid #e6e6e6",
                paddingTop: 24,
                marginTop: 24,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 22,
                    color: "#1a1a1a",
                  }}
                >
                  Portfolio
                </div>
                <motion.div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#fff",
                    color: "#007476",
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
                  title="Add Portfolio Item"
                >
                  <FiPlus size={16} />
                </motion.div>
              </div>

              {/* Portfolio Content */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "40px 20px",
                  textAlign: "center",
                }}
              >
                <motion.div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    border: "2px solid #e6e6e6",
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiBriefcase size={40} style={{ color: "#007674" }} />
                </motion.div>

                <motion.div
                  style={{
                    color: "#007674",
                    fontSize: 18,
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

                <div
                  style={{
                    color: "#1a1a1a",
                    fontSize: 16,
                    fontWeight: 500,
                    maxWidth: "300px",
                    lineHeight: 1.4,
                  }}
                >
                  Talent are hired 9x more often if they've published a
                  portfolio.
                </div>
              </div>
            </motion.div>

            {/* Work History Section */}
            <motion.div
              style={{
                borderTop: "1px solid #e6e6e6",
                paddingTop: 24,
                marginTop: 24,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 20,
                    color: "#1a1a1a",
                  }}
                >
                  Work history
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddEmployment}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    color: "#007674",
                    border: "2px solid #007674",
                    backgroundColor: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <FiPlus size={16} />
                </motion.button>
              </div>

              {/* Work History Entries */}
              {employmentHistory.length > 0 ? (
                employmentHistory.map((experience, index) => (
                  <div
                    key={experience._id || index}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      padding: "16px",
                      border: "1px solid #e6e6e6",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 18,
                            color: "#1a1a1a",
                            marginBottom: "4px",
                          }}
                        >
                          {experience.title || "No title"}
                        </div>
                        <div
                          style={{
                            fontSize: 17,
                            color: "#666",
                            marginBottom: "8px",
                          }}
                        >
                          {experience.company || "No company"} •{" "}
                          {formatDate(experience.startDate)} -{" "}
                          {experience.endDate
                            ? formatDate(experience.endDate)
                            : "Present"}
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            color: "#666",
                            lineHeight: "1.5",
                          }}
                        >
                          {experience.description || "No description provided."}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          marginLeft: "12px",
                        }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditEmployment(index)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            color: "#007674",
                            border: "2px solid #007674",
                            backgroundColor: "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <MdEdit size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            color: "#dc2626",
                            border: "2px solid #dc2626",
                            backgroundColor: "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <FiTrash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "16px",
                    border: "1px solid #e6e6e6",
                    textAlign: "center",
                    color: "#666",
                    fontSize: 16,
                  }}
                >
                  No work history available.
                </div>
              )}
            </motion.div>

            {/* Other Experiences Section */}
            <motion.div
              style={{
                borderTop: "1px solid #e6e6e6",
                paddingTop: 24,
                marginTop: 24,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            ></motion.div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#1a1a1a",
                }}
              >
                Other experiences
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  color: "#007476",
                  border: "2px solid #007476",
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => setShowOtherExperiencesModal(true)}
              >
                <FiPlus size={16} />
              </motion.button>
            </div>
            <motion.div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid #e6e6e6",
                marginBottom: "24px",
              }}
            >
              {/* Empty State */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    marginBottom: "20px",
                  }}
                >
                  <FiFolder
                    size={48}
                    style={{
                      color: "#007476",
                    }}
                  />
                  {/* Three small lines radiating from the top */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-8px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: "2px",
                        height: "8px",
                        backgroundColor: "#3b82f6",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        width: "2px",
                        height: "6px",
                        backgroundColor: "#3b82f6",
                        borderRadius: "1px",
                      }}
                    />
                    <div
                      style={{
                        width: "2px",
                        height: "8px",
                        backgroundColor: "#3b82f6",
                        borderRadius: "1px",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "#1a1a1a",
                    marginBottom: "8px",
                  }}
                >
                  Add any other experiences that help you stand out.
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 16,
                    color: "#007476",
                    cursor: "pointer",
                    fontWeight: 500,
                    textDecoration: "underline",
                  }}
                  onClick={() => setShowOtherExperiencesModal(true)}
                >
                  Add an experience
                </motion.button>
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: "24px" }}>
              <p
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "16px",
                  color: "#666",
                  lineHeight: "1.5",
                }}
              >
                Enter a single sentence description of your professional
                skills/experience (e.g. Expert Web Designer with Ajax
                experience)
              </p>

              <div style={{ marginBottom: "8px" }}>
                <label
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
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
                    fontSize: "18px",
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
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => {
                  // Here you would typically save the title to your backend

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
                  background: "#005a58",
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexShrink: 0,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "16px",
                  color: "#666",
                  lineHeight: "1.5",
                }}
              >
                Use this space to show clients you have the skills and
                experience they're looking for.
              </p>

              <ul
                style={{
                  margin: "0 0 16px 0",
                  paddingLeft: "20px",
                  fontSize: "16px",
                  color: "#666",
                  lineHeight: "1.6",
                }}
              >
                <li style={{ marginBottom: "8px" }}>
                  Describe your strengths and skills
                </li>
                <li style={{ marginBottom: "8px" }}>
                  Highlight projects, accomplishments and education
                </li>
                <li style={{ marginBottom: "8px" }}>
                  Keep it short and make sure it's error-free
                </li>
              </ul>

              <motion.div
                style={{
                  color: "#007674",
                  fontSize: "16px",
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
                <label
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Profile overview
                </label>
                <div style={{ position: "relative" }}>
                  <textarea
                    value={bioValue || ""}
                    onChange={(e) => {

                      setBioValue(e.target.value);
                    }}
                    style={{
                      width: "100%",
                      minHeight: "300px",
                      padding: "16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "18px",
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
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      fontSize: "16px",
                      color: "#666",
                      background: "rgba(255, 255, 255, 0.9)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {5000 - bioValue.length} characters left
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                flexShrink: 0,
                borderTop: "1px solid #e6e6e6",
                paddingTop: "20px",
              }}
            >
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => {
                  // Here you would typically save the bio to your backend

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
                  background: "#005a58",
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ marginBottom: "8px" }}>
                <label
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Skills
                </label>
                <div
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "12px",
                    minHeight: "120px",
                    background: "#fff",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    alignItems: "flex-start",
                  }}
                >
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
                          const newSkills = skillsValue.filter(
                            (_, i) => i !== index
                          );
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
                          background: "#f8f9fa",
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
                      if (e.key === "Enter" && skillSearchValue.trim()) {
                        if (
                          skillsValue.length < 15 &&
                          !skillsValue.includes(skillSearchValue.trim())
                        ) {
                          setSkillsValue([
                            ...skillsValue,
                            skillSearchValue.trim(),
                          ]);
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
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "8px",
                  }}
                >
                  Maximum 15 skills.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => {
                  // Here you would typically save the skills to your backend

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
                  background: "#005a58",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Other Experiences Modal */}
      {showOtherExperiencesModal && (
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
          onClick={() => setShowOtherExperiencesModal(false)}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "600",
                  letterSpacing: "0.4px",
                  color: "#1a1a1a",
                }}
              >
                Add other experiences
              </h3>
              <motion.button
                onClick={() => setShowOtherExperiencesModal(false)}
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                x
              </motion.button>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: "10px" }}>
              {/* Subject Field */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Subject
                </label>
                <input
                  type="text"
                  value={otherExperienceSubject}
                  onChange={(e) => setOtherExperienceSubject(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "18px",
                    color: "#1a1a1a",
                    background: "#fff",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  placeholder="Enter subject"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007476";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                />
              </div>

              {/* Description Field */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Description
                </label>
                <textarea
                  value={otherExperienceDescription}
                  onChange={(e) =>
                    setOtherExperienceDescription(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    color: "#1a1a1a",
                    background: "#fff",
                    outline: "none",
                    resize: "vertical",
                    minHeight: "120px",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s ease",
                  }}
                  placeholder="Enter description"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007476";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <motion.button
                onClick={() => setShowOtherExperiencesModal(false)}
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => {
                  // Here you would typically save the other experience to your backend

                  setShowOtherExperiencesModal(false);
                  setOtherExperienceSubject("");
                  setOtherExperienceDescription("");
                  // You can add API call here to save the other experience
                }}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "#007476",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  background: "#007476",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Education Modal */}
      {showEducationModal && (
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
          onClick={handleCloseEducationModal}
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
              maxWidth: "800px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e6e6e6",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                {isEditingEducation ? "Edit Education" : "Add Education"}
              </h3>
              <motion.button
                onClick={handleCloseEducationModal}
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: "24px" }}>
              {/* School Field */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  School
                </label>
                <input
                  type="text"
                  value={educationInstitution}
                  onChange={(e) => setEducationInstitution(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "18px",
                    color: "#1a1a1a",
                    background: "#fff",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  placeholder="Ex: Northwestern University"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007476";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                />
              </div>

              {/* Dates Attended Field */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Dates Attended (Optional)
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <select
                    value={educationStartYear}
                    onChange={(e) => setEducationStartYear(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "16px",
                      color: "#1a1a1a",
                      background: "#fff",
                      outline: "none",
                      cursor: "pointer",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#007476";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                    }}
                  >
                    <option value="">From</option>
                    {Array.from(
                      { length: new Date().getFullYear() - 1940 + 1 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={educationEndYear}
                    onChange={(e) => setEducationEndYear(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "16px",
                      color: "#1a1a1a",
                      background: "#fff",
                      outline: "none",
                      cursor: "pointer",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#007476";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                    }}
                  >
                    <option value="">To (or expected graduation year)</option>
                    {Array.from(
                      { length: 2032 - 1940 + 1 },
                      (_, i) => 2032 - i
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Degree and Area of Study Fields in Same Row */}
              <div
                style={{ marginBottom: "20px", display: "flex", gap: "12px" }}
              >
                {/* Degree Field */}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Degree (Optional)
                  </label>
                  <select
                    value={educationDegree}
                    onChange={(e) => setEducationDegree(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "16px",
                      color: "#1a1a1a",
                      background: "#fff",
                      outline: "none",
                      cursor: "pointer",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#007476";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                    }}
                  >
                    <option value="">Degree (Optional)</option>
                    <option value="High School Diploma">
                      High School Diploma
                    </option>
                    <option value="Associate's Degree">
                      Associate's Degree
                    </option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Professional Degree">
                      Professional Degree
                    </option>
                    <option value="Certificate">Certificate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Area of Study Field */}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Area of Study (Optional)
                  </label>
                  <input
                    type="text"
                    value={educationField}
                    onChange={(e) => setEducationField(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "16px",
                      color: "#1a1a1a",
                      background: "#fff",
                      outline: "none",
                      transition: "border-color 0.2s ease",
                    }}
                    placeholder="Ex: Computer Science"
                    onFocus={(e) => {
                      e.target.style.borderColor = "#007476";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                    }}
                  />
                </div>
              </div>

              {/* Description Field */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Description (Optional)
                </label>
                <textarea
                  rows={4}
                  value={educationDescription}
                  onChange={(e) => setEducationDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    color: "#1a1a1a",
                    background: "#fff",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                    resize: "vertical",
                    minHeight: "80px",
                    fontFamily: "inherit",
                  }}
                  placeholder="Describe your education experience, achievements, or any relevant details..."
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007476";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <motion.button
                onClick={handleCloseEducationModal}
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => {
                  const educationData = {
                    institution: educationInstitution,
                    degree: educationDegree,
                    field: educationField,
                    startYear: educationStartYear,
                    endYear: educationEndYear,
                    description: educationDescription,
                    isExpected: educationIsExpected,
                  };

                  if (isEditingEducation) {
                    // Here you would typically update the education in your backend
                    // You can add API call here to update the education
                  } else {
                    // Here you would typically save the education to your backend
                    // You can add API call here to save the education
                  }

                  handleCloseEducationModal();
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
                  background: "#005a58",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {isEditingEducation ? "Update" : "Save"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Profile Image Modal */}
      {showProfileImageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowProfileImageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "800px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                paddingBottom: "16px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Edit photo
              </h2>
              <motion.button
                onClick={() => setShowProfileImageModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                }}
                whileHover={{
                  background: "#f3f4f6",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Content */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                flex: 1,
                overflow: "hidden",
              }}
            >
              {/* Left Side - Main Photo Preview and Controls */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Main Photo Preview */}
                <div
                  style={{
                    position: "relative",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      width: "200px",
                      height: "200px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "3px solid #f8f9fa",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      position: "relative",
                      background: "#f8f9fa",
                    }}
                  >
                    <img
                      src={
                        imagePreview ||
                        safeProfile.profileImage ||
                        avatar ||
                        "https://via.placeholder.com/200x200?text=Profile"
                      }
                      alt="Profile Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: `scale(${1 + zoomLevel / 100}) rotate(${rotationAngle}deg)`,
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </div>

                  {/* Move Button Overlay */}
                  <motion.button
                    style={{
                      position: "absolute",
                      bottom: "8px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "20px",
                      padding: "8px 16px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiMove size={14} />
                    Move
                  </motion.button>
                </div>

                {/* Zoom and Rotate Controls */}
                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    alignItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  {/* Zoom Control */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FiZoomIn size={16} style={{ color: "#666" }} />
                    <span style={{ fontSize: "16px", fontWeight: "500" }}>Zoom</span>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                      style={{
                        width: "100px",
                        height: "4px",
                        borderRadius: "2px",
                        background: "#e5e7eb",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "#666", minWidth: "20px" }}>
                      {zoomLevel}
                    </span>
                  </div>

                  {/* Rotate Control */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FiRotateCw size={16} style={{ color: "#666" }} />
                    <span style={{ fontSize: "16px", fontWeight: "500" }}>Rotate</span>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotationAngle}
                      onChange={(e) => setRotationAngle(parseInt(e.target.value))}
                      style={{
                        width: "100px",
                        height: "4px",
                        borderRadius: "2px",
                        background: "#e5e7eb",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "#666", minWidth: "20px" }}>
                      {rotationAngle}°
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side - Tips and Previews */}
              <div
                style={{
                  width: "280px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* Headline */}
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    lineHeight: "1.4",
                  }}
                >
                  Show clients the best version of yourself!
                </div>

                {/* Small Previews */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid #e5e7eb",
                    }}
                  >
                    <img
                      src={
                        imagePreview ||
                        safeProfile.profileImage ||
                        avatar ||
                        "https://via.placeholder.com/60x60?text=Profile"
                      }
                      alt="Small Preview 1"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: `scale(${1 + zoomLevel / 100}) rotate(${rotationAngle}deg)`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid #e5e7eb",
                    }}
                  >
                    <img
                      src={
                        imagePreview ||
                        safeProfile.profileImage ||
                        avatar ||
                        "https://via.placeholder.com/50x50?text=Profile"
                      }
                      alt="Small Preview 2"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: `scale(${1 + zoomLevel / 100}) rotate(${rotationAngle}deg)`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid #e5e7eb",
                    }}
                  >
                    <img
                      src={
                        imagePreview ||
                        safeProfile.profileImage ||
                        avatar ||
                        "https://via.placeholder.com/50x50?text=Profile"
                      }
                      alt="Small Preview 3"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: `scale(${1 + zoomLevel / 100}) rotate(${rotationAngle}deg)`,
                      }}
                    />
                  </div>
                </div>

                {/* Guidelines */}
                <div
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    lineHeight: "1.5",
                    padding: "16px",
                    background: "#f8f9fa",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  Must be an actual photo of you. Logos, clip-art, group photos, and digitally-altered images are not allowed.
                </div>

                {/* Learn More Link */}
                <motion.div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#007476",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  whileHover={{ color: "#005a58" }}
                  transition={{ duration: 0.2 }}
                >
                  <span>Learn more</span>
                  <FiExternalLink size={12} />
                </motion.div>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <motion.button
                onClick={() => {
                  // Trigger file input
                  fileInputRef.current?.click();
                }}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  background: "#f9fafb",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Change image
              </motion.button>
              <motion.button
                onClick={() => {
                  // Reset values and close modal
                  setZoomLevel(0);
                  setRotationAngle(0);
                  setSelectedImage(null);
                  setImagePreview(null);
                  setShowProfileImageModal(false);
                }}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  background: "#f9fafb",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => {
                  // Here you would typically save the edited image
                  setShowProfileImageModal(false);
                  // You can add API call here to save the edited image
                }}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "#007476",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  background: "#005a58",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Save photo
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Video Introduction Modal */}
      {showVideoModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowVideoModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                paddingBottom: "16px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Add video introduction
              </h2>
              <motion.button
                onClick={() => setShowVideoModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                }}
                whileHover={{
                  background: "#f3f4f6",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Link to your YouTube video
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                                      style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "18px",
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
                  placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  autoFocus
                />
              </div>

              {/* Guidelines Link */}
              <motion.div
                style={{
                  color: "#007476",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                  textDecoration: "underline",
                  display: "inline-block",
                }}
                whileHover={{ color: "#005a58" }}
                transition={{ duration: 0.2 }}
              >
                Does your video meet Worksyde's guidelines?
              </motion.div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                paddingTop: "20px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <motion.button
                onClick={() => {
                  setVideoUrl("");
                  setShowVideoModal(false);
                }}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "none",
                  color: "#007674",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => {
                  // Extract YouTube video info
                  const videoInfo = extractYouTubeInfo(videoUrl);
                  if (videoInfo) {
                    setSavedVideoUrl(videoUrl);
                    setVideoThumbnail(videoInfo.thumbnailUrl);
                    setVideoId(videoInfo.videoId);
                    setVideoTitle("Meet " + name); // Using the freelancer's name

                  } else {
                    alert("Please enter a valid YouTube URL");
                    return;
                  }
                  setShowVideoModal(false);
                  // You can add API call here to save the video URL
                }}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: videoUrl.trim() ? "#007476" : "#e5e7eb",
                  color: videoUrl.trim() ? "#fff" : "#9ca3af",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: videoUrl.trim() ? "pointer" : "not-allowed",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={
                  videoUrl.trim()
                    ? { background: "#005a58" }
                    : {}
                }
                whileTap={videoUrl.trim() ? { scale: 0.95 } : {}}
                disabled={!videoUrl.trim()}
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Video Player Modal */}
      {showVideoPlayerModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowVideoPlayerModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "900px",
              maxHeight: "90vh",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                paddingBottom: "16px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Video introduction
              </h2>
              <motion.button
                onClick={() => setShowVideoPlayerModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                }}
                whileHover={{
                  background: "#f3f4f6",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Video Player Area */}
            <div
              style={{
                position: "relative",
                width: "100%",
                background: "#000",
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "20px",
              }}
            >
              {/* YouTube Video Player */}
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title="Video introduction"
                style={{
                  width: "100%",
                  height: "400px",
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />


            </div>


          </motion.div>
        </motion.div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowLanguageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "700px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                paddingBottom: "16px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Add language
              </h2>
              <motion.button
                onClick={() => setShowLanguageModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                }}
                whileHover={{
                  background: "#f3f4f6",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              {/* Language Section */}
              <div style={{ flex: 1, position: "relative" }}>
                <label
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Language
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "18px",
                      outline: "none",
                      transition: "border-color 0.2s ease",
                      boxSizing: "border-box",
                      paddingRight: "40px",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#007674";
                      setShowLanguageDropdown(true);
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      // Delay hiding dropdown to allow clicking on options
                      setTimeout(() => setShowLanguageDropdown(false), 200);
                    }}
                    placeholder="Search for language"
                    autoFocus
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6b7280",
                      pointerEvents: "none",
                      fontSize: "12px",
                    }}
                  >
                    {showLanguageDropdown ? "▲" : "▼"}
                  </div>
                </div>

                {/* Language Dropdown */}
                {showLanguageDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      zIndex: 10,
                      marginTop: "4px",
                      maxHeight: "300px",
                      overflow: "auto",
                    }}
                  >
                    {loadingLanguages ? (
                      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                        Loading languages...
                      </div>
                    ) : (
                      availableLanguages
                        .filter(language =>
                          language.toLowerCase().includes(selectedLanguage.toLowerCase())
                        )
                        .map((language, index) => (
                          <motion.div
                            key={index}
                            onClick={() => {
                              setSelectedLanguage(language);
                              setShowLanguageDropdown(false);
                            }}
                            style={{
                              padding: "12px 16px",
                              cursor: "pointer",
                              borderBottom: index < availableLanguages.length - 1 ? "1px solid #f3f4f6" : "none",
                              transition: "background-color 0.2s ease",
                            }}
                            whileHover={{
                              background: "#f8f9fa",
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#1a1a1a",
                              }}
                            >
                              {language}
                            </div>
                          </motion.div>
                        ))
                    )}
                  </motion.div>
                )}
              </div>

              {/* Proficiency Level Section */}
              <div style={{ flex: 1, position: "relative" }}>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Proficiency level
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={selectedProficiency}
                    onChange={(e) => setSelectedProficiency(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "16px",
                      outline: "none",
                      transition: "border-color 0.2s ease",
                      boxSizing: "border-box",
                      paddingRight: "40px",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#007674";
                      setShowProficiencyDropdown(true);
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      // Delay hiding dropdown to allow clicking on options
                      setTimeout(() => setShowProficiencyDropdown(false), 200);
                    }}
                    placeholder="Search for proficiency level"
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6b7280",
                      pointerEvents: "none",
                      fontSize: "12px",
                    }}
                  >
                    {showProficiencyDropdown ? "▲" : "▼"}
                  </div>
                </div>

                {/* Proficiency Dropdown */}
                {showProficiencyDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      zIndex: 10,
                      marginTop: "4px",
                      maxHeight: "300px",
                      overflow: "auto",
                    }}
                  >
                    {[
                      {
                        level: "Basic",
                        description: "I am only able to communicate in this language through written communication"
                      },
                      {
                        level: "Conversational",
                        description: "I know this language well enough to verbally discuss project details with a client"
                      },
                      {
                        level: "Fluent",
                        description: "I have complete command of this language with perfect grammar"
                      },
                      {
                        level: "Native or Bilingual",
                        description: "I have complete command of this language, including breadth of vocabulary, idioms, and colloquialisms"
                      }
                    ].map((option, index) => (
                      <motion.div
                        key={index}
                        onClick={() => {
                          setSelectedProficiency(option.level);
                          setShowProficiencyDropdown(false);
                        }}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          borderBottom: index < 3 ? "1px solid #f3f4f6" : "none",
                          transition: "background-color 0.2s ease",
                        }}
                        whileHover={{
                          background: "#f8f9fa",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#1a1a1a",
                            marginBottom: "4px",
                          }}
                        >
                          {option.level}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            lineHeight: "1.4",
                          }}
                        >
                          {option.description}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "20px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <motion.button
                onClick={() => {
                  // Here you would typically add the language to your backend

                  setShowLanguageModal(false);
                  setSelectedLanguage("");
                  setSelectedProficiency("");
                  // You can add API call here to save the language
                }}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "#374151",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  background: "#1f2937",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Add language
              </motion.button>

              <div style={{ display: "flex", gap: "12px" }}>
                <motion.button
                  onClick={() => {
                    setSelectedLanguage("");
                    setSelectedProficiency("");
                    setShowLanguageModal(false);
                  }}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "none",
                    color: "#007674",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                  whileHover={{
                    background: "#f8f9fa",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => {
                    // Here you would typically save the language to your backend

                    setShowLanguageModal(false);
                    setSelectedLanguage("");
                    setSelectedProficiency("");
                    // You can add API call here to save the language
                  }}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "#e5e7eb",
                    color: "#9ca3af",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "not-allowed",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                  disabled={true}
                >
                  Save
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Language Modal */}
      {showEditLanguageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowEditLanguageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "800px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                paddingBottom: "16px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Edit languages
              </h2>
              <motion.button
                onClick={() => setShowEditLanguageModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                }}
                whileHover={{
                  background: "#f3f4f6",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* All Languages List */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  display: "block",
                  marginBottom: "16px",
                }}
              >
                Edit Your Languages
              </label>

              {editingLanguages.map((langItem, index) => (
                <div
                  key={langItem.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "16px",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "20px",
                    }}
                  >
                    {/* Language Section */}
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1a1a1a",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        Language {index + 1}
                      </label>
                      <input
                        type="text"
                        value={langItem.language}
                        readOnly
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "16px",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                          boxSizing: "border-box",
                          background: "#f8f9fa",
                          color: "#374151",
                          cursor: "not-allowed",
                        }}
                        placeholder="Language"
                      />
                    </div>

                    {/* Proficiency Level Section */}
                    <div style={{ flex: 1, position: "relative" }}>
                      <label
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1a1a1a",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        Proficiency level
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          value={langItem.proficiency}
                          onChange={(e) => {
                            const updatedLanguages = [...editingLanguages];
                            updatedLanguages[index].proficiency = e.target.value;
                            setEditingLanguages(updatedLanguages);
                          }}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "16px",
                            outline: "none",
                            transition: "border-color 0.2s ease",
                            boxSizing: "border-box",
                            paddingRight: "40px",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#007674";
                            // Set the current language as active for dropdown
                            setEditingLanguage(langItem.language);
                            setEditingProficiency(langItem.proficiency);
                            setSelectedLanguageIndex(index);
                            setShowEditProficiencyDropdown(true);
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#d1d5db";
                            // Delay hiding dropdown to allow clicking on options
                            setTimeout(() => setShowEditProficiencyDropdown(false), 200);
                          }}
                          placeholder="Search for proficiency level"
                        />
                        <div
                          style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#6b7280",
                            pointerEvents: "none",
                            fontSize: "12px",
                          }}
                        >
                          {showEditProficiencyDropdown && selectedLanguageIndex === index ? "▲" : "▼"}
                        </div>
                      </div>

                      {/* Proficiency Dropdown */}
                      {showEditProficiencyDropdown && selectedLanguageIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            background: "#fff",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            zIndex: 10,
                            marginTop: "4px",
                            maxHeight: "300px",
                            overflow: "auto",
                          }}
                        >
                          {[
                            {
                              level: "Basic",
                              description: "I am only able to communicate in this language through written communication"
                            },
                            {
                              level: "Conversational",
                              description: "I know this language well enough to verbally discuss project details with a client"
                            },
                            {
                              level: "Fluent",
                              description: "I have complete command of this language with perfect grammar"
                            },
                            {
                              level: "Native or Bilingual",
                              description: "I have complete command of this language, including breadth of vocabulary, idioms, and colloquialisms"
                            }
                          ].map((option, optionIndex) => (
                            <motion.div
                              key={optionIndex}
                              onClick={() => {
                                const updatedLanguages = [...editingLanguages];
                                updatedLanguages[index].proficiency = option.level;
                                setEditingLanguages(updatedLanguages);
                                setShowEditProficiencyDropdown(false);
                              }}
                              style={{
                                padding: "12px 16px",
                                cursor: "pointer",
                                borderBottom: optionIndex < 3 ? "1px solid #f3f4f6" : "none",
                                transition: "background-color 0.2s ease",
                              }}
                              whileHover={{
                                background: "#f8f9fa",
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  color: "#1a1a1a",
                                  marginBottom: "4px",
                                }}
                              >
                                {option.level}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                  lineHeight: "1.4",
                                }}
                              >
                                {option.description}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <div style={{ display: "flex", alignItems: "center", paddingTop: "32px" }}>
                      <motion.button
                        whileHover={{ scale: 1.05, background: "#fef2f2" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const updatedLanguages = editingLanguages.filter((_, i) => i !== index);
                          setEditingLanguages(updatedLanguages);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "6px",
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                paddingTop: "20px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <motion.button
                onClick={() => {
                  setEditingLanguages([]);
                  setShowEditLanguageModal(false);
                }}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: "none",
                  color: "#007674",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => {
                  // Format all languages as "Language: Proficiency"
                  const formattedLanguages = editingLanguages.map(lang => `${lang.language}: ${lang.proficiency}`);

                  setShowEditLanguageModal(false);
                  setEditingLanguages([]);
                  // You can add API call here to save the edited languages
                }}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: editingLanguages.length > 0 ? "#007476" : "#e5e7eb",
                  color: editingLanguages.length > 0 ? "#fff" : "#9ca3af",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: editingLanguages.length > 0 ? "pointer" : "not-allowed",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                whileHover={
                  editingLanguages.length > 0
                    ? { background: "#005a58" }
                    : {}
                }
                whileTap={editingLanguages.length > 0 ? { scale: 0.95 } : {}}
                disabled={editingLanguages.length === 0}
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Hourly Rate Modal */}
      {showHourlyRateModal && (
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
          onClick={() => setShowHourlyRateModal(false)}
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
              maxWidth: "800px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e6e6e6",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "26px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                Change hourly rate
              </h3>
              <motion.button
                onClick={() => setShowHourlyRateModal(false)}
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: "24px" }}>
              {/* Note */}
              <div style={{ marginBottom: "20px" }}>
                                <p style={{ 
                  fontSize: "18px", 
                  color: "#666", 
                  margin: "0 0 16px 0",
                  lineHeight: "1.5"
                }}>
                  Please note that your new hourly rate will only apply to new contracts.
                </p>
                                <p style={{ 
                  fontSize: "20px", 
                  color: "#1a1a1a", 
                  margin: "0 0 24px 0",
                  fontWeight: "500"
                }}>
                  Your profile rate: ₹{hourlyRateValue}/hr
                </p>
              </div>

              {/* Rate Calculation Section */}
              <div style={{ marginBottom: "24px" }}>
                {/* Hourly Rate */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <label style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      display: "block",
                      marginBottom: "4px"
                    }}>
                      Hourly Rate
                    </label>
                    <div style={{
                      fontSize: "16px",
                      color: "#666",
                      marginBottom: "8px"
                    }}>
                      Total amount the client will see
                    </div>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    background: "#fff",
                    position: "relative"
                  }}>
                    <span style={{
                      color: "#666",
                      fontSize: "18px",
                      marginRight: "8px"
                    }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      value={hourlyRateValue}
                      onChange={(e) => setHourlyRateValue(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        fontSize: "18px",
                        color: "#1a1a1a",
                        background: "transparent",
                        width: "100%",
                        flex: 1
                      }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    <span style={{
                      color: "#666",
                      fontSize: "18px",
                      marginLeft: "8px"
                    }}>
                      /hr
                    </span>
                  </div>
                </div>

                {/* Worksyde Service Fee */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <label style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      display: "block",
                      marginBottom: "4px"
                    }}>
                      Worksyde Service Fee
                    </label>
                    <div style={{
                      fontSize: "16px",
                      color: "#666",
                      marginBottom: "8px"
                    }}>
                      Fees vary and are shown before contract acceptance
                    </div>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    background: "#f8f9fa",
                    color: "#666"
                  }}>
                    <span style={{
                      fontSize: "18px",
                      marginRight: "8px"
                    }}>
                      -₹
                    </span>
                    <span style={{
                      fontSize: "18px",
                      flex: 1
                    }}>
                      {(parseFloat(hourlyRateValue || 0) * 0.1).toFixed(2)}
                    </span>
                    <span style={{
                      fontSize: "18px",
                      marginLeft: "8px"
                    }}>
                      /hr
                    </span>
                  </div>
                </div>

                {/* You'll Receive */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <label style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      display: "block",
                      marginBottom: "4px"
                    }}>
                      You'll Receive
                    </label>
                    <div style={{
                      fontSize: "16px",
                      color: "#666",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      The estimated amount you'll receive after service fees
                      <span style={{
                        color: "#007674",
                        cursor: "pointer",
                        fontSize: "16px"
                      }}>
                        ?
                      </span>
                    </div>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    background: "#f8f9fa",
                    color: "#1a1a1a"
                  }}>
                    <span style={{
                      fontSize: "18px",
                      marginRight: "8px"
                    }}>
                      ₹
                    </span>
                    <span style={{
                      fontSize: "18px",
                      flex: 1,
                      fontWeight: "600"
                    }}>
                      {(parseFloat(hourlyRateValue || 0) * 0.9).toFixed(2)}
                    </span>
                    <span style={{
                      fontSize: "18px",
                      marginLeft: "8px"
                    }}>
                      /hr
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <motion.button
                onClick={() => setShowHourlyRateModal(false)}
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => {
                  // Here you would typically save the hourly rate to your backend
                  setShowHourlyRateModal(false);
                  // You can add API call here to save the hourly rate
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
                  background: "#005a58",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Employment Modal */}
      {showEmploymentModal && (
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
          onClick={handleCloseEmploymentModal}
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
              maxWidth: "800px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e6e6e6",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                {isEditingEmployment ? "Edit employment" : "Add employment"}
              </h3>
              <motion.button
                onClick={handleCloseEmploymentModal}
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </div>

            {/* Modal Body */}
            <div style={{ marginBottom: "24px" }}>
              {/* Company Field */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Company
                </label>
                <input
                  type="text"
                  value={employmentCompany}
                  onChange={(e) => setEmploymentCompany(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "18px",
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
                  placeholder="Ex: Worksyde"
                  autoFocus
                />
              </div>

              {/* City & Country Fields */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    value={employmentCity}
                    onChange={(e) => setEmploymentCity(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "18px",
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
                    placeholder="Enter city"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    value={employmentCountry}
                    onChange={(e) => setEmploymentCountry(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "18px",
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
                    placeholder="Ex: United States"
                  />
                </div>
              </div>

              {/* Title Field */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={employmentTitle}
                  onChange={(e) => setEmploymentTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "18px",
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
                  placeholder="Ex: Senior Software Engineer"
                />
              </div>

              {/* Date Fields */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#1a1a1a",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Month
                    </label>
                    <select
                      value={employmentStartMonth}
                      onChange={(e) => setEmploymentStartMonth(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "18px",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                        boxSizing: "border-box",
                        background: "#fff",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#007674";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                      }}
                    >
                      <option value="">From, month</option>
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#1a1a1a",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Year
                    </label>
                    <select
                      value={employmentStartYear}
                      onChange={(e) => setEmploymentStartYear(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "18px",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                        boxSizing: "border-box",
                        background: "#fff",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#007674";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                      }}
                    >
                      <option value="">From, year</option>
                      {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "16px", color: "#666" }}>through</span>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <select
                      value={employmentEndMonth}
                      onChange={(e) => setEmploymentEndMonth(e.target.value)}
                      disabled={employmentCurrentlyWorking}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "18px",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                        boxSizing: "border-box",
                        background: employmentCurrentlyWorking ? "#f8f9fa" : "#fff",
                        color: employmentCurrentlyWorking ? "#9ca3af" : "#1a1a1a",
                      }}
                      onFocus={(e) => {
                        if (!employmentCurrentlyWorking) {
                          e.target.style.borderColor = "#007674";
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                      }}
                    >
                      <option value="">Through, month</option>
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <select
                      value={employmentEndYear}
                      onChange={(e) => setEmploymentEndYear(e.target.value)}
                      disabled={employmentCurrentlyWorking}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "18px",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                        boxSizing: "border-box",
                        background: employmentCurrentlyWorking ? "#f8f9fa" : "#fff",
                        color: employmentCurrentlyWorking ? "#9ca3af" : "#1a1a1a",
                      }}
                      onFocus={(e) => {
                        if (!employmentCurrentlyWorking) {
                          e.target.style.borderColor = "#007674";
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                      }}
                    >
                      <option value="">Through, year</option>
                      {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Currently Working Checkbox */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#1a1a1a",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={employmentCurrentlyWorking}
                    onChange={(e) => setEmploymentCurrentlyWorking(e.target.checked)}
                    style={{
                      marginRight: "12px",
                      width: "18px",
                      height: "18px",
                      accentColor: "#007674",
                    }}
                  />
                  I currently work here
                </label>
              </div>

              {/* Description Field */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Description (Optional)
                </label>
                <textarea
                  value={employmentDescription}
                  onChange={e => setEmploymentDescription(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    padding: "16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "18px",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                    boxSizing: "border-box",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                  placeholder="Enter description"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <motion.button
                onClick={handleCloseEmploymentModal}
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
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => {
                  // Here you would typically save the employment to your backend
                  handleCloseEmploymentModal();
                  // You can add API call here to save the employment
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
                  background: "#005a58",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {isEditingEmployment ? "Update" : "Save"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default FreelancersProfilePage;
