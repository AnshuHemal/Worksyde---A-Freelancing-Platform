import React, { useEffect, useState } from "react";
import Header1 from "../../components/Header1";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BsArrowRight, BsCheckCircle, BsX, BsLightbulb, BsSearch } from "react-icons/bs";
import jobSkills from "../../assets/skill.jpg";
import axios from "axios";
import toast from "react-hot-toast";

const ClientJobSkillSelectionPage = () => {
  const [userId, setUserId] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobCategory, setJobCategory] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [categorySkills, setCategorySkills] = useState([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        setUserId(res.data.user._id);
        
        // After getting user ID, fetch the draft job post
        await fetchDraftJobPost(res.data.user._id);
      } catch (error) {
        toast.error("Failed to fetch user.");
        console.error(error);
      }
    };

    fetchCurrentUser();
  }, []);

  const fetchDraftJobPost = async (userId) => {
    try {
      setIsLoadingCategory(true);
      const response = await axios.post(`${API_URL}/jobposts/draft/`, {
        userId,
      });
      const jobId = response.data.jobPostId;
      setJobId(jobId);
      
      // Fetch job details to get the category
      await fetchJobDetails(jobId);
    } catch (error) {
      console.error("Error fetching draft job post:", error);
      setIsLoadingCategory(false);
    }
  };

  const fetchJobDetails = async (jobId) => {
    try {
      const response = await axios.get(`${API_URL}/jobpost/${jobId}/`);
      const jobData = response.data;
      
      if (jobData.category) {
        setJobCategory(jobData.category);
        
        // Fetch skills related to this category
        await fetchCategorySkills(jobData.category.name);
      } else {
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setIsLoadingCategory(false);
    }
  };

  const fetchCategorySkills = async (categoryName) => {
    try {
      // Get all skills and filter by category relevance
      const response = await axios.get(`${API_URL}/get-skills/`);
      const allSkillsData = response.data.skills;
      
      // Define category-skill mappings
      const categorySkillMappings = {
        "Web, Mobile & Software Dev": [
          "React", "Node.js", "JavaScript", "Python", "Java", "C++", "C#", "PHP", "Ruby", "Go",
          "Angular", "Vue.js", "TypeScript", "Swift", "Kotlin", "Flutter", "React Native",
          "MongoDB", "MySQL", "PostgreSQL", "Redis", "AWS", "Azure", "Docker", "Kubernetes",
          "Git", "REST API", "GraphQL", "Microservices", "CI/CD", "DevOps"
        ],
        "Data Science & Analytics": [
          "Python", "R", "SQL", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
          "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Tableau", "Power BI",
          "Apache Spark", "Hadoop", "Data Visualization", "Statistical Analysis", "A/B Testing"
        ],
        "Design & Creative": [
          "UI/UX Design", "Graphic Design", "Adobe Photoshop", "Adobe Illustrator", "Figma",
          "Sketch", "InDesign", "Typography", "Color Theory", "Layout Design", "Brand Identity",
          "Logo Design", "Web Design", "Mobile Design", "Prototyping", "Wireframing"
        ],
        "Sales & Marketing": [
          "Digital Marketing", "SEO", "SEM", "Social Media Marketing", "Content Marketing",
          "Email Marketing", "Google Ads", "Facebook Ads", "Analytics", "CRM", "Sales",
          "Lead Generation", "Conversion Optimization", "Brand Strategy", "Market Research"
        ],
        "IT & Networking": [
          "Network Administration", "System Administration", "Linux", "Windows Server",
          "Cisco", "VMware", "Cloud Computing", "Cybersecurity", "Firewall", "VPN",
          "Active Directory", "DNS", "DHCP", "Backup & Recovery", "Disaster Recovery"
        ],
        "Writing": [
          "Content Writing", "Copywriting", "Technical Writing", "Creative Writing",
          "Blog Writing", "SEO Writing", "Grant Writing", "Resume Writing", "Editing",
          "Proofreading", "Research", "Ghostwriting", "Script Writing", "Academic Writing"
        ],
        "Translation": [
          "English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean",
          "Arabic", "Russian", "Portuguese", "Italian", "Dutch", "Swedish", "Norwegian",
          "Document Translation", "Website Localization", "Technical Translation"
        ],
        "Engineering & Architecture": [
          "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
          "Structural Engineering", "AutoCAD", "Revit", "SolidWorks", "3D Modeling",
          "Architecture", "Building Design", "Construction Management", "Project Management"
        ],
        "Accounting & Consulting": [
          "Accounting", "Bookkeeping", "Tax Preparation", "Financial Analysis",
          "Auditing", "QuickBooks", "Excel", "Financial Modeling", "Business Consulting",
          "Strategic Planning", "Process Improvement", "Risk Management"
        ],
        "Admin Support": [
          "Data Entry", "Virtual Assistant", "Administrative Support", "Customer Service",
          "Email Management", "Calendar Management", "Travel Planning", "Event Planning",
          "Project Coordination", "Document Management", "Research", "Transcription"
        ],
        "Customer Service": [
          "Customer Support", "Technical Support", "Live Chat", "Phone Support",
          "Email Support", "Customer Success", "Account Management", "Problem Solving",
          "Communication", "Patience", "Empathy", "Product Knowledge"
        ],
        "Legal": [
          "Contract Law", "Corporate Law", "Intellectual Property", "Employment Law",
          "Real Estate Law", "Family Law", "Criminal Law", "Legal Research", "Document Review",
          "Compliance", "Regulatory Affairs", "Legal Writing"
        ]
      };
      
      // Get relevant skills for the category
      const relevantSkillNames = categorySkillMappings[categoryName] || [];
      
      // Filter skills that exist in the database
      const availableCategorySkills = allSkillsData.filter(skill => 
        relevantSkillNames.includes(skill.name)
      );
      
      setCategorySkills(availableCategorySkills.map(skill => skill.name));
      
    } catch (error) {
      console.error("Error fetching category skills:", error);
    }
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get(`${API_URL}/get-skills/`);
        const skillNames = response.data.skills.map((skill) => skill.name);
        setAllSkills(skillNames);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchSkills();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setHighlightedIndex(-1);

    if (value.length > 0) {
      // First, get category-related skills that match the input
      const categoryMatches = categorySkills.filter(
        (skill) =>
          skill.toLowerCase().includes(value.toLowerCase()) &&
          !selectedSkills.includes(skill)
      );
      
      // Then, get other skills that match the input
      const otherMatches = allSkills.filter(
        (skill) =>
          skill.toLowerCase().includes(value.toLowerCase()) &&
          !selectedSkills.includes(skill) &&
          !categorySkills.includes(skill)
      );
      
      // Combine with category skills first, then other skills
      const filtered = [...categoryMatches, ...otherMatches];
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addSkill = (skill) => {
    if (selectedSkills.length >= 15) {
      toast.error("You can select up to 15 skills only.");
      return;
    }

    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setInput("");
      setSuggestions([]);
      setHighlightedIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        addSkill(suggestions[highlightedIndex]);
      }
    }
  };

  const removeSkill = (skill) => {
    const updated = selectedSkills.filter((s) => s !== skill);
    setSelectedSkills(updated);
  };

  const handleNext = async () => {
    if (selectedSkills.length < 5) {
      toast.error("Please select at least 5 skills.");
      return;
    }

    if (selectedSkills.length > 15) {
      toast.error("You can select up to 15 skills only.");
      return;
    }

    if (!jobId) {
      toast.error("Job ID not found. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/add-jobpost-skills/`, {
        jobId,
        skills: selectedSkills,
      });

      if (response.status === 200) {
        navigate("/job-post/instant/scope");
      }
    } catch (error) {
      console.error("Error saving skills:", error.message);
      toast.error("Failed to save skills.");
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic popular skills based on category or fallback to general skills
  const getPopularSkills = () => {
    if (categorySkills.length > 0) {
      // Show category skills as popular skills
      return categorySkills.slice(0, 12); // Show up to 12 category skills
    }
    
    // Fallback to general popular skills if no category detected
    return [
      "React", "Node.js", "Python", "JavaScript", "UI/UX Design",
      "Graphic Design", "Content Writing", "Digital Marketing", "SEO",
      "Mobile App Development", "Web Development", "Data Analysis"
    ];
  };

  return (
    <>
      <Header1 />
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center section-container"
        style={{
          backgroundColor: "#fff",
          padding: "40px 0",
          fontFamily: "Urbanist, sans-serif",
          fontWeight: 500,
        }}
      >
        <div className="container-fluid px-4">
          <div className="row justify-content-center">
            <div className="col-12">
              {/* Header Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-5"
              >
                <h2
                  className="display-5 fw-semibold mb-3"
                  style={{ color: "#121212", letterSpacing: '0.3px' }}
                >
                  Create Your Job Post
                </h2>
                <p
                  className="lead mb-4"
                  style={{
                    fontSize: "1.25rem",
                    color: "#121212",
                    fontWeight: 600,
                    letterSpacing: '0.3px'
                  }}
                >
                  Step 2: Select the skills required for your project
                </p>
              </motion.div>

              {/* Main Content */}
              <div className="row justify-content-center align-items-start">
                <div className="col-lg-5 mb-4">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    {/* Loading State */}
                    {isLoadingCategory && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card border-0 shadow-lg mb-4"
                        style={{
                          borderRadius: "25px",
                          border: "1px solid rgba(0, 118, 116, 0.2)",
                          background: "linear-gradient(135deg, rgba(0, 118, 116, 0.05) 0%, rgba(0, 118, 116, 0.02) 100%)",
                        }}
                      >
                        <div className="card-body p-4 text-center">
                          <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mb-0" style={{ color: "#666", fontSize: "0.9rem" }}>
                            Detecting job category and loading relevant skills...
                          </p>
                        </div>
                      </motion.div>
                    )}



                    {/* No Category Detected Message */}
                    {!jobCategory && !isLoadingCategory && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card border-0 shadow-lg mb-4"
                        style={{
                          borderRadius: "25px",
                          border: "1px solid rgba(255, 193, 7, 0.3)",
                          background: "linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 193, 7, 0.02) 100%)",
                        }}
                      >
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center mb-3">
                            <BsLightbulb
                              size={20}
                              style={{ color: "#ffc107", marginRight: "10px" }}
                            />
                            <h5
                              className="fw-bold mb-0"
                              style={{ color: "#856404", letterSpacing: '0.3px' }}
                            >
                              Category Not Detected
                            </h5>
                          </div>
                          <p
                            className="mb-0"
                            style={{
                              fontSize: "0.9rem",
                              color: "#856404",
                              lineHeight: "1.5",
                            }}
                          >
                            We couldn't automatically detect the category for your job. You can still select skills from the list below or search for specific skills.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Popular Skills Card */}
                    <div
                      className="card border-0 shadow-lg h-100"
                      style={{
                        borderRadius: "25px",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <div className="card-body p-5">
                        <div className="d-flex align-items-center mb-4">
                          <BsLightbulb
                            size={24}
                            style={{ color: "#007674", marginRight: "12px" }}
                          />
                          <h4
                            className="fw-bold mb-0"
                            style={{ color: "#121212", letterSpacing: '0.3px' }}
                          >
                            {categorySkills.length > 0 ? "Category Skills" : "Popular Skills"}
                          </h4>
                        </div>
                        <p
                          className="mb-4"
                          style={{
                            fontSize: "1.1rem",
                            color: "#121212",
                            lineHeight: "1.6",
                          }}
                        >
                          {categorySkills.length > 0 
                            ? `Click on any skill below to quickly add it to your selection. These skills are specifically relevant to your ${jobCategory?.name} category.`
                            : "Click on any skill below to quickly add it to your selection."
                          }
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                          {getPopularSkills().map((skill, index) => (
                            <motion.button
                              key={index}
                              className="btn position-relative"
                              style={{
                                borderRadius: "25px",
                                background: selectedSkills.includes(skill)
                                  ? "linear-gradient(135deg, #007674 0%, #005a58 100%)"
                                  : categorySkills.includes(skill)
                                  ? "#fff"
                                  : "#f8f9fa",
                                color: selectedSkills.includes(skill) ? "#fff" : "#121212",
                                border: categorySkills.includes(skill) 
                                  ? "2px solid #007674" 
                                  : "1px solid #e3e3e3",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                padding: "8px 16px",
                                transition: "all 0.3s ease",
                              }}
                              onClick={() => {
                                if (selectedSkills.includes(skill)) {
                                  removeSkill(skill);
                                } else {
                                  addSkill(skill);
                                }
                              }}
                              whileHover={{
                                boxShadow: categorySkills.includes(skill)
                                  ? "0 4px 15px rgba(0, 118, 116, 0.3)"
                                  : "0 4px 15px rgba(0, 0, 0, 0.1)",
                              }}
                            >
                              {skill}
                              {categorySkills.includes(skill) && (
                                <span
                                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                                  style={{
                                    backgroundColor: "#007674",
                                    color: "#fff",
                                    fontSize: "0.6rem",
                                    fontWeight: 600,
                                    transform: "translate(-50%, -50%)",
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                            </motion.button>
                          ))}
                        </div>
                        
                        {/* Helpful Message */}
                        {categorySkills.length > 0 && (
                          <div className="mt-4 p-3 rounded-3" style={{
                            border: "1px solid #e3e3e3"
                          }}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <BsLightbulb size={22} style={{ color: "#007674" }} />
                              <small className="fw-semibold" style={{ color: "#007674", fontSize: "1.3rem"   }}>
                                Category Skills
                              </small>
                            </div>
                            <small style={{ color: "#121212", fontSize: "1.1rem", lineHeight: "1.4" }}>
                              The skills above are specifically relevant to your <strong>{jobCategory?.name}</strong> category. 
                              They'll help you find freelancers with the exact expertise you need. 
                              You can also search for additional skills below.
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="col-lg-7">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {/* Main Form Card */}
                    <div
                      className="card border-0 shadow-lg"
                      style={{
                        borderRadius: "25px",
                        border: "1px solid rgba(0, 118, 116, 0.1)",
                      }}
                    >
                      <div className="card-body p-5">
                        <h3
                          className="fw-semibold mb-4"
                          style={{ color: "#121212", letterSpacing: '0.3px', fontSize: '2rem' }}
                        >
                          Awesome, add main skills required for your work
                        </h3>
                        <p
                          className="mb-4"
                          style={{
                            fontSize: "1.1rem",
                            color: "#121212",
                            lineHeight: "1.6",
                          }}
                        >
                          Selecting the right skills helps connect your job with freelancers
                          who have the exact expertise you're looking for. Be specific—use
                          tools or technologies like "React" or "Node.js" instead of just
                          saying "developer." This makes your post stand out to the right
                          talent.
                        </p>

                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <label
                              className="fw-semibold"
                              style={{ color: "#121212", letterSpacing: '0.3px' }}
                            >
                              Search & Add Skills
                            </label>
                            <span
                              className="text-muted"
                              style={{ fontSize: "1rem" }}
                            >
                              {selectedSkills.length}/15 skills
                            </span>
                          </div>
                          
                          <div className="position-relative">
                            <div className="input-group">
                              <span
                                className="input-group-text border-end-0"
                                style={{
                                  background: "#fcfafd",
                                  border: "2px solid #e3e3e3",
                                  borderRight: "none",
                                  borderRadius: "15px 0 0 15px",
                                }}
                              >
                                <BsSearch style={{ color: "#007674" }} />
                              </span>
                              <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Start typing to search for skills..."
                                value={input}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                disabled={selectedSkills.length >= 15}
                                style={{
                                  fontSize: "1.1rem",
                                  fontWeight: 500,
                                  border: "2px solid #e3e3e3",
                                  borderRadius: "0 15px 15px 0",
                                  padding: "15px 20px",
                                  background: "#fff",
                                  transition: "all 0.3s ease",
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = "#007674";
                                  e.target.style.boxShadow = "0 0 0 0.2rem rgba(0, 118, 116, 0.1)";
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = "#e3e3e3";
                                  e.target.style.boxShadow = "none";
                                }}
                              />
                            </div>

                            {suggestions.length > 0 && (
                              <div
                                className="position-absolute w-100 mt-1"
                                style={{
                                  zIndex: 1000,
                                  background: "#fff",
                                  borderRadius: "15px",
                                  border: "1px solid #e3e3e3",
                                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                }}
                              >
                                {suggestions.map((skill, index) => (
                                  <div
                                    key={index}
                                    className="p-3 cursor-pointer"
                                    style={{
                                      background: index === highlightedIndex ? "rgba(0, 118, 116, 0.1)" : "transparent",
                                      borderBottom: index < suggestions.length - 1 ? "1px solid #f0f0f0" : "none",
                                      transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    onClick={() => addSkill(skill)}
                                  >
                                    <div className="d-flex align-items-center justify-content-between">
                                      <span
                                        style={{
                                          fontSize: "1rem",
                                          color: "#121212",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {skill}
                                      </span>
                                      {categorySkills.includes(skill) && (
                                        <span
                                          className="badge"
                                          style={{
                                            backgroundColor: "#007674",
                                            color: "#fff",
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            borderRadius: "12px",
                                            padding: "4px 8px",
                                          }}
                                        >
                                          Category
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Selected Skills */}
                        {selectedSkills.length > 0 && (
                          <div className="mb-4">
                            <h6
                              className="fw-semibold mb-3"
                              style={{ color: "#121212", letterSpacing: '0.3px' }}
                            >
                              Selected Skills ({selectedSkills.length})
                            </h6>
                            <div className="d-flex flex-wrap gap-2">
                              {selectedSkills.map((skill, index) => (
                                <motion.span
                                  key={index}
                                  className="badge d-flex align-items-center gap-2"
                                  style={{
                                    backgroundColor: "#fcfafd",
                                    color: "#121212",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    borderRadius: "25px",
                                    border: "1px solid #e3e3e3",
                                    padding: "10px 15px",
                                  }}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {skill}
                                  <button
                                    onClick={() => removeSkill(skill)}
                                    className="btn btn-link p-0"
                                    style={{
                                      color: "#007674",
                                      fontSize: "1.2rem",
                                      fontWeight: "bold",
                                      textDecoration: "none",
                                      lineHeight: 1,
                                    }}
                                  >
                                    <BsX />
                                  </button>
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Validation Message */}
                        <div className="mb-4">
                          {selectedSkills.length < 5 && selectedSkills.length > 0 && (
                            <div className="alert alert-warning border-0" style={{
                              borderRadius: "15px",
                              background: "#fcfafd",
                              border: "1px solid #e3e3e3",
                              color: "#121212",
                            }}>
                              <BsCheckCircle className="me-2" />
                              Please select at least 5 skills to continue.
                            </div>
                          )}
                          {selectedSkills.length >= 5 && (
                            <div className="alert alert-success border-0" style={{
                              borderRadius: "15px",
                              background: "#fcfafd",
                              border: "1px solid #e3e3e3",
                              color: "#121212",
                            }}>
                              <BsCheckCircle className="me-2" />
                              Great! You've selected {selectedSkills.length} skills.
                            </div>
                          )}
                        </div>

                        <motion.button
                          className="btn fw-semibold px-5 py-3 w-100"
                          style={{
                            borderRadius: "50px",
                            background: "#007674",
                            color: "#fff",
                            fontSize: "1.1rem",
                            boxShadow: "0 6px 20px rgba(0, 118, 116, 0.3)",
                            border: "none",
                            transition: "all 0.3s ease",
                          }}
                          disabled={selectedSkills.length < 5 || isLoading}
                          onClick={handleNext}
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0 8px 25px rgba(0, 118, 116, 0.4)",
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isLoading ? (
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          ) : (
                            <>
                              Next, Scope of Your Work
                              <BsArrowRight className="ms-2" />
                            </>
                          )}
                        </motion.button>
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

export default ClientJobSkillSelectionPage;
