import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  BsPeople,
  BsCalendar,
  BsGeoAlt,
  BsPencil,
  BsEye,
  BsArrowRepeat,
  BsX,
  BsGlobe,
  BsCheckCircle,
  BsClock,
  BsCreditCard,
  BsQuestionCircle,
  BsPaperclip,
  BsInfoCircle,
} from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { FaStar, FaBolt } from "react-icons/fa";
const API_URL = "http://localhost:5000/api/auth";

const steps = [
  "POST DETAILS",
  "INVITE FREELANCERS",
  "REVIEW PROPOSALS",
  "HIRE FREELANCERS",
];

const stepRoutes = ["/job-details", "/suggested", "/proposals", "/hired"];

function timeAgo(dateString) {
  if (!dateString) return "1 hour ago";
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

const ClientJobDetailedPage = () => {
  // CSS Animations for filter section
  const filterAnimations = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
        max-height: 0;
      }
      to {
        opacity: 1;
        transform: translateY(0);
        max-height: 1000px;
      }
    }
    
    @keyframes slideUp {
      from {
        opacity: 1;
        transform: translateY(0);
        max-height: 1000px;
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
        max-height: 0;
      }
    }
    
    .filter-section-enter {
      animation: slideDown 0.3s ease-out;
    }
    
    .filter-section-exit {
      animation: slideUp 0.3s ease-out;
    }
  `;
  const { jobid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeInviteTab, setActiveInviteTab] = useState("search");
  const [activeProposalTab, setActiveProposalTab] = useState("all");
  const [activeHireTab, setActiveHireTab] = useState("hired");

  // Get invite tab from URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/invites")) {
      setActiveInviteTab("invited");
    } else if (path.includes("/hires")) {
      setActiveInviteTab("hires");
    } else if (path.includes("/saved")) {
      setActiveInviteTab("saved");
    } else if (path.includes("/suggested")) {
      setActiveInviteTab("search");
    }
  }, [location.pathname]);

  // Handle invite tab changes with URL path updates
  const handleInviteTabChange = (tab) => {
    setActiveInviteTab(tab);

    // Get current search parameters to preserve them
    const urlParams = new URLSearchParams(location.search);
    const searchParams = urlParams.toString();

    // Navigate to different URL paths based on tab
    let newPath;
    switch (tab) {
      case "search":
        newPath = `/ws/client/applicants/${jobid}/suggested`;
        break;
      case "invited":
        newPath = `/ws/client/applicants/${jobid}/invites`;
        break;
      case "hires":
        newPath = `/ws/client/applicants/${jobid}/hires`;
        break;

      default:
        newPath = `/ws/client/applicants/${jobid}/suggested`;
    }

    // Add search parameters if they exist
    const newUrl = searchParams ? `${newPath}?${searchParams}` : newPath;
    navigate(newUrl, { replace: true });
  };

  // Handle proposal tab changes with URL path updates
  const handleProposalTabChange = (tab) => {
    setActiveProposalTab(tab);

    // Get current search parameters to preserve them
    const urlParams = new URLSearchParams(location.search);
    const searchParams = urlParams.toString();

    // Navigate to different URL paths based on tab
    let newPath;
    switch (tab) {
      case "all":
        newPath = `/ws/client/applicants/${jobid}/proposals`;
        break;
      case "shortlisted":
        newPath = `/ws/client/applicants/${jobid}/shortlisted`;
        break;
      case "messaged":
        newPath = `/ws/client/applicants/${jobid}/messaged`;
        break;

      default:
        newPath = `/ws/client/applicants/${jobid}/proposals`;
    }

    // Add search parameters if they exist
    const newUrl = searchParams ? `${newPath}?${searchParams}` : newPath;
    navigate(newUrl, { replace: true });
  };

  // Handle hire tab changes
  const handleHireTabChange = (tab) => {
    setActiveHireTab(tab);

    // Get current search parameters to preserve them
    const urlParams = new URLSearchParams(location.search);
    const searchParams = urlParams.toString();

    // Navigate to different URL paths based on tab
    let newPath;
    switch (tab) {
      case "offers":
        newPath = `/ws/client/applicants/${jobid}/offers`;
        break;
      case "hired":
        newPath = `/ws/client/applicants/${jobid}/hired`;
        break;
      default:
        newPath = `/ws/client/applicants/${jobid}/hired`;
    }

    // Add search parameters if they exist
    const newUrl = searchParams ? `${newPath}?${searchParams}` : newPath;
    navigate(newUrl, { replace: true });
  };

  // Determine current step based on URL path
  const getCurrentStep = () => {
    const path = location.pathname;
    if (path.includes("/job-details")) return 0;
    if (
      path.includes("/suggested") ||
      path.includes("/invites") ||
      path.includes("/hires")
    )
      return 1;
    if (
      path.includes("/proposals") ||
      path.includes("/shortlisted") ||
      path.includes("/messaged")
    )
      return 2;
    if (path.includes("/hired") || path.includes("/offers")) return 3;
    if (path.includes("/applicants")) return 2;
    return 0; // default to first step
  };

  const [currentStep, setCurrentStep] = useState(getCurrentStep());

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
    const route = stepRoutes[stepIndex];
    navigate(`/ws/client/applicants/${jobid}${route}`);
  };

  // Get search term and page from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const q = urlParams.get("q");
    const page = urlParams.get("page");
    setSearchTerm(q || "");
    setCurrentPage(page ? parseInt(page) : 1);
  }, [location.search]);

  // Update currentStep when URL changes
  useEffect(() => {
    setCurrentStep(getCurrentStep());
  }, [location.pathname]);

  // Initialize activeProposalTab based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/shortlisted")) {
      setActiveProposalTab("shortlisted");
    } else if (path.includes("/messaged")) {
      setActiveProposalTab("messaged");
    } else if (path.includes("/proposals")) {
      setActiveProposalTab("all");
    } else {
      setActiveProposalTab("all");
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/jobpost/${jobid}/`);
        if (res.data && res.data.id) {
          setJob(res.data);
        } else {
          setError("Job not found");
        }
      } catch (err) {
        setError("Failed to fetch job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobid]);

  if (loading) return <div style={{ padding: 32 }}>Loading job details...</div>;
  if (error) return <div style={{ padding: 32, color: "red" }}>{error}</div>;
  if (!job) return null;

  // Placeholder client info (replace with real data if available)
  const client = {
    paymentVerified: false,
    phoneVerified: true,
    time: "3:31 PM",
    hireRate: "0% hire rate, 1 open job",
    company: "Mid-sized company (10-99 people)",
    industry: "Engineering & Architecture",
    memberSince: "May 4, 2025",
  };

  // Search function to filter freelancers
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
    const urlParams = new URLSearchParams(location.search);
    if (term) {
      urlParams.set("q", term);
    } else {
      urlParams.delete("q");
    }
    urlParams.delete("page"); // Reset page when searching
    const newSearch = urlParams.toString();
    const newUrl = `${location.pathname}${newSearch ? "?" + newSearch : ""}`;
    navigate(newUrl, { replace: true });

    // Scroll to top when searching
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pagination function
  const handlePageChange = (page) => {
    setCurrentPage(page);
    const urlParams = new URLSearchParams(location.search);
    if (page > 1) {
      urlParams.set("page", page.toString());
    } else {
      urlParams.delete("page");
    }
    const newSearch = urlParams.toString();
    const newUrl = `${location.pathname}${newSearch ? "?" + newSearch : ""}`;
    navigate(newUrl, { replace: true });

    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mock freelancers data for the Invite Freelancers tab
  const mockFreelancers = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Full Stack Developer",
      location: "New York, United States",
      rate: 45.0,
      jobSuccess: 98,
      earned: "$50K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      boosted: true,
      topSkills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "UI/UX Designer & Frontend Developer",
      location: "San Francisco, United States",
      rate: 38.5,
      jobSuccess: 95,
      earned: "$25K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      boosted: false,
      topSkills: ["Figma", "React", "CSS", "JavaScript", "Adobe XD"],
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "WordPress Developer & SEO Specialist",
      location: "Miami, United States",
      rate: 32.0,
      jobSuccess: 92,
      earned: "$15K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      boosted: true,
      topSkills: ["WordPress", "PHP", "SEO", "CSS", "JavaScript"],
    },
    {
      id: 4,
      name: "David Kim",
      title: "Backend Developer & Database Expert",
      location: "Seattle, United States",
      rate: 42.0,
      jobSuccess: 97,
      earned: "$35K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      boosted: false,
      topSkills: ["Python", "Django", "PostgreSQL", "Docker", "Redis"],
    },
    {
      id: 5,
      name: "Alexandra Thompson",
      title: "Mobile App Developer",
      location: "Austin, United States",
      rate: 48.0,
      jobSuccess: 96,
      earned: "$75K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
      boosted: true,
      topSkills: ["React Native", "Swift", "Kotlin", "Firebase", "Git"],
    },
    {
      id: 6,
      name: "James Wilson",
      title: "DevOps Engineer & Cloud Specialist",
      location: "Denver, United States",
      rate: 52.0,
      jobSuccess: 99,
      earned: "$90K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      boosted: false,
      topSkills: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins"],
    },
    {
      id: 7,
      name: "Maria Garcia",
      title: "Data Scientist & ML Engineer",
      location: "Boston, United States",
      rate: 55.0,
      jobSuccess: 94,
      earned: "$65K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      boosted: true,
      topSkills: ["Python", "TensorFlow", "Pandas", "SQL", "Scikit-learn"],
    },
    {
      id: 8,
      name: "Robert Taylor",
      title: "Frontend Developer & Vue.js Expert",
      location: "Portland, United States",
      rate: 36.0,
      jobSuccess: 91,
      earned: "$30K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      boosted: false,
      topSkills: ["Vue.js", "JavaScript", "CSS3", "Webpack", "Git"],
    },
    {
      id: 9,
      name: "Lisa Anderson",
      title: "Product Manager & UX Strategist",
      location: "Chicago, United States",
      rate: 44.0,
      jobSuccess: 93,
      earned: "$55K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      boosted: true,
      topSkills: [
        "Product Strategy",
        "User Research",
        "Figma",
        "Agile",
        "Analytics",
      ],
    },
    {
      id: 10,
      name: "Kevin Martinez",
      title: "Full Stack Developer & System Architect",
      location: "Los Angeles, United States",
      rate: 50.0,
      jobSuccess: 98,
      earned: "$80K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      boosted: false,
      topSkills: [
        "Java",
        "Spring Boot",
        "React",
        "PostgreSQL",
        "Microservices",
      ],
    },
    {
      id: 11,
      name: "Jennifer Lee",
      title: "Graphic Designer & Brand Specialist",
      location: "Nashville, United States",
      rate: 28.0,
      jobSuccess: 89,
      earned: "$20K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      boosted: true,
      topSkills: [
        "Adobe Creative Suite",
        "Branding",
        "Illustration",
        "Typography",
        "Print Design",
      ],
    },
    {
      id: 12,
      name: "Christopher Brown",
      title: "Cybersecurity Specialist & Penetration Tester",
      location: "Washington DC, United States",
      rate: 58.0,
      jobSuccess: 97,
      earned: "$70K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      boosted: false,
      topSkills: [
        "Ethical Hacking",
        "Network Security",
        "Python",
        "Linux",
        "Wireshark",
      ],
    },
    {
      id: 13,
      name: "Amanda Davis",
      title: "Content Writer & SEO Specialist",
      location: "Orlando, United States",
      rate: 25.0,
      jobSuccess: 88,
      earned: "$18K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      boosted: true,
      topSkills: [
        "Content Writing",
        "SEO",
        "WordPress",
        "Social Media",
        "Copywriting",
      ],
    },
    {
      id: 14,
      name: "Daniel White",
      title: "Blockchain Developer & Smart Contract Expert",
      location: "Las Vegas, United States",
      rate: 62.0,
      jobSuccess: 95,
      earned: "$85K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      boosted: false,
      topSkills: ["Solidity", "Ethereum", "Web3.js", "Smart Contracts", "DeFi"],
    },
    {
      id: 15,
      name: "Rachel Green",
      title: "QA Engineer & Test Automation Specialist",
      location: "Phoenix, United States",
      rate: 34.0,
      jobSuccess: 90,
      earned: "$28K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      boosted: true,
      topSkills: [
        "Selenium",
        "JUnit",
        "Cypress",
        "API Testing",
        "Test Planning",
      ],
    },
    {
      id: 16,
      name: "Thomas Miller",
      title: "Game Developer & Unity Expert",
      location: "San Diego, United States",
      rate: 40.0,
      jobSuccess: 92,
      earned: "$45K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      boosted: false,
      topSkills: ["Unity", "C#", "Game Design", "3D Modeling", "Animation"],
    },
    {
      id: 17,
      name: "Nicole Johnson",
      title: "Digital Marketing Manager & Growth Hacker",
      location: "Atlanta, United States",
      rate: 38.0,
      jobSuccess: 87,
      earned: "$35K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      boosted: true,
      topSkills: [
        "Google Ads",
        "Facebook Ads",
        "Analytics",
        "Email Marketing",
        "Conversion Optimization",
      ],
    },
    {
      id: 18,
      name: "Steven Clark",
      title: "AI/ML Engineer & Deep Learning Specialist",
      location: "Pittsburgh, United States",
      rate: 65.0,
      jobSuccess: 96,
      earned: "$95K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      boosted: false,
      topSkills: [
        "PyTorch",
        "TensorFlow",
        "Computer Vision",
        "NLP",
        "Deep Learning",
      ],
    },
    {
      id: 19,
      name: "Hannah Lewis",
      title: "E-commerce Developer & Shopify Expert",
      location: "Dallas, United States",
      rate: 32.0,
      jobSuccess: 89,
      earned: "$25K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      boosted: true,
      topSkills: ["Shopify", "Liquid", "JavaScript", "CSS", "E-commerce"],
    },
    {
      id: 20,
      name: "Ryan Hall",
      title: "System Administrator & IT Infrastructure Specialist",
      location: "Houston, United States",
      rate: 35.0,
      jobSuccess: 91,
      earned: "$40K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      boosted: false,
      topSkills: [
        "Linux",
        "Windows Server",
        "VMware",
        "Networking",
        "Backup Solutions",
      ],
    },
    {
      id: 21,
      name: "Samantha Turner",
      title: "Video Editor & Motion Graphics Designer",
      location: "Minneapolis, United States",
      rate: 30.0,
      jobSuccess: 86,
      earned: "$22K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      boosted: true,
      topSkills: [
        "Adobe Premiere",
        "After Effects",
        "Motion Graphics",
        "Video Editing",
        "Color Grading",
      ],
    },
    {
      id: 22,
      name: "Andrew Moore",
      title: "Database Administrator & SQL Expert",
      location: "Kansas City, United States",
      rate: 42.0,
      jobSuccess: 94,
      earned: "$50K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      boosted: false,
      topSkills: [
        "SQL Server",
        "MySQL",
        "PostgreSQL",
        "Database Design",
        "Performance Tuning",
      ],
    },
    {
      id: 23,
      name: "Victoria Scott",
      title: "Social Media Manager & Community Builder",
      location: "Salt Lake City, United States",
      rate: 26.0,
      jobSuccess: 85,
      earned: "$19K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      boosted: true,
      topSkills: [
        "Social Media Strategy",
        "Content Creation",
        "Community Management",
        "Analytics",
        "Influencer Marketing",
      ],
    },
    {
      id: 24,
      name: "Jonathan Adams",
      title: "Technical Writer & Documentation Specialist",
      location: "Raleigh, United States",
      rate: 28.0,
      jobSuccess: 88,
      earned: "$23K+ earned",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      boosted: false,
      topSkills: [
        "Technical Writing",
        "API Documentation",
        "Markdown",
        "GitBook",
        "User Guides",
      ],
    },
  ];

  // Filter freelancers based on search term
  const filteredFreelancers = mockFreelancers.filter((freelancer) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      freelancer.name.toLowerCase().includes(searchLower) ||
      freelancer.title.toLowerCase().includes(searchLower) ||
      freelancer.location.toLowerCase().includes(searchLower) ||
      freelancer.topSkills.some((skill) =>
        skill.toLowerCase().includes(searchLower)
      )
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredFreelancers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFreelancers = filteredFreelancers.slice(startIndex, endIndex);

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 4;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 2) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
        } else if (currentPage >= totalPages - 1) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
        }
      }
      return pages;
    };

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            width: 36,
            height: 36,
            border: "none",
            background: "transparent",
            color: currentPage === 1 ? "#ccc" : "#333",
            borderRadius: "50%",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            fontSize: 18,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            outline: "none",
          }}
        >
          ‹
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() =>
              typeof page === "number" ? handlePageChange(page) : null
            }
            disabled={page === "..."}
            style={{
              width: 36,
              height: 36,
              border: page === currentPage ? "2px solid #333" : "none",
              background: page === currentPage ? "transparent" : "transparent",
              color:
                page === currentPage
                  ? "#333"
                  : page === "..."
                  ? "#999"
                  : "#333",
              borderRadius: "50%",
              cursor: page === "..." ? "default" : "pointer",
              fontSize: 14,
              fontWeight: page === currentPage ? 600 : 400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              outline: "none",
            }}
          >
            {page}
          </button>
        ))}

        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            width: 36,
            height: 36,
            border: "none",
            background: "transparent",
            color: currentPage === totalPages ? "#ccc" : "#333",
            borderRadius: "50%",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            fontSize: 18,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            outline: "none",
          }}
        >
          ›
        </button>
      </div>
    );
  };

  // Tab content for each step
  const renderTabContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            {/* Summary Section */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>
                Summary
              </div>
              <div style={{ color: "#222", fontSize: 18, lineHeight: 1.7 }}>
                {job.description || "No description provided."}
              </div>
            </div>
            {/* Job Details Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 0,
                margin: "36px 0 0 0",
                paddingBottom: 36,
                borderBottom: "1px solid #ececec",
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,116,118,0.03)",
              }}
            >
              <div style={jobDetailColStyle}>
                <BsCalendar style={jobDetailIconStyle} />
                <div
                  style={{
                    fontWeight: 600,
                    color: "#222",
                    fontSize: 18,
                    marginBottom: 2,
                  }}
                >
                  {job.duration || "1 to 3 months"}
                </div>
                <div style={{ color: "#888", fontSize: 18 }}>Duration</div>
              </div>
              <div style={jobDetailColStyle}>
                <BsPeople style={jobDetailIconStyle} />
                <div
                  style={{
                    fontWeight: 600,
                    color: "#222",
                    fontSize: 18,
                    marginBottom: 2,
                  }}
                >
                  {job.experienceLevel || "Intermediate"}
                </div>
                <div style={{ color: "#888", fontSize: 18 }}>
                  I am looking for a mix of experience and value
                </div>
              </div>
              <div style={jobDetailColStyle}>
                <BsCreditCard style={jobDetailIconStyle} />
                <div
                  style={{
                    fontWeight: 600,
                    color: "#222",
                    fontSize: 18,
                    marginBottom: 2,
                  }}
                >
                  {job.hourlyRateFrom && job.hourlyRateTo
                    ? `$${parseFloat(job.hourlyRateFrom).toFixed(
                        2
                      )} - $${parseFloat(job.hourlyRateTo).toFixed(2)}`
                    : "$15.00 - $35.00"}
                </div>
                <div style={{ color: "#888", fontSize: 18 }}>Hourly</div>
              </div>
            </div>
            {/* Attachment Section */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "28px 32px",
                margin: "32px 0 32px 0",
                border: "1px solid #ececec",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 22,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Attachment
              </div>
              {job.attachments ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BsPaperclip
                    style={{
                      color: "#007476",
                      fontSize: 22,
                      verticalAlign: -3,
                    }}
                  />
                  <a
                    href={job.attachments}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#007476",
                      fontWeight: 600,
                      textDecoration: "underline",
                      fontSize: 18,
                    }}
                  >
                    PPRC_Price_List.pdf (321 KB)
                  </a>
                </div>
              ) : (
                <div style={{ color: "#888", fontSize: 18 }}>No attachment</div>
              )}
            </div>
            {/* Project Type Section */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "28px 32px",
                margin: "0 0 32px 0",
                border: "1px solid #ececec",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 20 }}>
                Project Type:{" "}
              </span>
              <span
                style={{
                  color: "#222",
                  fontSize: 20,
                  fontWeight: 400,
                  marginLeft: 8,
                }}
              >
                {job.scopeOfWork || "Ongoing project"}
              </span>
            </div>
            {/* Skills and Expertise Section */}
            <style>{`
              .skill-tag {
                background: linear-gradient(135deg, rgba(0, 118, 116, 0.1) 0%, rgba(0, 118, 116, 0.05) 100%);
                color: #007674;
                border: 1px solid rgba(0, 118, 116, 0.2);
                border-radius: 20px;
                padding: 10px 26px;
                font-size: 16px;
                font-weight: 600;
                display: inline-block;
                box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                margin-bottom: 6px;
                margin-right: 6px;
                transition: all 0.3s ease;
                cursor: pointer;
              }
              .skill-tag:hover {
                background: linear-gradient(135deg, #007674 0%, #005a58 100%);
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 118, 116, 0.3);
              }
            `}</style>
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "28px 32px",
                margin: "0 0 32px 0",
                border: "1px solid #ececec",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 15 }}>
                Skills and Expertise
              </div>
              <div
                style={{
                  color: "#222",
                  fontWeight: 500,
                  fontSize: 18,
                  marginBottom: 12,
                }}
              >
                Mandatory skills
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
                {(job.skills && job.skills.length > 0
                  ? job.skills
                  : [
                      { name: "Web Development" },
                      { name: "WordPress" },
                      { name: "Web Design" },
                      { name: "PHP" },
                      { name: "JavaScript" },
                    ]
                ).map((skill, i) => (
                  <span key={i} className="skill-tag">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            {/* Activity on this job Section */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "28px 32px",
                margin: "0 0 32px 0",
                border: "1px solid #ececec",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 14 }}>
                Activity on this job
              </div>
              <div style={{ color: "#222", fontSize: 18, marginBottom: 4 }}>
                Proposals:{" "}
                <span
                  style={{
                    color: "#007476",
                    fontWeight: 500,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <BsInfoCircle style={{ fontSize: 18, verticalAlign: -2 }} />{" "}
                  Less than 5
                </span>
              </div>
              <div style={{ color: "#222", fontSize: 18, marginBottom: 4 }}>
                Interviewing: 0
              </div>
              <div style={{ color: "#222", fontSize: 18, marginBottom: 4 }}>
                Invites sent: 0
              </div>
              <div style={{ color: "#222", fontSize: 18 }}>
                Unanswered invites: 0
              </div>
            </div>
          </>
        );
      case 1:
        // Invite Freelancers tab
        return (
          <div style={{ width: "100%", padding: "0 24px" }}>
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                marginBottom: 24,
                marginTop: 10,
                position: "relative",
              }}
            >
              <span
                onClick={() => handleInviteTabChange("search")}
                style={{
                  fontWeight: activeInviteTab === "search" ? 600 : 600,
                  fontSize: activeInviteTab === "search" ? 20 : 20,
                  color: activeInviteTab === "search" ? "#222" : "#888",
                  borderBottom:
                    activeInviteTab === "search"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Search
              </span>
              <span
                onClick={() => handleInviteTabChange("invited")}
                style={{
                  fontWeight: activeInviteTab === "invited" ? 600 : 600,
                  fontSize: activeInviteTab === "invited" ? 20 : 20,
                  color: activeInviteTab === "invited" ? "#222" : "#888",
                  borderBottom:
                    activeInviteTab === "invited"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Invited Freelancers
              </span>
              <span
                onClick={() => handleInviteTabChange("hires")}
                style={{
                  fontWeight: activeInviteTab === "hires" ? 600 : 600,
                  fontSize: activeInviteTab === "hires" ? 20 : 20,
                  color: activeInviteTab === "hires" ? "#222" : "#888",
                  borderBottom:
                    activeInviteTab === "hires"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                My Hires
              </span>
            </div>

            {/* Tab Content */}
            {activeInviteTab === "search" && (
              <>
                {/* Search/filter row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <div style={{ flex: 1, position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Search freelancers by name, skills, or location..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 18px 12px 45px",
                        border: "1.5px solid #bbb",
                        borderRadius: 8,
                        fontSize: 17,
                        outline: "none",
                        background: "#fff",
                      }}
                    />
                    <svg
                      style={{
                        position: "absolute",
                        left: 15,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 20,
                        height: 20,
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        stroke="#666"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <button
                    onClick={() => {
                    if (showFilters) {
                      // Start closing animation
                      setIsClosing(true);
                      // Wait for animation to complete before hiding
                      setTimeout(() => {
                        setShowFilters(false);
                        setIsClosing(false);
                      }, 300); // Match animation duration
                    } else {
                      setShowFilters(true);
                      setIsClosing(false);
                    }
                  }}
                    style={{
                      border: "1.5px solid #007476",
                      color: "#007476",
                      background: "#fff",
                      borderRadius: 8,
                      padding: "8px 22px",
                      fontWeight: 700,
                      fontSize: 18,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M3 6h18M3 12h18M3 18h18"
                        stroke="#007476"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Filters
                  </button>
                </div>

                {/* Inline Filter Section */}
                {showFilters && (
                  <div
                    style={{
                      background: "#fff",
                      marginBottom: 24,
                      animation: isClosing ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-out',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Filter Categories in 4 Columns */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: 32,
                        marginBottom: 24,
                      }}
                    >
                      {/* Column 1 - Earned Amount */}
                      <div>
                        <h4
                          style={{
                            fontSize: 22,
                            fontWeight: 600,
                            color: "#222",
                            marginBottom: 16,
                          }}
                        >
                          Earned amount:
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          {[
                            "Any amount earned",
                            "$1+ earned",
                            "$100+ earned",
                            "$1K+ earned",
                            "$10K+ earned",
                            "No earnings yet",
                          ].map((option, index) => (
                            <label
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                fontSize: 18,
                              }}
                            >
                              <input
                                type="radio"
                                name="earnedAmount"
                                defaultChecked={index === 0}
                                style={{ accentColor: "#007476", width: "20px", height: "20px" }}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Column 2 - Job Success */}
                      <div>
                        <h4
                          style={{
                            fontSize: 22,
                            fontWeight: 600,
                            color: "#222",
                            marginBottom: 16,
                          }}
                        >
                          Job Success:
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          {["Any job success", "80% & up", "90% & up"].map(
                            (option, index) => (
                              <label
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  cursor: "pointer",
                                  fontSize: 18,
                                }}
                              >
                                <input
                                  type="radio"
                                  name="jobSuccess"
                                  defaultChecked={index === 0}
                                  style={{ accentColor: "#007476", width: "20px", height: "20px" }}
                                />
                                <span>{option}</span>
                              </label>
                            )
                          )}
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer",
                              fontSize: 18,
                            }}
                          >
                            <input
                              type="radio"
                              name="jobSuccess"
                              style={{ accentColor: "#007476", width: "20px", height: "20px" }}
                            />
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              Top Rated Plus{" "}
                              <span style={{ color: "#e91e63", fontSize: 18 }}>
                                ⭐
                              </span>
                            </span>
                          </label>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer",
                              fontSize: 18,
                            }}
                          >
                            <input
                              type="radio"
                              name="jobSuccess"
                              style={{ accentColor: "#007476", width: "20px", height: "20px" }}
                            />
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              Top Rated{" "}
                              <span style={{ color: "#007bff", fontSize: 18 }}>
                                ⭐
                              </span>
                            </span>
                          </label>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer",
                              fontSize: 18,
                            }}
                          >
                            <input
                              type="checkbox"
                              style={{ accentColor: "#007476", width: "20px", height: "20px" }}
                            />
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              Rising Talent{" "}
                              <span style={{ color: "#28a745", fontSize: 18 }}>
                                ↗
                              </span>
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Column 3 - Hourly Rate */}
                      <div>
                        <h4
                          style={{
                            fontSize: 22,
                            fontWeight: 600,
                            color: "#222",
                            marginBottom: 16,
                          }}
                        >
                          Hourly Rate:
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          {[
                            "Any hourly rate",
                            "$10 and below",
                            "$10 - $30",
                            "$30 - $60",
                            "$60 & above",
                          ].map((option, index) => (
                            <label
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                fontSize: 18,
                              }}
                            >
                              <input
                                type="radio"
                                name="hourlyRate"
                                defaultChecked={index === 0}
                                style={{ accentColor: "#007476", width: "20px", height: "20px" }}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Column 4 - Category */}
                      <div>
                        <h4
                          style={{
                            fontSize: 22,
                            fontWeight: 600,
                            color: "#222",
                            marginBottom: 16,
                          }}
                        >
                          Category:
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          {[
                            "Any category",
                            "Customer Service",
                            "Design & Creative",
                            "Web, Mobile & Software Dev",
                          ].map((option, index) => (
                            <label
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                fontSize: 18,
                              }}
                            >
                              <input
                                type="radio"
                                name="category"
                                defaultChecked={index === 0}
                                style={{ accentColor: "#007476", width: "20px", height: "20px" }}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              color: "#007476",
                              fontSize: 18,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: 0,
                            }}
                          >
                            See all categories <span>▼</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Close Filter Button */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        borderBottom: "1px solid #eee",
                        paddingBottom: 16,
                      }}
                    >
                      <button
                        onClick={() => {
                          setIsClosing(true);
                          setTimeout(() => {
                            setShowFilters(false);
                            setIsClosing(false);
                          }, 300);
                        }}
                        style={{
                          background: "#007476",
                          border: "none",
                          borderRadius: 8,
                          padding: "12px 24px",
                          fontWeight: 700,
                          fontSize: 16,
                          cursor: "pointer",
                          color: "#fff",
                        }}
                      >
                        Close filters
                      </button>
                    </div>
                  </div>
                )}

                {/* Freelancer cards */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  {filteredFreelancers.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "#888",
                        fontSize: 18,
                        background: "#fff",
                        borderRadius: 10,
                        border: "1px solid #eee",
                      }}
                    >
                      {searchTerm
                        ? `No freelancers found matching "${searchTerm}"`
                        : "No freelancers available"}
                    </div>
                  ) : (
                    <>
                      {paginatedFreelancers.map((freelancer, index) => (
                        <div
                          key={freelancer.id}
                          style={{
                            background: "#fff",
                            borderRadius: 10,
                            padding: 24,
                            marginBottom:
                              index < mockFreelancers.length - 1 ? 0 : 0,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                            border: "1px solid #eee",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 20,
                          }}
                        >
                          {/* Avatar and star badge */}
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <img
                              src={freelancer.avatar}
                              alt={freelancer.name}
                              style={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "3px solid #fff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                bottom: -4,
                                right: -4,
                                background: "#fff",
                                borderRadius: "50%",
                                padding: 2,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FaStar
                                style={{ color: "#007bff", fontSize: 18 }}
                              />
                            </div>
                          </div>

                          {/* Main content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 4,
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: 18,
                                  color: "#222",
                                }}
                              >
                                {freelancer.name}
                              </span>
                              {freelancer.boosted && (
                                <span
                                  style={{
                                    color: "#6f42c1",
                                    fontWeight: 600,
                                    fontSize: 13,
                                    background: "#f3f0fa",
                                    borderRadius: 6,
                                    padding: "2px 8px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <FaBolt
                                    style={{ color: "#6f42c1", fontSize: 12 }}
                                  />
                                  Boosted
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: 18,
                                color: "#222",
                                fontWeight: 500,
                                marginBottom: 4,
                                lineHeight: 1.4,
                              }}
                            >
                              {freelancer.title}
                            </div>
                            <div
                              style={{
                                color: "#888",
                                fontSize: 15,
                                marginBottom: 8,
                              }}
                            >
                              {freelancer.location}
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 24,
                                marginBottom: 8,
                              }}
                            >
                              <span
                                style={{
                                  color: "#222",
                                  fontWeight: 600,
                                  fontSize: 18,
                                }}
                              >
                                ${freelancer.rate.toFixed(2)}/hr
                              </span>
                              <span
                                style={{
                                  color: "#007bff",
                                  fontWeight: 600,
                                  fontSize: 15,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <BsCheckCircle
                                  style={{ color: "#007bff", fontSize: 18 }}
                                />
                                {freelancer.jobSuccess}% Job Success
                              </span>
                              <span
                                style={{
                                  color: "#888",
                                  fontWeight: 600,
                                  fontSize: 15,
                                }}
                              >
                                {freelancer.earned} earned
                              </span>
                            </div>

                            {freelancer.topSkills &&
                              freelancer.topSkills.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                  <div
                                    style={{
                                      color: "#222",
                                      fontSize: 15,
                                      marginBottom: 8,
                                      fontWeight: 500,
                                    }}
                                  >
                                    Here are their top{" "}
                                    {freelancer.topSkills.length} relevant
                                    skills to your job
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 8,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {freelancer.topSkills.map((skill, i) => (
                                      <span
                                        key={i}
                                        style={{
                                          background: "#ededed",
                                          color: "#222",
                                          borderRadius: 16,
                                          padding: "6px 16px",
                                          fontWeight: 600,
                                          fontSize: 15,
                                        }}
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* Action buttons */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "flex-end",
                              gap: 12,
                              minWidth: 120,
                              flexShrink: 0,
                            }}
                          >
                            <button
                              style={{
                                border: "1.5px solid #007476",
                                color: "#007476",
                                background: "#fff",
                                borderRadius: 8,
                                padding: "8px 22px",
                                fontWeight: 700,
                                fontSize: 18,
                                cursor: "pointer",
                                transition: "background 0.2s",
                                minWidth: 80,
                              }}
                            >
                              Hire
                            </button>
                            <button
                              style={{
                                background: "#007476",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 22px",
                                fontWeight: 700,
                                fontSize: 18,
                                cursor: "pointer",
                                transition: "background 0.2s",
                                minWidth: 120,
                              }}
                            >
                              Invite to Job
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Pagination - Right aligned */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 32,
                    padding: "20px 0",
                  }}
                >
                  <Pagination />
                </div>
              </>
            )}

            {/* Invited Freelancers Tab */}
            {activeInviteTab === "invited" && (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 20px",
                  color: "#888",
                  fontSize: 18,
                  background: "#fff",
                  borderRadius: 10,
                  border: "1px solid #eee",
                }}
              >
                {/* Overlapping Profile Cards Graphic */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 40,
                    position: "relative",
                    height: 120,
                  }}
                >
                  {/* Left Card (faded) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "25%",
                      transform: "translateX(-50%)",
                      background: "#f8f9fa",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "16px 12px",
                      width: 80,
                      height: 100,
                      opacity: 0.6,
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e9ecef",
                        margin: "0 auto 8px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          background: "#6c757d",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 6,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: i < 3 ? "#ffc107" : "#e9ecef",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 2,
                        marginTop: 4,
                      }}
                    ></div>
                  </div>

                  {/* Center Card (prominent) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#fff",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "20px 16px",
                      width: 90,
                      height: 110,
                      zIndex: 3,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#28a745",
                        margin: "0 auto 10px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          background: "#fff",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 8,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#ffc107",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 3,
                        marginTop: 6,
                      }}
                    ></div>
                  </div>

                  {/* Right Card (faded) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "75%",
                      transform: "translateX(-50%)",
                      background: "#f8f9fa",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "16px 12px",
                      width: 80,
                      height: 100,
                      opacity: 0.6,
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e9ecef",
                        margin: "0 auto 8px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          background: "#6c757d",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 6,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: i < 2 ? "#ffc107" : "#e9ecef",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 2,
                        marginTop: 4,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Text Content */}
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    color: "#495057",
                    marginBottom: 12,
                  }}
                >
                  No invited freelancers yet
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "#6c757d",
                    marginBottom: 30,
                    textAlign: "center",
                  }}
                >
                  Invite top talent before they're booked.
                </div>

                {/* Invite Button */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => handleInviteTabChange("search")}
                    style={{
                      background:
                        "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 15,
                      padding: "12px 24px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 8px 25px rgba(18, 18, 18, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 6px 20px rgba(0, 118, 116, 0.3)";
                    }}
                  >
                    Invite Freelancers
                  </button>
                </div>
              </div>
            )}

            {/* My Hires Tab */}
            {activeInviteTab === "hires" && (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 20px",
                  color: "#888",
                  fontSize: 18,
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #eee",
                }}
              >
                {/* Overlapping Profile Cards Graphic */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 40,
                    position: "relative",
                    height: 120,
                  }}
                >
                  {/* Left Card (faded) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "25%",
                      transform: "translateX(-50%)",
                      background: "#f8f9fa",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "16px 12px",
                      width: 80,
                      height: 100,
                      opacity: 0.6,
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e9ecef",
                        margin: "0 auto 8px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          background: "#6c757d",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 6,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: i < 2 ? "#ffc107" : "#e9ecef",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 2,
                        marginTop: 4,
                      }}
                    ></div>
                  </div>

                  {/* Center Card (prominent) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#fff",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "20px 16px",
                      width: 90,
                      height: 110,
                      zIndex: 3,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#28a745",
                        margin: "0 auto 10px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          background: "#fff",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 8,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#ffc107",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 3,
                        marginTop: 6,
                      }}
                    ></div>
                  </div>

                  {/* Right Card (faded) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "75%",
                      transform: "translateX(-50%)",
                      background: "#f8f9fa",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "16px 12px",
                      width: 80,
                      height: 100,
                      opacity: 0.6,
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e9ecef",
                        margin: "0 auto 8px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          background: "#6c757d",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 6,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: i < 2 ? "#ffc107" : "#e9ecef",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 2,
                        marginTop: 4,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Text Content */}
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    color: "#495057",
                    marginBottom: 12,
                  }}
                >
                  You haven't hired anyone yet
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: "#6c757d",
                    marginBottom: 30,
                    textAlign: "center",
                  }}
                >
                  Search for freelancers who can help you get work done.
                </div>

                {/* Search Button */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => handleInviteTabChange("search")}
                    style={{
                      background:
                        "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 15,
                      padding: "12px 24px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 8px 25px rgba(18, 18, 18, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background =
                        "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 6px 20px rgba(0, 118, 116, 0.3)";
                    }}
                  >
                    Search for Freelancers
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div style={{ width: "100%", padding: "0 24px" }}>
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                marginBottom: 24,
                marginTop: 10,
                position: "relative",
              }}
            >
              <span
                onClick={() => handleProposalTabChange("all")}
                style={{
                  fontWeight: activeProposalTab === "all" ? 600 : 600,
                  fontSize: activeProposalTab === "all" ? 20 : 20,
                  color: activeProposalTab === "all" ? "#222" : "#888",
                  borderBottom:
                    activeProposalTab === "all"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                All proposals
              </span>
              <span
                onClick={() => handleProposalTabChange("shortlisted")}
                style={{
                  fontWeight: activeProposalTab === "shortlisted" ? 600 : 600,
                  fontSize: activeProposalTab === "shortlisted" ? 20 : 20,
                  color: activeProposalTab === "shortlisted" ? "#222" : "#888",
                  borderBottom:
                    activeProposalTab === "shortlisted"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Shortlisted
              </span>
              <span
                onClick={() => handleProposalTabChange("messaged")}
                style={{
                  fontWeight: activeProposalTab === "messaged" ? 600 : 600,
                  fontSize: activeProposalTab === "messaged" ? 20 : 20,
                  color: activeProposalTab === "messaged" ? "#222" : "#888",
                  borderBottom:
                    activeProposalTab === "messaged"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Messaged
              </span>
            </div>

            {/* Tab Content */}
            {activeProposalTab === "all" && (
              <div style={{ maxWidth: 400, margin: "0 auto" }}>
                {/* Briefcase Icon */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    margin: "0 auto 32px auto",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Main briefcase body */}
                  <div
                    style={{
                      width: 60,
                      height: 45,
                      background: "#8B4513",
                      borderRadius: "8px 8px 12px 12px",
                      position: "relative",
                      boxShadow: "0 4px 12px rgba(139, 69, 19, 0.3)",
                    }}
                  >
                    {/* Briefcase handle */}
                    <div
                      style={{
                        position: "absolute",
                        top: -8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 20,
                        height: 8,
                        background: "#A0522D",
                        borderRadius: "4px 4px 0 0",
                        border: "2px solid #8B4513",
                      }}
                    ></div>

                    {/* Briefcase opening with glow */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 8,
                        background: "linear-gradient(90deg, #87CEEB, #98FB98)",
                        borderRadius: "8px 8px 0 0",
                        opacity: 0.8,
                      }}
                    ></div>

                    {/* Small tag on the right */}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: -4,
                        width: 8,
                        height: 12,
                        background: "#D2B48C",
                        borderRadius: "2px 0 0 2px",
                        transform: "rotate(15deg)",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Primary Message */}
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#000",
                    textAlign: "center",
                    marginBottom: 16,
                    lineHeight: 1.2,
                  }}
                >
                  No qualified proposals yet
                </div>

                {/* Secondary Call to Action */}
                <div
                  style={{
                    fontSize: 18,
                    color: "#666",
                    marginBottom: 40,
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  Feature this job post to get proposals faster and attract top
                  freelancers.
                </div>

                {/* Invite Freelancers Button */}
                <button
                  onClick={() => handleStepClick(1)}
                  style={{
                    background:
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 15,
                    padding: "14px 32px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                    margin: "0 auto",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(18, 18, 18, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(0, 118, 116, 0.3)";
                  }}
                >
                  Invite Freelancers
                </button>
              </div>
            )}

            {activeProposalTab === "shortlisted" && (
              <div
                style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}
              >
                {/* Briefcase Icon */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    margin: "0 auto 32px auto",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Main briefcase body */}
                  <div
                    style={{
                      width: 60,
                      height: 45,
                      background: "#8B4513",
                      borderRadius: "8px 8px 12px 12px",
                      position: "relative",
                      boxShadow: "0 4px 12px rgba(139, 69, 19, 0.3)",
                    }}
                  >
                    {/* Briefcase handle */}
                    <div
                      style={{
                        position: "absolute",
                        top: -8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 20,
                        height: 8,
                        background: "#A0522D",
                        borderRadius: "4px 4px 0 0",
                        border: "2px solid #8B4513",
                      }}
                    ></div>

                    {/* Briefcase opening with glow */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 8,
                        background: "linear-gradient(90deg, #87CEEB, #98FB98)",
                        borderRadius: "8px 8px 0 0",
                        opacity: 0.8,
                      }}
                    ></div>

                    {/* Small tag on the right */}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: -4,
                        width: 8,
                        height: 12,
                        background: "#D2B48C",
                        borderRadius: "2px 0 0 2px",
                        transform: "rotate(15deg)",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Heading */}
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#000",
                    marginBottom: 16,
                    lineHeight: 1.2,
                  }}
                >
                  Narrow down your most promising options
                </div>

                {/* Descriptive Text */}
                <div
                  style={{
                    fontSize: 18,
                    color: "#666",
                    marginBottom: 40,
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  When you Shortlist proposals, they'll appear here so you can
                  compare and make offers.
                </div>

                {/* View all proposals Button */}
                <button
                  onClick={() => handleProposalTabChange("all")}
                  style={{
                    background:
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 15,
                    padding: "14px 32px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                    margin: "0 auto",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(18, 18, 18, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(0, 118, 116, 0.3)";
                  }}
                >
                  View all proposals
                </button>
              </div>
            )}

            {activeProposalTab === "messaged" && (
              <div
                style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}
              >
                {/* Mailbox Icon */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    margin: "0 auto 32px auto",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Mailbox body */}
                  <div
                    style={{
                      width: 50,
                      height: 35,
                      background: "#28a745",
                      borderRadius: "8px 8px 12px 12px",
                      position: "relative",
                      boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
                    }}
                  >
                    {/* Mailbox flag */}
                    <div
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -2,
                        width: 12,
                        height: 20,
                        background: "#28a745",
                        borderRadius: "2px 8px 2px 2px",
                        transform: "rotate(-15deg)",
                        transformOrigin: "bottom left",
                      }}
                    ></div>

                    {/* Mailbox lock/detail */}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 8,
                        height: 8,
                        background: "#9c27b0",
                        borderRadius: "50%",
                      }}
                    ></div>
                  </div>

                  {/* Mailbox pole */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -15,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 4,
                      height: 20,
                      background: "#8B4513",
                      borderRadius: "2px",
                    }}
                  ></div>
                </div>

                {/* Heading */}
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#000",
                    marginBottom: 16,
                    lineHeight: 1.2,
                  }}
                >
                  No messages yet
                </div>

                {/* Descriptive Text */}
                <div
                  style={{
                    fontSize: 18,
                    color: "#666",
                    marginBottom: 40,
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  Start the conversation by asking any freelancer a question
                  about their proposal.
                </div>

                {/* View all proposals Button */}
                <button
                  onClick={() => handleProposalTabChange("all")}
                  style={{
                    background:
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 15,
                    padding: "14px 32px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                    margin: "0 auto",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(18, 18, 18, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background =
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(0, 118, 116, 0.3)";
                  }}
                >
                  View all proposals
                </button>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div style={{ width: "100%", padding: "0 24px" }}>
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                marginBottom: 24,
                marginTop: 10,
                position: "relative",
              }}
            >
              <span
                onClick={() => handleHireTabChange("offers")}
                style={{
                  fontWeight: activeHireTab === "offers" ? 600 : 600,
                  fontSize: activeHireTab === "offers" ? 20 : 20,
                  color: activeHireTab === "offers" ? "#222" : "#888",
                  borderBottom:
                    activeHireTab === "offers"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Offers
              </span>
              <span
                onClick={() => handleHireTabChange("hired")}
                style={{
                  fontWeight: activeHireTab === "hired" ? 600 : 600,
                  fontSize: activeHireTab === "hired" ? 20 : 20,
                  color: activeHireTab === "hired" ? "#222" : "#888",
                  borderBottom:
                    activeHireTab === "hired"
                      ? "2.5px solid #222"
                      : "2.5px solid transparent",
                  paddingBottom: 6,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                Hired
              </span>
            </div>

            {/* Tab Content */}
            {activeHireTab === "offers" && (
              <div
                style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}
              >
                {/* Green Folder Icon with Blue Lines */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: 40,
                    position: "relative",
                  }}
                >
                  {/* Blue Lines Above Folder */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                      marginBottom: 8,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        width: 3,
                        height: 12,
                        background: "#007bff",
                        borderRadius: 1.5,
                      }}
                    ></div>
                    <div
                      style={{
                        width: 3,
                        height: 8,
                        background: "#007bff",
                        borderRadius: 1.5,
                      }}
                    ></div>
                    <div
                      style={{
                        width: 3,
                        height: 16,
                        background: "#007bff",
                        borderRadius: 1.5,
                      }}
                    ></div>
                  </div>

                  {/* Green Folder Icon */}
                  <div
                    style={{
                      width: 80,
                      height: 60,
                      background: "#28a745",
                      borderRadius: "8px 8px 0 0",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
                    }}
                  >
                    {/* Folder Tab */}
                    <div
                      style={{
                        position: "absolute",
                        top: -8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 40,
                        height: 8,
                        background: "#28a745",
                        borderRadius: "4px 4px 0 0",
                        borderTop: "2px solid #fff",
                        borderLeft: "2px solid #fff",
                        borderRight: "2px solid #fff",
                      }}
                    ></div>

                    {/* Folder Content Lines */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 50,
                          height: 2,
                          background: "#fff",
                          borderRadius: 1,
                        }}
                      ></div>
                      <div
                        style={{
                          width: 40,
                          height: 2,
                          background: "#fff",
                          borderRadius: 1,
                        }}
                      ></div>
                      <div
                        style={{
                          width: 45,
                          height: 2,
                          background: "#fff",
                          borderRadius: 1,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Heading */}
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#000",
                    marginBottom: 16,
                    lineHeight: 1.2,
                  }}
                >
                  You don't have any offers yet
                </div>

                {/* Descriptive Text */}
                <div
                  style={{
                    fontSize: 18,
                    color: "#666",
                    marginBottom: 40,
                    lineHeight: 1.5,
                  }}
                >
                  Interview promising talent and make them an offer.
                </div>
              </div>
            )}

            {activeHireTab === "hired" && (
              <div
                style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}
              >
                {/* Overlapping Profile Cards Graphic */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 40,
                    position: "relative",
                    height: 120,
                  }}
                >
                  {/* Left Card (faded) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "25%",
                      transform: "translateX(-50%)",
                      background: "#f8f9fa",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "16px 12px",
                      width: 80,
                      height: 100,
                      opacity: 0.6,
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e9ecef",
                        margin: "0 auto 8px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          background: "#6c757d",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 6,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: i < 3 ? "#ffc107" : "#e9ecef",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 2,
                        marginTop: 4,
                      }}
                    ></div>
                  </div>

                  {/* Center Card (prominent) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#fff",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "20px 16px",
                      width: 90,
                      height: 110,
                      zIndex: 3,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#28a745",
                        margin: "0 auto 10px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          background: "#fff",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 8,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: "#ffc107",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 3,
                        marginTop: 6,
                      }}
                    ></div>
                  </div>

                  {/* Right Card (faded) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "75%",
                      transform: "translateX(-50%)",
                      background: "#f8f9fa",
                      borderRadius: "12px 12px 8px 8px",
                      padding: "16px 12px",
                      width: 80,
                      height: 100,
                      opacity: 0.6,
                      zIndex: 1,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e9ecef",
                        margin: "0 auto 8px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          background: "#6c757d",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        marginBottom: 6,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star, i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: i < 2 ? "#ffc107" : "#e9ecef",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div
                      style={{
                        height: 4,
                        background: "linear-gradient(90deg, #e91e63, #9c27b0)",
                        borderRadius: 2,
                        marginTop: 4,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Heading */}
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#000",
                    marginBottom: 16,
                    lineHeight: 1.2,
                  }}
                >
                  You don't have any hires yet
                </div>

                {/* Descriptive Text */}
                <div
                  style={{
                    fontSize: 18,
                    color: "#666",
                    marginBottom: 40,
                    lineHeight: 1.5,
                  }}
                >
                  Interview promising talent and make them an offer.
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="section-container"
      style={{ background: "#fff", minHeight: "100vh" }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        ${filterAnimations}
      `}</style>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        {/* Job Title at the very top */}
        <div
          style={{
            fontSize: "2.1rem",
            fontWeight: 700,
            marginBottom: 0,
            letterSpacing: "-0.5px",
            marginTop: 40,
            paddingTop: 20,
          }}
        >
          {job.title || "Untitled Job"}
        </div>
        <div
          style={{
            color: "#007476",
            fontWeight: 600,
            fontSize: 18,
            margin: "0 0 24px 0",
          }}
        >
          30 invites left
        </div>
        {/* Meta Row below the title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
            margin: "18px 0 0 0",
            fontSize: 18,
          }}
        >
          <span style={{ color: "#222", fontWeight: 600 }}>Invite-Only</span>
          <span
            style={{
              color: "#888",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <BsCalendar size={16} />{" "}
            <span style={{ fontWeight: 500 }}>Posted</span>{" "}
            {job.createdAt ? timeAgo(job.createdAt) : "1 hour ago"}
          </span>
        </div>
        {/* Step Progress Bar below meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            margin: "28px 0 0 0",
            width: "100%",
          }}
        >
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <div
                onClick={() => handleStepClick(idx)}
                style={{
                  fontWeight: idx === currentStep ? 700 : 500,
                  color: idx === currentStep ? "#fff" : "#222",
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: idx === currentStep ? "#007476" : "transparent",
                  borderRadius:
                    idx === currentStep
                      ? "0px"
                      : idx === steps.length - 1
                      ? "0 8px 8px 0"
                      : 0,
                  padding: idx === currentStep ? "14px 38px" : "14px 38px",
                  border: idx === currentStep ? "none" : "1px solid #e5e7eb",
                  minWidth: "25%",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow:
                    idx === currentStep
                      ? "0 2px 8px rgba(0,116,118,0.07)"
                      : "none",
                  zIndex: 2,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (idx !== currentStep) {
                    e.target.style.background = "#f0f0f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (idx !== currentStep) {
                    e.target.style.background = "transparent";
                  }
                }}
              >
                {step}
                {idx < steps.length - 1 && (
                  <span
                    style={{ margin: "0 12px", color: "#afafaf", fontWeight: 400, scale: 2.0 }}
                  >
                    &#8250;
                  </span>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
        {/* Main Content Row: left (tab content), right (sidebar) */}
        {currentStep === 0 ? (
          <div style={{ display: "flex", marginTop: 40, gap: 40 }}>
            {/* Left Main Content */}
            <div style={{ flex: 1, minWidth: 0, maxWidth: "100%" }}>
              {renderTabContent()}
            </div>
            {/* Sidebar (Right) */}
            <div
              style={{
                minWidth: 340,
                maxWidth: 360,
                background: "#fff",
                borderLeft: "1px solid #ececec",
                padding: "0 0 0 40px",
                display: "flex",
                flexDirection: "column",
                gap: 32,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 0,
                }}
              >
                <SidebarAction icon={<BsPencil />} text="Edit posting" />
                <SidebarAction icon={<BsEye />} text="View posting" />
                <SidebarAction icon={<BsX />} text="Remove posting" />
                <SidebarAction icon={<BsGlobe />} text="Make public" />
              </div>
              {/* About the client section, no border or background */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 22,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  About the client{" "}
                  <MdEdit
                    style={{
                      fontSize: 18,
                      color: "#007476",
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div
                  style={{
                    color: "#222",
                    fontWeight: 400,
                    fontSize: 18,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  Payment method not verified{" "}
                  <BsQuestionCircle
                    style={{
                      fontSize: 15,
                      color: "#bbb",
                      marginLeft: 2,
                      verticalAlign: -2,
                    }}
                  />
                </div>
                <div
                  style={{
                    color: "#007476",
                    fontWeight: 500,
                    fontSize: 18,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <BsCheckCircle style={{ color: "#007476", fontSize: 18 }} />{" "}
                  Phone number verified
                </div>
                <div
                  style={{
                    color: "#121212",
                    fontWeight: 400,
                    fontSize: 18,
                    marginBottom: 0,
                  }}
                >
                  {client.time}
                </div>
                <div
                  style={{ color: "#121212", fontSize: 18, margin: "10px 0" }}
                >
                  {client.hireRate}
                </div>
                <div
                  style={{
                    color: "#222",
                    fontWeight: 600,
                    fontSize: 18,
                    marginBottom: 10,
                  }}
                >
                  {client.industry}
                </div>
                <div
                  style={{ color: "#121212", fontSize: 18, marginBottom: 0 }}
                >
                  {client.company}
                </div>
                <div style={{ color: "#888", fontSize: 18, marginTop: 15 }}>
                  Member since {client.memberSince}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 40 }}>{renderTabContent()}</div>
        )}
      </div>
    </div>
  );
};

function SidebarAction({ icon, text }) {
  return (
    <button style={sidebarBtnStyle}>
      <span
        style={{
          color: "#007476",
          fontSize: 22,
          display: "flex",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        {icon}
      </span>
      <span style={{ color: "#007476", fontWeight: 600, fontSize: 18 }}>
        {text}
      </span>
    </button>
  );
}

const sidebarBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: 0,
  background: "none",
  border: "none",
  color: "#007476",
  fontWeight: 600,
  fontSize: 18,
  padding: "12px 0",
  cursor: "pointer",
  textAlign: "left",
  borderRadius: 6,
  transition: "background 0.2s",
};
const jobDetailColStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 4,
  padding: "24px 32px",
  borderRight: "1px solid #ececec",
  minHeight: 90,
  justifyContent: "center",
};
const jobDetailIconStyle = { fontSize: 26, color: "#007476", marginBottom: 8 };

export default ClientJobDetailedPage;
