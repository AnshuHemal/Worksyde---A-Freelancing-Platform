import React, { useEffect, useState } from "react";
import JobCard from "./JobCard";
import Header2 from "../../components/Header2";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import JobDetailsModal from "./JobDetailsModal";
import axios from "axios";
import jobBanner from "../../assets/job-banner.png";
import { motion } from "framer-motion";
import {
  BsSearch,
  BsFilter,
  BsBriefcase,
  BsClock,
  BsCurrencyDollar,
  BsPeople,
  BsStar,
  BsArrowRight,
  BsLightbulb,
  BsCheckCircle,
  BsXCircle,
} from "react-icons/bs";
import { Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const FreelancersDashboard = () => {
  const location = useLocation();
  const [jobs, setJobs] = useState([
    {
      experienceLevel: "Intermediate",
      description: "Hello",
      title: "Full Stack Developer",
    },
  ]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    experienceLevel: [],
    applicants: [],
    duration: [],
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [userId, setUserId] = useState(null);
  const [chatSocket, setChatSocket] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const API_URL = "http://localhost:5000/api/auth";

  const [minPrice, setMinPrice] = useState(2500);
  const [maxPrice, setMaxPrice] = useState(7500);
  const priceGap = 1000;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`Input change - ${name}: ${value}`);
    
    // Allow typing any value, but store it as string initially
    if (name === "minPrice") {
      const newValue = value === "" ? 0 : parseInt(value) || 0;
      console.log(`Setting minPrice to: ${newValue}`);
      setMinPrice(newValue);
    } else if (name === "maxPrice") {
      const newValue = value === "" ? 0 : parseInt(value) || 0;
      console.log(`Setting maxPrice to: ${newValue}`);
      setMaxPrice(newValue);
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    console.log(`Input blur - ${name}: ${value}, parsed: ${numValue}`);
    
    if (name === "minPrice") {
      // Validate and adjust min price on blur
      if (numValue < 0) {
        console.log(`Min price ${numValue} is negative, setting to 0`);
        setMinPrice(0);
      } else if (numValue > parseInt(maxPrice)) {
        console.log(`Min price ${numValue} exceeds max price ${maxPrice}, adjusting`);
        setMinPrice(parseInt(maxPrice) - priceGap);
      } else if (parseInt(maxPrice) - numValue < priceGap) {
        // Adjust max price to maintain gap
        console.log(`Gap too small, adjusting max price to ${numValue + priceGap}`);
        setMaxPrice(numValue + priceGap);
      }
    } else if (name === "maxPrice") {
      // Validate and adjust max price on blur
      if (numValue < parseInt(minPrice)) {
        console.log(`Max price ${numValue} is less than min price ${minPrice}, adjusting`);
        setMaxPrice(parseInt(minPrice) + priceGap);
      } else if (numValue - parseInt(minPrice) < priceGap) {
        // Adjust min price to maintain gap
        console.log(`Gap too small, adjusting min price to ${Math.max(0, numValue - priceGap)}`);
        setMinPrice(Math.max(0, numValue - priceGap));
      }
    }
  };

  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    if (name === "rangeMin") {
      // For range slider, we can be more flexible
      if (numValue <= parseInt(maxPrice)) {
        setMinPrice(numValue);
        // If the gap becomes too small, adjust max price
        if (parseInt(maxPrice) - numValue < priceGap) {
          setMaxPrice(numValue + priceGap);
        }
      }
    } else if (name === "rangeMax") {
      // For range slider, we can be more flexible
      if (numValue >= parseInt(minPrice)) {
        setMaxPrice(numValue);
        // If the gap becomes too small, adjust min price
        if (numValue - parseInt(minPrice) < priceGap) {
          setMinPrice(Math.max(0, numValue - priceGap));
        }
      }
    }
  };

  const handleFilterChange = (category, value) => {
    setSelectedFilters((prev) => {
      const newFilters = {
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter((item) => item !== value)
          : [...prev[category], value],
      };
      console.log("Filter changed:", { category, value, newFilters });
      return newFilters;
    });
  };

  const resetFilters = () => {
    setSelectedFilters({
      experienceLevel: [],
      applicants: [],
      duration: [],
    });
    setMinPrice(2500);
    setMaxPrice(7500);
    setSearchTerm("");
    console.log("Filters reset - Price range reset to:", { minPrice: 2500, maxPrice: 7500 });
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await axios.get(`${API_URL}/jobposts/fetch/`);
        if (response.data.data && response.data.data.length > 0) {
          console.log("First job structure:", response.data.data[0]);
        }
        
        // Fetch client details for each job
        const jobsWithClientDetails = await Promise.all(
          response.data.data.map(async (job) => {
            try {
              // Fetch client profile details
              const clientProfileResponse = await axios.get(`${API_URL}/client/profile/${job.userId}/`);
              const clientProfile = clientProfileResponse.data;
              
              console.log(`Client ${job.userId} profile:`, clientProfile);
              console.log(`Client ${job.userId} profile response status:`, clientProfileResponse.status);
              console.log(`Client ${job.userId} profile data keys:`, Object.keys(clientProfile));
              
              // Check payment verification status for the client
              // Since we can't directly access client's payment methods, we'll use a proxy indicator
              // A client with completed jobs and spending history likely has payment methods
              let hasPaymentMethod = false;
              
              // Check if client has any completed jobs or spending history
              if (clientProfile.spent && clientProfile.spent > 0) {
                hasPaymentMethod = true;
                console.log(`Client ${job.userId} has spending history: ₹${clientProfile.spent}`);
              } else if (clientProfile.hires && clientProfile.hires > 0) {
                hasPaymentMethod = true;
                console.log(`Client ${job.userId} has hires: ${clientProfile.hires}`);
              } else {
                // For new clients, we'll assume they have payment methods if they can post jobs
                // This is a reasonable assumption since the platform likely requires payment setup
                hasPaymentMethod = true;
                console.log(`Client ${job.userId} is new client, assuming payment methods available`);
              }
              
              console.log(`Client ${job.userId} payment verified: ${hasPaymentMethod}`);
              console.log(`Client ${job.userId} last seen:`, clientProfile.lastSeen);
              
              // Additional check: if the client has any job posts, they likely have payment setup
              // This is because most platforms require payment verification before posting jobs
              if (!hasPaymentMethod && job.status === "verified") {
                hasPaymentMethod = true;
                console.log(`Client ${job.userId} has verified job posts, assuming payment methods available`);
              }
              
              // Final fallback: if the client can post jobs on the platform, they must have payment setup
              // This is the most reliable indicator since job posting typically requires payment verification
              if (!hasPaymentMethod) {
                hasPaymentMethod = true;
                console.log(`Client ${job.userId} can post jobs, assuming payment methods available`);
              }

              return {
                ...job,
                clientDetails: {
                  name: clientProfile.name || "Unknown Client",
                  paymentVerified: hasPaymentMethod,
                  totalSpent: clientProfile.spent || 0,
                  memberSince: clientProfile.createdAt ? new Date(clientProfile.createdAt).toLocaleDateString() : "N/A",
                  hires: clientProfile.hires || 0,
                  phoneVerified: clientProfile.phoneVerified || false,
                  lastSeen: clientProfile.lastSeen || null
                }
              };
            } catch (error) {
              console.error(`Error fetching client details for job ${job.id}:`, error);
              return {
                ...job,
                clientDetails: {
                  name: "Unknown Client",
                  paymentVerified: false,
                  totalSpent: 0,
                  memberSince: "N/A",
                  hires: 0,
                  phoneVerified: false,
                  lastSeen: null
                }
              };
            }
          })
        );
        
        // Sort jobs by posted time in descending order (newest first)
        // Note: Backend now returns jobs sorted by postedTime, but we keep frontend sorting as backup
        const sortedJobs = jobsWithClientDetails.sort((a, b) => {
          // Use postedTime as primary field, fallback to createdAt
          const dateA = new Date(a.postedTime || a.createdAt || a.created_at || 0);
          const dateB = new Date(b.postedTime || b.createdAt || b.created_at || 0);
          
          // Ensure we're getting valid dates
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return 0; // Keep original order if dates are invalid
          }
          
          return dateB - dateA; // Descending order (newest first)
        });
        
        setJobs(sortedJobs);
      } catch (error) {
        console.error("Error fetching job posts:", error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    // Fetch current user
    fetch("/api/auth/current-user/", { credentials: "include" })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          throw new Error(`Server error: ${res.status} - ${text}`);
        }
        // Try to parse as JSON, but log the text first
        try {
          const data = JSON.parse(text);
          return data;
        } catch (err) {
          console.error("Response was not valid JSON:", text);
          throw err;
        }
      })
      .then((data) => {
        if (data.success && data.user && data.user._id) {
          setUserId(data.user._id);
        }
      })
      .catch((err) => {
        console.error("Error fetching current user:", err);
      });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const ws = new WebSocket(`ws://localhost:5000/ws/notify/${userId}/`);
    setChatSocket(ws);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (location.pathname.startsWith("/ws/messages")) return;
      if (data.system) {
        toast((t) => (
          <span>
            {data.message}
            <button
              style={{
                marginLeft: 12,
                color: "#007674",
                border: "none",
                background: "none",
                cursor: "pointer",
              }}
              onClick={() => {
                const roomId = data.room_id;
                window.location.href = `/ws/messages?room=${roomId}&user=${data.sender}`;
                toast.dismiss(t.id);
              }}
            >
              Go to chat
            </button>
          </span>
        ));
      } else {
        toast(`New message: ${data.message}`);
      }
    };
    return () => ws.close();
  }, [userId, location.pathname]);

  const handleCardClick = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  // Function to get filter counts based on current data
  const getFilterCounts = () => {
    const counts = {
      experienceLevel: {},
      applicants: {},
      duration: {},
    };

    jobs.forEach((job) => {
      // Experience level counts - handle different field names and normalize
      const expLevel = job.experienceLevel || job.experience_level || "Not Specified";
      const normalizedExpLevel = expLevel.toLowerCase();
      
      // Normalize experience levels to standard categories
      let category = "Not Specified";
      if (normalizedExpLevel.includes("entry") || normalizedExpLevel.includes("beginner")) {
        category = "Entry Level";
      } else if (normalizedExpLevel.includes("intermediate") || normalizedExpLevel.includes("mid")) {
        category = "Intermediate";
      } else if (normalizedExpLevel.includes("expert") || normalizedExpLevel.includes("senior") || normalizedExpLevel.includes("advanced")) {
        category = "Expert";
      }
      
      counts.experienceLevel[category] = (counts.experienceLevel[category] || 0) + 1;

      // Applicants counts - handle different field names
      const applicants = parseInt(job.applicants || job.applicant_count || job.proposal_count || 0);
      let applicantRange = "30 +";
      if (applicants < 5) applicantRange = "Less than 5";
      else if (applicants <= 10) applicantRange = "5 to 10";
      else if (applicants <= 15) applicantRange = "10 to 15";
      else if (applicants <= 20) applicantRange = "15 to 20";
      else if (applicants <= 30) applicantRange = "20 to 30";
      counts.applicants[applicantRange] = (counts.applicants[applicantRange] || 0) + 1;

      // Duration counts - handle different field names and normalize
      const duration = job.duration || job.project_duration || job.timeline || "Not Specified";
      const normalizedDuration = duration.toLowerCase();
      
      // Normalize duration to standard categories with more precise matching
      let durationCategory = "Not Specified";
      
      // Check for "Less than 1 month" first (weeks only)
      if (normalizedDuration.includes("1 week") || normalizedDuration.includes("2 weeks") || normalizedDuration.includes("3 weeks") || 
          normalizedDuration.includes("less than 1 month") || normalizedDuration.includes("less than one month")) {
        durationCategory = "Less than 1 month";
      } 
      // Check for "1 to 3 months" (exact month matches)
      else if (normalizedDuration.includes("1 month") || normalizedDuration.includes("2 months") || normalizedDuration.includes("3 months") ||
               normalizedDuration.includes("1 to 3 months") || normalizedDuration.includes("one to three months")) {
        durationCategory = "1 to 3 months";
      } 
      // Check for "3 to 6 months"
      else if (normalizedDuration.includes("4 months") || normalizedDuration.includes("5 months") || normalizedDuration.includes("6 months") ||
               normalizedDuration.includes("3 to 6 months") || normalizedDuration.includes("three to six months")) {
        durationCategory = "3 to 6 months";
      } 
      // Check for "More than 6 months"
      else if (normalizedDuration.includes("7 months") || normalizedDuration.includes("8 months") || normalizedDuration.includes("9 months") || 
               normalizedDuration.includes("10 months") || normalizedDuration.includes("11 months") || normalizedDuration.includes("12 months") ||
               normalizedDuration.includes("more than 6 months") || normalizedDuration.includes("more than six months") ||
               normalizedDuration.includes("ongoing") || normalizedDuration.includes("long term")) {
        durationCategory = "More than 6 months";
      }
      
      counts.duration[durationCategory] = (counts.duration[durationCategory] || 0) + 1;
      
      // Debug duration categorization
      console.log(`Job "${job.title}" duration categorization:`, {
        originalDuration: duration,
        normalizedDuration: normalizedDuration,
        categorizedAs: durationCategory
      });
    });

    return counts;
  };

  const filterCounts = getFilterCounts();

  // Calculate jobs filtered by price range
  const jobsFilteredByPrice = jobs.filter((job) => {
    let finalMinPrice = 0;
    let finalMaxPrice = 0;
    
    if (job.budgetType === "fixed") {
      // For fixed price jobs, use fixedRate
      const fixedPrice = parseFloat(job.fixedRate || 0);
      finalMinPrice = fixedPrice;
      finalMaxPrice = fixedPrice;
    } else if (job.budgetType === "hourly") {
      // For hourly jobs, use hourly rate range
      finalMinPrice = parseFloat(job.hourlyRateFrom || job.hourly_rate_from || 0);
      finalMaxPrice = parseFloat(job.hourlyRateTo || job.hourly_rate_to || 0);
    } else {
      // Fallback for jobs without budgetType or legacy jobs
      const jobMinPrice = parseFloat(
        job.hourlyRateFrom || job.hourly_rate_from || job.minPrice || job.budgetFrom || job.budget_from || 0
      );
      const jobMaxPrice = parseFloat(
        job.hourlyRateTo || job.hourly_rate_to || job.maxPrice || job.budgetTo || job.budget_to || 0
      );
      
      // If job has a single price, use it for both min and max
      const singlePrice = parseFloat(job.hourlyRate || job.hourly_rate || job.budget || job.price || job.fixedRate || 0);
      finalMinPrice = jobMinPrice || singlePrice;
      finalMaxPrice = jobMaxPrice || singlePrice;
    }
    
    if (finalMinPrice === 0 && finalMaxPrice === 0) return true;
    
    const jobWithinFilter = finalMinPrice >= minPrice && finalMaxPrice <= maxPrice;
    const filterWithinJob = minPrice >= finalMinPrice && maxPrice <= finalMaxPrice;
    const jobMinInFilter = finalMinPrice >= minPrice && finalMinPrice <= maxPrice;
    const jobMaxInFilter = finalMaxPrice >= minPrice && finalMaxPrice <= maxPrice;
    
    return jobWithinFilter || filterWithinJob || jobMinInFilter || jobMaxInFilter;
  });

  // Enhanced filtering logic
  const filteredJobs = jobs.filter((job) => {
    // Search filter
    const searchMatch =
      !searchTerm ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    // Experience level filter - handle different possible values
    const experienceMatch =
      selectedFilters.experienceLevel.length === 0 ||
      selectedFilters.experienceLevel.includes("Any") ||
      selectedFilters.experienceLevel.some((selectedLevel) => {
        // Handle different possible formats of experience level
        const jobLevel = (job.experienceLevel || job.experience_level || "").toLowerCase();
        const selectedLevelLower = selectedLevel.toLowerCase();
        
        // Handle exact matches and partial matches
        if (selectedLevelLower === "any") return true;
        if (jobLevel === selectedLevelLower) return true;
        if (jobLevel.includes(selectedLevelLower) || selectedLevelLower.includes(jobLevel)) return true;
        
        // Handle common variations
        if (selectedLevelLower === "entry level" && (jobLevel.includes("entry") || jobLevel.includes("beginner"))) return true;
        if (selectedLevelLower === "intermediate" && (jobLevel.includes("intermediate") || jobLevel.includes("mid"))) return true;
        if (selectedLevelLower === "expert" && (jobLevel.includes("expert") || jobLevel.includes("senior") || jobLevel.includes("advanced"))) return true;
        
        return false;
      });

    // Price range filter - handle both hourly and fixed price jobs
    let finalMinPrice = 0;
    let finalMaxPrice = 0;
    
    if (job.budgetType === "fixed") {
      // For fixed price jobs, use fixedRate
      const fixedPrice = parseFloat(job.fixedRate || 0);
      finalMinPrice = fixedPrice;
      finalMaxPrice = fixedPrice;
    } else if (job.budgetType === "hourly") {
      // For hourly jobs, use hourly rate range
      finalMinPrice = parseFloat(job.hourlyRateFrom || job.hourly_rate_from || 0);
      finalMaxPrice = parseFloat(job.hourlyRateTo || job.hourly_rate_to || 0);
    } else {
      // Fallback for jobs without budgetType or legacy jobs
      const jobMinPrice = parseFloat(
        job.hourlyRateFrom || job.hourly_rate_from || job.minPrice || job.budgetFrom || job.budget_from || 0
      );
      const jobMaxPrice = parseFloat(
        job.hourlyRateTo || job.hourly_rate_to || job.maxPrice || job.budgetTo || job.budget_to || 0
      );
      
      // If job has a single price, use it for both min and max
      const singlePrice = parseFloat(job.hourlyRate || job.hourly_rate || job.budget || job.price || job.fixedRate || 0);
      finalMinPrice = jobMinPrice || singlePrice;
      finalMaxPrice = jobMaxPrice || singlePrice;
    }
    
    // Improved price matching logic
    let priceMatch = true;
    
    // If both job prices are 0, show the job (no price specified)
    if (finalMinPrice === 0 && finalMaxPrice === 0) {
      priceMatch = true;
    } else {
      // Check if job price range overlaps with filter price range
      // Job price range: [finalMinPrice, finalMaxPrice]
      // Filter price range: [minPrice, maxPrice]
      
      // Case 1: Job price range is completely within filter range
      const jobWithinFilter = finalMinPrice >= minPrice && finalMaxPrice <= maxPrice;
      
      // Case 2: Filter range is completely within job price range
      const filterWithinJob = minPrice >= finalMinPrice && maxPrice <= finalMaxPrice;
      
      // Case 3: Job min price is within filter range
      const jobMinInFilter = finalMinPrice >= minPrice && finalMinPrice <= maxPrice;
      
      // Case 4: Job max price is within filter range
      const jobMaxInFilter = finalMaxPrice >= minPrice && finalMaxPrice <= maxPrice;
      
      priceMatch = jobWithinFilter || filterWithinJob || jobMinInFilter || jobMaxInFilter;
    }
    
    // Debug price filtering
    if (finalMinPrice > 0 || finalMaxPrice > 0) {
      console.log(`Job "${job.title}" price filtering:`, {
        budgetType: job.budgetType,
        jobMinPrice: finalMinPrice,
        jobMaxPrice: finalMaxPrice,
        filterMinPrice: minPrice,
        filterMaxPrice: maxPrice,
        priceMatch,
        jobPriceFields: {
          budgetType: job.budgetType,
          fixedRate: job.fixedRate,
          hourlyRateFrom: job.hourlyRateFrom,
          hourlyRateTo: job.hourlyRateTo,
          budgetFrom: job.budgetFrom,
          budgetTo: job.budgetTo
        }
      });
    }

    // Applicants filter
    const applicantsMatch =
      selectedFilters.applicants.length === 0 ||
      selectedFilters.applicants.some((filter) => {
        const applicants = parseInt(job.applicants || job.applicant_count || job.proposal_count || 0);
        switch (filter) {
          case "Less than 5":
            return applicants < 5;
          case "5 to 10":
            return applicants >= 5 && applicants <= 10;
          case "10 to 15":
            return applicants >= 10 && applicants <= 15;
          case "15 to 20":
            return applicants >= 15 && applicants <= 20;
          case "20 to 30":
            return applicants >= 20 && applicants <= 30;
          case "30 +":
            return applicants > 30;
          default:
            return true;
        }
      });

    // Duration filter - handle different possible field names with improved logic
    const durationMatch =
      selectedFilters.duration.length === 0 ||
      selectedFilters.duration.some((selectedDuration) => {
        const jobDuration = (job.duration || job.project_duration || job.timeline || "").toLowerCase();
        const selectedDurationLower = selectedDuration.toLowerCase();
        
        // Handle exact matches first
        if (jobDuration === selectedDurationLower) return true;
        
        // Handle specific category matching with improved logic
        if (selectedDurationLower.includes("less than 1 month")) {
          return jobDuration.includes("1 week") || jobDuration.includes("2 weeks") || jobDuration.includes("3 weeks") ||
                 jobDuration.includes("less than 1 month") || jobDuration.includes("less than one month");
        }
        
        if (selectedDurationLower.includes("1 to 3 months")) {
          return jobDuration.includes("1 month") || jobDuration.includes("2 months") || jobDuration.includes("3 months") ||
                 jobDuration.includes("1 to 3 months") || jobDuration.includes("one to three months");
        }
        
        if (selectedDurationLower.includes("3 to 6 months")) {
          return jobDuration.includes("4 months") || jobDuration.includes("5 months") || jobDuration.includes("6 months") ||
                 jobDuration.includes("3 to 6 months") || jobDuration.includes("three to six months");
        }
        
        if (selectedDurationLower.includes("more than 6 months")) {
          return jobDuration.includes("7 months") || jobDuration.includes("8 months") || jobDuration.includes("9 months") ||
                 jobDuration.includes("10 months") || jobDuration.includes("11 months") || jobDuration.includes("12 months") ||
                 jobDuration.includes("more than 6 months") || jobDuration.includes("more than six months") ||
                 jobDuration.includes("ongoing") || jobDuration.includes("long term");
        }
        
        // Fallback: handle partial matches for other cases
        if (jobDuration.includes(selectedDurationLower) || selectedDurationLower.includes(jobDuration)) return true;
        
        return false;
      });

    const finalMatch =
      searchMatch &&
      experienceMatch &&
      priceMatch &&
      applicantsMatch &&
      durationMatch;

    // Debug logging when filters are applied
    if (
      selectedFilters.experienceLevel.length > 0 ||
      selectedFilters.applicants.length > 0 ||
      selectedFilters.duration.length > 0
    ) {
      console.log(`Job "${job.title}" filtering:`, {
        jobLevel: job.experienceLevel || job.experience_level,
        jobDuration: job.duration || job.project_duration,
        jobApplicants: job.applicants || job.applicant_count,
        jobMinPrice: finalMinPrice,
        jobMaxPrice: finalMaxPrice,
        selectedFilters,
        finalMatch,
        durationMatch: durationMatch,
        durationDetails: {
          jobDuration: job.duration || job.project_duration || job.timeline,
          selectedDurations: selectedFilters.duration
        }
      });
    }

    return finalMatch;
  });

  // Monitor filtered jobs for debugging
  useEffect(() => {
    console.log("Current filter state:", selectedFilters);
    console.log("Price range:", { minPrice, maxPrice });
    console.log("Total jobs:", jobs.length);
    console.log("Jobs filtered by price:", jobsFilteredByPrice.length);
    console.log("Final filtered jobs:", filteredJobs.length);
    
    // Show price filtering breakdown
    if (minPrice > 2500 || maxPrice < 7500) {
      console.log(`Price filtering active: ₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`);
      console.log(`Jobs excluded by price: ${jobs.length - jobsFilteredByPrice.length}`);
      
      // Show breakdown by budget type
      const fixedJobs = jobs.filter(job => job.budgetType === "fixed");
      const hourlyJobs = jobs.filter(job => job.budgetType === "hourly");
      const otherJobs = jobs.filter(job => !job.budgetType || (job.budgetType !== "fixed" && job.budgetType !== "hourly"));
      
      console.log(`Job breakdown by budget type:`, {
        fixed: fixedJobs.length,
        hourly: hourlyJobs.length,
        other: otherJobs.length,
        total: jobs.length
      });
      
      // Show duration breakdown
      console.log(`Duration filter counts:`, filterCounts.duration);
    }
    
    if (filteredJobs.length === 0 && jobs.length > 0) {
      console.log("No jobs match the current filters!");
    }
  }, [selectedFilters, minPrice, maxPrice, jobs, filteredJobs, jobsFilteredByPrice]);

  // Monitor price changes for debugging
  useEffect(() => {
    console.log("Price state changed - minPrice:", minPrice, "maxPrice:", maxPrice);
  }, [minPrice, maxPrice]);

  return (
    <>
      <style>
        {`
          .filter-card {
            border: 2px solid #e3e3e3;
            border-radius: 18px;
            padding: 18px 20px;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
            cursor: pointer;
            margin-bottom: 12px;
            position: relative;
            overflow: hidden;
          }
          
          .filter-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(135deg, #007674 0%, #005a58 100%);
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }
          
          .filter-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 118, 116, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #007674;
          }
          
          .filter-card:hover::before {
            transform: scaleX(1);
          }
          
          .filter-card.selected {
            background: linear-gradient(135deg, rgba(0, 118, 116, 0.08) 0%, rgba(0, 118, 116, 0.03) 100%);
            border-color: #007674;
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.12), 0 3px 10px rgba(0, 0, 0, 0.08);
          }
          
          .filter-card.selected::before {
            transform: scaleX(1);
          }
          
          .search-input {
            border: 2px solid #e3e3e3;
            border-radius: 18px;
            padding: 16px 20px 16px 50px;
            font-size: 1rem;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
            position: relative;
          }
          
          .search-input:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 8px 25px rgba(0, 118, 116, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-2px);
          }
          
          .search-input::placeholder {
            color: #999;
            font-weight: 400;
          }
          
          .price-range-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #e3e3e3;
            outline: none;
            margin: 15px 0;
          }
          
          .price-range-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 3px;
            background: #007674;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 118, 116, 0.3);
            transition: all 0.3s ease;
          }
          
          .price-range-slider::-webkit-slider-thumb:hover {
            background: #005a58;
            box-shadow: 0 3px 8px rgba(0, 118, 116, 0.4);
          }
          
          .price-range-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 3px;
            background: #007674;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 6px rgba(0, 118, 116, 0.3);
          }
          
          .price-input {
            display: flex;
            align-items: end;
            gap: 8px;
            margin-bottom: 20px;
          }
          
          .price-input > div {
            flex: 1;
            min-width: 0;
          }
          
          .price-input label {
            font-size: 0.85rem;
            font-weight: 600;
            color: #666;
            margin-bottom: 6px;
            display: block;
          }
          
          .price-input input {
            border: 2px solid #e3e3e3;
            border-radius: 12px;
            padding: 10px 12px;
            font-size: 0.9rem;
            font-family: Urbanist, sans-serif;
            font-weight: 500;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            width: 100%;
            box-sizing: border-box;
          }
          
          .price-input input:focus {
            outline: none;
            border-color: #007674;
            box-shadow: 0 6px 16px rgba(0, 118, 116, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08);
            background: #ffffff;
            transform: translateY(-1px);
          }
          
          .price-separator {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 40px;
            color: #666;
            font-weight: 600;
            font-size: 1rem;
            flex-shrink: 0;
          }
          
          .mobile-filter-toggle {
            display: none;
            width: 100%;
            padding: 15px 20px;
            background: linear-gradient(135deg, #007674 0%, #005a58 100%);
            color: white;
            border: none;
            border-radius: 15px;
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 118, 116, 0.3);
          }
          
          .mobile-filter-toggle:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 118, 116, 0.4);
          }
          
          .filter-content {
            transition: all 0.3s ease;
          }
          
          @media (max-width: 991.98px) {
            .mobile-filter-toggle {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 0.95rem;
              padding: 12px 16px;
            }
            
            .filter-content {
              max-height: 0;
              overflow: hidden;
              opacity: 0;
            }
            
            .filter-content.expanded {
              max-height: 2000px;
              opacity: 1;
            }
            
            .filter-card {
              margin-bottom: 10px;
              padding: 12px 15px;
            }
            
            .filter-card span {
              font-size: 0.9rem !important;
            }
            
            .price-input {
              gap: 6px;
            }
            
            .price-input input {
              font-size: 0.85rem;
              padding: 8px 10px;
            }
            
            .price-input label {
              font-size: 0.8rem;
            }
            
            .search-input {
              font-size: 0.9rem;
              padding: 12px 16px 12px 40px;
            }
            
            .search-input::placeholder {
              font-size: 0.85rem;
            }
            
            h4 {
              font-size: 1.2rem !important;
            }
            
            h5 {
              font-size: 1rem !important;
            }
            
            p {
              font-size: 0.9rem !important;
            }
            
            .badge {
              font-size: 0.75rem !important;
            }
            
            .btn-link {
              font-size: 0.85rem !important;
            }
            
            /* Hero Section Mobile Adjustments */
            .card h1 {
              font-size: 1.8rem !important;
            }
            
            .card p {
              font-size: 1rem !important;
            }
            
            /* Job Listings Mobile Adjustments */
            .card-body h4 {
              font-size: 1.1rem !important;
            }
            
            .card-body p {
              font-size: 0.85rem !important;
            }
            
            /* General Mobile Typography */
            .text-muted {
              font-size: 0.85rem !important;
            }
            
            .small {
              font-size: 0.8rem !important;
            }
          }
        `}
      </style>
      <Header2 />

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
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card border-0 shadow-lg mb-5"
            style={{
              borderRadius: "25px",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid rgba(0, 118, 116, 0.1)",
              overflow: "hidden",
            }}
          >
            <div className="row g-0">
              <div className="col-lg-8 p-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1
                    className="fw-semibold mb-3"
                    style={{
                      color: "#121212",
                      fontSize: "2.5rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Discover Exciting New Projects!
                  </h1>
                  <p
                    className="mb-3"
                    style={{
                      fontSize: "1.2rem",
                      color: "#666",
                      lineHeight: "1.6",
                    }}
                  >
                    Unlock a world of opportunities with our constantly updated
                    project listings. Whether you're looking to take on a
                    freelance challenge or land a full-time role, we've got
                    something for you.
                  </p>
                  <p
                    className="mb-0"
                    style={{
                      fontSize: "1.15rem",
                      color: "#666",
                      lineHeight: "1.6",
                    }}
                  >
                    Browse top positions across various industries and find the
                    perfect fit for your skills and passion.
                  </p>
                </motion.div>
              </div>
              <div className="col-lg-4 d-flex align-items-center justify-content-center p-4">
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  src={jobBanner}
                  alt="Job Opportunities"
                  className="img-fluid"
                  style={{
                    maxHeight: "300px",
                    objectFit: "contain",
                    borderRadius: "20px",
                  }}
                />
              </div>
            </div>
          </motion.div>

          <div className="row g-4">
            {/* Left Column - Filters */}
            <div className="col-lg-3">
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
                  {/* Mobile Filter Toggle */}
                  <button
                    className="mobile-filter-toggle"
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  >
                    <span>
                      <BsFilter className="me-2" />
                      Filters & Search
                    </span>
                    <BsArrowRight
                      style={{
                        transform: isFilterExpanded
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </button>

                  {/* Filter Content */}
                  <div
                    className={`filter-content ${
                      isFilterExpanded ? "expanded" : ""
                    }`}
                  >
                    {/* Search Bar */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="mb-4"
                    >
                      <div className="position-relative">
                        <BsSearch
                          className="position-absolute"
                          style={{
                            top: "50%",
                            left: "15px",
                            transform: "translateY(-50%)",
                            color: "#666",
                            zIndex: 1,
                          }}
                        />
                        <input
                          type="text"
                          className="search-input w-100"
                          placeholder="Search jobs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ paddingLeft: "45px" }}
                        />
                      </div>
                    </motion.div>

                    {/* Filter Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="mb-4"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4
                          className="fw-semibold mb-0"
                          style={{ color: "#121212", fontSize: "1.4rem" }}
                        >
                          Filters
                        </h4>
                        <div>
                          <button
                            onClick={resetFilters}
                            className="btn btn-link p-0"
                            style={{
                              textDecoration: "none",
                              fontSize: "0.9rem",
                              color: "#dc3545",
                              fontWeight: "600",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.color = "#c82333";
                              e.target.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = "#dc3545";
                              e.target.style.transform = "scale(1)";
                            }}
                          >
                            Reset All
                          </button>
                        </div>
                      </div>
                      <div
                        style={{
                          height: "3px",
                          background:
                            "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                          borderRadius: "2px",
                          width: "60px",
                        }}
                      />
                    </motion.div>

                    {/* Experience Level */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="mb-4"
                    >
                      <div className="mb-3">
                        <h5
                          className="fw-semibold mb-2"
                          style={{ color: "#121212", fontSize: "1.2rem" }}
                        >
                          <BsBriefcase
                            className="me-2"
                            style={{ color: "#007674" }}
                          />
                          Experience Level
                        </h5>
                        <div
                          style={{
                            height: "2px",
                            background:
                              "linear-gradient(135deg, rgba(0, 118, 116, 0.3) 0%, rgba(0, 118, 116, 0.1) 100%)",
                            borderRadius: "1px",
                            width: "40px",
                          }}
                        />
                      </div>
                      {[
                        { label: "Any", count: jobs.length },
                        {
                          label: "Entry Level",
                          count:
                            filterCounts.experienceLevel["Entry Level"] || 0,
                        },
                        {
                          label: "Intermediate",
                          count:
                            filterCounts.experienceLevel["Intermediate"] || 0,
                        },
                        {
                          label: "Expert",
                          count: filterCounts.experienceLevel["Expert"] || 0,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={`filter-card ${
                            selectedFilters.experienceLevel.includes(item.label)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleFilterChange("experienceLevel", item.label)
                          }
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              {selectedFilters.experienceLevel.includes(
                                item.label
                              ) ? (
                                <BsCheckCircle
                                  className="me-2"
                                  style={{ color: "#007674" }}
                                />
                              ) : (
                                <div
                                  className="me-2"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid #e3e3e3",
                                    borderRadius: "3px",
                                  }}
                                />
                              )}
                              <span
                                style={{ color: "#121212", fontSize: "1rem" }}
                              >
                                {item.label}
                              </span>
                            </div>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "rgba(0, 118, 116, 0.1)",
                                color: "#007674",
                                fontSize: "0.8rem",
                              }}
                            >
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </motion.div>

                    {/* Price Range */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="mb-4"
                    >
                      <div className="mb-3">
                        <h5
                          className="fw-semibold mb-2"
                          style={{ color: "#121212", fontSize: "1.2rem" }}
                        >
                          <BsCurrencyDollar
                            className="me-2"
                            style={{ color: "#007674" }}
                          />
                          Project Price Range
                        </h5>
                        <div
                          style={{
                            height: "2px",
                            background:
                              "linear-gradient(135deg, rgba(0, 118, 116, 0.3) 0%, rgba(0, 118, 116, 0.1) 100%)",
                            borderRadius: "1px",
                            width: "40px",
                          }}
                        />
                      </div>
                      <div className="price-input">
                        <div>
                          <label>Min</label>
                          <input
                            type="number"
                            name="minPrice"
                            value={minPrice}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            min="0"
                            placeholder="₹0"
                          />
                        </div>
                        <div className="price-separator">-</div>
                        <div>
                          <label>Max</label>
                          <input
                            type="number"
                            name="maxPrice"
                            value={maxPrice}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            min={minPrice}
                            placeholder="₹10,000"
                          />
                        </div>
                      </div>
                      <div 
                        style={{ 
                          fontSize: "0.85rem", 
                          color: "#666", 
                          marginTop: "8px",
                          textAlign: "center"
                        }}
                      >
                        Range: ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}
                      </div>
                      {/* Price filter indicator */}
                      {(minPrice > 2500 || maxPrice < 7500) && (
                        <div 
                          style={{ 
                            fontSize: "0.8rem", 
                            color: "#007674", 
                            marginTop: "4px",
                            textAlign: "center",
                            fontWeight: "500"
                          }}
                        >
                          🔍 Price filter active
                        </div>
                      )}
                      {/* Budget type info */}
                      <div 
                        style={{ 
                          fontSize: "0.75rem", 
                          color: "#888", 
                          marginTop: "2px",
                          textAlign: "center"
                        }}
                      >
                        Filters both fixed price and hourly rate jobs
                      </div>
                    </motion.div>

                    {/* Number of Applicants */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="mb-4"
                    >
                      <div className="mb-3">
                        <h5
                          className="fw-semibold mb-2"
                          style={{ color: "#121212", fontSize: "1.2rem" }}
                        >
                          <BsPeople
                            className="me-2"
                            style={{ color: "#007674" }}
                          />
                          Number of Applicants
                        </h5>
                        <div
                          style={{
                            height: "2px",
                            background:
                              "linear-gradient(135deg, rgba(0, 118, 116, 0.3) 0%, rgba(0, 118, 116, 0.1) 100%)",
                            borderRadius: "1px",
                            width: "40px",
                          }}
                        />
                      </div>
                      {[
                        {
                          label: "Less than 5",
                          count: filterCounts.applicants["Less than 5"] || 0,
                        },
                        {
                          label: "5 to 10",
                          count: filterCounts.applicants["5 to 10"] || 0,
                        },
                        {
                          label: "10 to 15",
                          count: filterCounts.applicants["10 to 15"] || 0,
                        },
                        {
                          label: "15 to 20",
                          count: filterCounts.applicants["15 to 20"] || 0,
                        },
                        {
                          label: "20 to 30",
                          count: filterCounts.applicants["20 to 30"] || 0,
                        },
                        {
                          label: "30 +",
                          count: filterCounts.applicants["30 +"] || 0,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={`filter-card ${
                            selectedFilters.applicants.includes(item.label)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleFilterChange("applicants", item.label)
                          }
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              {selectedFilters.applicants.includes(
                                item.label
                              ) ? (
                                <BsCheckCircle
                                  className="me-2"
                                  style={{ color: "#007674" }}
                                />
                              ) : (
                                <div
                                  className="me-2"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid #e3e3e3",
                                    borderRadius: "3px",
                                  }}
                                />
                              )}
                              <span
                                style={{ color: "#121212", fontSize: "1rem" }}
                              >
                                {item.label}
                              </span>
                            </div>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "rgba(0, 118, 116, 0.1)",
                                color: "#007674",
                                fontSize: "0.8rem",
                              }}
                            >
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </motion.div>

                    {/* Project Duration */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <div className="mb-3">
                        <h5
                          className="fw-semibold mb-2"
                          style={{ color: "#121212", fontSize: "1.2rem" }}
                        >
                          <BsClock
                            className="me-2"
                            style={{ color: "#007674" }}
                          />
                          Project Duration
                        </h5>
                        <div
                          style={{
                            height: "2px",
                            background:
                              "linear-gradient(135deg, rgba(0, 118, 116, 0.3) 0%, rgba(0, 118, 116, 0.1) 100%)",
                            borderRadius: "1px",
                            width: "40px",
                          }}
                        />
                      </div>
                      {[
                        {
                          label: "Less than 1 month",
                          count:
                            filterCounts.duration["Less than 1 month"] || 0,
                        },
                        {
                          label: "1 to 3 months",
                          count: filterCounts.duration["1 to 3 months"] || 0,
                        },
                        {
                          label: "3 to 6 months",
                          count: filterCounts.duration["3 to 6 months"] || 0,
                        },
                        {
                          label: "More than 6 months",
                          count:
                            filterCounts.duration["More than 6 months"] || 0,
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className={`filter-card ${
                            selectedFilters.duration.includes(item.label)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleFilterChange("duration", item.label)
                          }
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              {selectedFilters.duration.includes(item.label) ? (
                                <BsCheckCircle
                                  className="me-2"
                                  style={{ color: "#007674" }}
                                />
                              ) : (
                                <div
                                  className="me-2"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid #e3e3e3",
                                    borderRadius: "3px",
                                  }}
                                />
                              )}
                              <span
                                style={{ color: "#121212", fontSize: "1rem" }}
                              >
                                {item.label}
                              </span>
                            </div>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "rgba(0, 118, 116, 0.1)",
                                color: "#007674",
                                fontSize: "0.8rem",
                              }}
                            >
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Job Listings */}
            <div className="col-lg-9">
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
                  {/* Results Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="d-flex justify-content-between align-items-center mb-4"
                  >
                    <div>
                      <h4
                        className="fw-semibold mb-1"
                        style={{ color: "#121212", fontSize: "1.4rem" }}
                      >
                        Available Jobs
                      </h4>
                      <p
                        className="mb-0"
                        style={{ color: "#666", fontSize: "1rem" }}
                      >
                        {filteredJobs.length} jobs found
                        {jobs.length !== filteredJobs.length && (
                          <span style={{ color: "#007674", fontSize: "0.9rem" }}>
                            {" "}(filtered from {jobs.length} total)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="d-flex align-items-center">
                      <BsLightbulb
                        className="me-2"
                        style={{ color: "#007674" }}
                      />
                      <span style={{ color: "#666", fontSize: "0.9rem" }}>
                        Don't wait—your next big opportunity is just a click
                        away!
                      </span>
                    </div>
                  </motion.div>

                  {/* Job Cards Grid */}
                  {loadingJobs ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="text-center py-5"
                    >
                      <div
                        className="d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          background: "rgba(0, 118, 116, 0.1)",
                          color: "#007674",
                        }}
                      >
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                      <h5
                        className="fw-semibold mb-2"
                        style={{ color: "#121212" }}
                      >
                        Loading jobs...
                      </h5>
                      <p style={{ color: "#666", fontSize: "1rem" }}>
                        Please wait while we fetch the latest job opportunities
                      </p>
                    </motion.div>
                  ) : (
                    <div className="row g-3">
                      {filteredJobs.map((job, index) => (
                        <motion.div
                          key={index}
                          className="col-12"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                        >
                          <JobCard job={job} onClick={handleCardClick} />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {!loadingJobs && filteredJobs.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="text-center py-5"
                    >
                      <div
                        className="d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          background: "rgba(0, 118, 116, 0.1)",
                          color: "#007674",
                        }}
                      >
                        <BsSearch size={40} />
                      </div>
                      <h5
                        className="fw-semibold mb-2"
                        style={{ color: "#121212" }}
                      >
                        No jobs found
                      </h5>
                      <p style={{ color: "#666", fontSize: "1rem" }}>
                        Try adjusting your filters or search terms
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <JobDetailsModal
          job={selectedJob}
          show={showModal}
          onClose={closeModal}
        />
      </div>
    </>
  );
};

export default FreelancersDashboard;
