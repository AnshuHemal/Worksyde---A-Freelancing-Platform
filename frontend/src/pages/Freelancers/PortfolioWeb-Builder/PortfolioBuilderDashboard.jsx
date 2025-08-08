import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsPlus,
  BsGlobe,
  BsPencil,
  BsTrash,
  BsEye,
  BsCalendar,
  BsFileEarmarkText,
  BsArrowClockwise
} from "react-icons/bs";
import { RiAiGenerate } from "react-icons/ri";
import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios"; // Removed, not used

const PortfolioBuilderDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioType, setPortfolioType] = useState("personal"); // Only 'personal' is used
  const [selectedTemplateCode, setSelectedTemplateCode] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [formData, setFormData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const location = useLocation();

  // Example template definition (expand as needed):
  const templates = [
    {
      id: 1,
      title: 'Professional Personal Portfolio',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop',
      tagline: 'Modern professional portfolio with HTML/CSS/JS.',
      templateCode: 'personal-portfolio-v1',
      folder: 'PersonalPortfolio',
      filePath: '/src/pages/Freelancers/PortfolioWeb-Builder/Templates/PersonalPortfolio/index.html',
      publishedDate: '2024-01-01',
      type: 'free',
    },
    // Add more templates here with unique id, folder, filePath, etc.
  ];

  // Fetch portfolios on component mount
  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      // For now, we'll use a mock data structure
      // In a real implementation, you'd fetch from your API
      const mockPortfolios = [
        {
          id: 1,
          title: "My Developer Portfolio",
          type: "personal",
          updatedAt: new Date().toISOString(),
          status: "draft"
        },
        {
          id: 2,
          title: "Design Portfolio 2024",
          type: "creative",
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          status: "published"
        }
      ];
      setDrafts(mockPortfolios);
    } catch (error) {
      console.error("Failed to fetch portfolios:", error);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortfolio = async () => {
    if (portfolioTitle.trim()) {
      try {
        // Create the portfolio with title, type, and template code
        const newPortfolio = {
          id: Date.now(),
          title: portfolioTitle,
          type: portfolioType,
          templateCode: selectedTemplateCode,
          createdAt: new Date().toISOString(),
          status: "draft"
        };
        
        setDrafts(prev => [newPortfolio, ...prev]);
        setPortfolioTitle("");
        setPortfolioType("personal");
        setSelectedTemplateCode("");
        setShowModal(false);
        
        // In a real implementation, you'd save to your API
        // const response = await axios.post("/api/ai-portfolios/", {
        //   title: portfolioTitle,
        //   type: portfolioType,
        //   templateCode: selectedTemplateCode
        // }, { withCredentials: true });
        
        // Navigate to the portfolio editor with template code
        navigate(`/ws/ai-tools/ai-portfolio-web/${newPortfolio.id}?template=${selectedTemplateCode}`);
      } catch (error) {
        console.error("Failed to create portfolio:", error);
      }
    }
  };

  const handleResumeClick = () => {
    navigate("/ws/ai-tools/ai-resume");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Remove getPortfolioTypeIcon and getPortfolioTypeLabel, only 'personal' is used

  const handlePreview = () => {
    setPreviewModalOpen(true);
    setIframeKey(prev => prev + 1); // Reset iframe on open
  };
  const handleRefreshPreview = () => {
    setIframeKey(prev => prev + 1);
  };

  // Format the publish date
  const formatPublishDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
          fontFamily: "Urbanist, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f4f6",
              borderTop: "4px solid #007674",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: "16px" }}>Loading portfolios...</p>
        </div>
      </div>
    );
  }

  if (location.pathname === "/ws/ai-tools/ai-portfolio-web/create") {
    return (
      <PortfolioCreateForm
        template={selectedTemplate}
        onPreview={async (fields) => {
          if (!selectedTemplate) return;
          const response = await fetch(selectedTemplate.filePath);
          let htmlContent = await response.text();
          const replacements = {
            '{{name}}': fields.name,
            '{{title}}': fields.title,
            '{{description}}': fields.description,
            '{{about}}': fields.about,
            '{{email}}': fields.email,
            '{{phone}}': fields.phone,
            '{{location}}': fields.location
          };
          Object.entries(replacements).forEach(([placeholder, value]) => {
            htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
          });
          setFormData({ html: htmlContent });
          setPreviewModalOpen(true);
        }}
      />
    );
  }

  return (
    <>
      <style>{`
        /* Hide scrollbars globally for all elements */
        ::-webkit-scrollbar {
          width: 0 !important;
          background: transparent;
        }
        html, body, .section-container {
          scrollbar-width: none !important; /* Firefox */
          -ms-overflow-style: none !important; /* IE/Edge */
        }
      `}</style>
      <div
        className="section-container"
        style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
          padding: "32px 24px 0 24px",
          fontFamily: "Urbanist, sans-serif",
          minHeight: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          scrollBehavior: "smooth",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
        }}
      >
      {/* Header */}
      <div
        style={{
          width: "100%",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          top: 0,
          zIndex: 10,
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          className="d-flex align-items-center justify-content-between py-4 px-4"
        >
          <div className="d-flex align-items-center gap-2">
            <RiAiGenerate
              size={28}
              color="#007674"
              style={{ marginRight: 10 }}
            />
            <span
              style={{
                fontFamily: "Urbanist, sans-serif",
                fontWeight: 600,
                fontSize: 24,
                color: "#121212",
                letterSpacing: "0.3px",
              }}
            >
              AI Portfolio Web Builder
            </span>
          </div>
          <button
            onClick={handleResumeClick}
            className="btn"
            style={{
              border: "2px solid #007674",
              color: "#007674",
              borderRadius: "12px",
              fontWeight: 600,
              fontFamily: "Urbanist, sans-serif",
              fontSize: 16,
              padding: "12px 24px",
              background: "#fff",
              transition: "all 0.3s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
              minWidth: 0,
              boxSizing: "border-box",
              width: "auto",
              flex: "none",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#007674";
              e.target.style.color = "#ffffff";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 24px rgba(0, 118, 116, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#fff";
              e.target.style.color = "#007674";
              e.target.style.borderColor = "#007674";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
            }}
          >
            <BsFileEarmarkText style={{ marginRight: 6 }} /> AI Resume Builder
          </button>
        </div>
      </div>

      <div
        className="container-fluid"
        style={{ width: "100%", padding: "40px 0 0 0", maxWidth: "100vw" }}
      >
        {/* Create New Portfolio Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="d-flex flex-column align-items-center mb-5"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: 320,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "36px 0 28px 0",
              cursor: "pointer",
              marginBottom: 10,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#007674";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 118, 116, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
            }}
            onClick={() => setShowModal(true)}
          >
            <BsPlus size={38} color="#007674" style={{ marginBottom: 10 }} />
            <span
              style={{
                fontWeight: 600,
                fontSize: 20,
                color: "#121212",
                fontFamily: "Urbanist, sans-serif",
                letterSpacing: "0.3px",
              }}
            >
              Create New Portfolio
            </span>
          </motion.div>
          <span
            style={{
              color: "#6b7280",
              fontSize: 15,
              fontFamily: "Urbanist, sans-serif",
              fontWeight: "500",
            }}
          >
            Build your professional portfolio website with AI assistance
          </span>
        </motion.div>

        {/* Drafts Section */}
        <div
          className="mb-3"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <h2
            style={{
              color: "#121212",
              fontSize: 20,
              fontWeight: 600,
              fontFamily: "Urbanist, sans-serif",
              margin: 0,
              letterSpacing: "0.3px",
            }}
          >
            Your Portfolios
          </h2>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "#e5e7eb",
              borderRadius: 2,
            }}
          />
        </div>
        {drafts.length === 0 ? (
          <div
            className="text-center p-5"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <BsGlobe size={50} color="#ccc" className="mb-3" />
            <p style={{ 
              color: "#6b7280", 
              fontSize: 17,
              fontWeight: "500",
              fontFamily: "Urbanist, sans-serif",
            }}>
              No portfolios yet. Create your first portfolio website to get started!
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {drafts.map((draft, index) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="col-12 col-md-6 col-lg-4"
              >
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    minHeight: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "22px 24px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#007674";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 118, 116, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "12px",
                        background: "#f8f9fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Only 'personal' is used, so no icon change needed */}
                    </div>
                    <div>
                      <div
                        style={{
                          color: "#121212",
                          fontWeight: 600,
                          fontSize: 16,
                          fontFamily: "Urbanist, sans-serif",
                        }}
                      >
                        {draft.title}
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <BsCalendar size={13} color="#6b7280" />
                        <span
                          style={{
                            color: "#6b7280",
                            fontSize: 13,
                            fontFamily: "Urbanist, sans-serif",
                            fontWeight: "500",
                          }}
                        >
                          {formatDate(draft.updatedAt || draft.createdAt)}
                        </span>
                        <span
                          style={{
                            color: draft.status === "published" ? "#10b981" : "#f59e0b",
                            fontSize: 12,
                            fontFamily: "Urbanist, sans-serif",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {draft.status}
                        </span>
                      </div>
                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: 12,
                          fontFamily: "Urbanist, sans-serif",
                          fontWeight: "500",
                          marginTop: 2,
                        }}
                      >
                        Personal Portfolio
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-link p-0"
                      style={{ color: "#007674" }}
                      title="Edit"
                      onClick={() => navigate(`/ws/ai-tools/ai-portfolio-web/${draft.id}`)}
                    >
                      <BsPencil size={18} />
                    </button>
                    <button
                      className="btn btn-link p-0"
                      style={{ color: "#007674" }}
                      title="Preview"
                      onClick={handlePreview}
                    >
                      <BsEye size={18} />
                    </button>
                    <button
                      className="btn btn-link p-0"
                      style={{ color: "#dc3545" }}
                      title="Delete"
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this portfolio?")) {
                          try {
                            setDrafts(prev => prev.filter(p => p.id !== draft.id));
                            // In a real implementation, you'd delete from your API
                            // await axios.delete(`/api/ai-portfolios/${draft.id}/`, {
                            //   withCredentials: true,
                            // });
                          } catch (error) {
                            console.error("Failed to delete portfolio:", error);
                          }
                        }
                      }}
                    >
                      <BsTrash size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Templates Section */}
      <div className="mt-5 mb-5">
        <div
          className="mb-4"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <h2
            style={{
              color: "#121212",
              fontSize: 22,
              fontWeight: 600,
              fontFamily: "Urbanist, sans-serif",
              margin: 0,
              letterSpacing: "0.3px",
            }}
          >
            Choose a template to get started
          </h2>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "#e5e7eb",
              borderRadius: 2,
            }}
          />
        </div>

        <div className="row g-4">
          {templates.map(template => (
            <div
              key={template.id}
              className="col-12 col-md-6 col-lg-3"
            >
              <div
                className="modern-template-card position-relative d-flex flex-column p-0 mb-3"
                style={{
                  background: '#fff',
                  borderRadius: '20px',
                  border: '1.5px solid #e5e7eb',
                  // boxShadow: '0 8px 32px rgba(0, 118, 116, 0.10)',
                  transition: 'box-shadow 0.3s, border-color 0.3s, transform 0.2s',
                  cursor: 'pointer',
                  minHeight: 420,
                  maxHeight: 420,
                  height: 420,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#007674';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  const previewBtn = e.currentTarget.querySelector('.preview-btn');
                  const useTemplateBtn = e.currentTarget.querySelector('.use-template-btn');
                  const overlay = e.currentTarget.querySelector('.img-overlay');
                  if (previewBtn) {
                    previewBtn.style.opacity = '1';
                    previewBtn.style.pointerEvents = 'auto';
                    previewBtn.style.transform = 'translateY(0)';
                  }
                  if (useTemplateBtn) {
                    useTemplateBtn.style.opacity = '1';
                    useTemplateBtn.style.pointerEvents = 'auto';
                    useTemplateBtn.style.transform = 'translateY(0)';
                  }
                  if (overlay) {
                    overlay.style.opacity = '1';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  const previewBtn = e.currentTarget.querySelector('.preview-btn');
                  const useTemplateBtn = e.currentTarget.querySelector('.use-template-btn');
                  const overlay = e.currentTarget.querySelector('.img-overlay');
                  if (previewBtn) {
                    previewBtn.style.opacity = '0';
                    previewBtn.style.pointerEvents = 'none';
                    previewBtn.style.transform = 'translateY(-12px)';
                  }
                  if (useTemplateBtn) {
                    useTemplateBtn.style.opacity = '0';
                    useTemplateBtn.style.pointerEvents = 'none';
                    useTemplateBtn.style.transform = 'translateY(-12px)';
                  }
                  if (overlay) {
                    overlay.style.opacity = '0';
                  }
                }}
              >
                {/* Use Template Button (top left, circular icon style, only on hover) */}
                <button
                  className="btn use-template-btn position-absolute d-flex align-items-center justify-content-center"
                  style={{
                    top: 18,
                    left: 18,
                    background: '#007476',
                    color: '#fff',
                    width: 150,
                    borderRadius: 10,
                    fontWeight: 500,
                    fontFamily: 'Urbanist, sans-serif',
                    fontSize: 16,
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 118, 116, 0.13)',
                    zIndex: 2,
                    transition: 'background 0.2s, opacity 0.2s, transform 0.2s',
                    opacity: 0,
                    pointerEvents: 'none',
                    transform: 'translateY(-12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setPreviewModalOpen(true);
                    setIframeKey(prev => prev + 1);
                  }}
                  title="Use Template"
                >Use Template
                </button>
                {/* Preview Button (hidden by default, shown on hover) */}
                <button
                  className="btn preview-btn position-absolute d-flex align-items-center justify-content-center"
                  style={{
                    top: 18,
                    right: 18,
                    background: '#007476',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 44,
                    height: 44,
                    fontWeight: 600,
                    fontFamily: 'Urbanist, sans-serif',
                    fontSize: 18,
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 118, 116, 0.13)',
                    opacity: 0,
                    pointerEvents: 'none',
                    transform: 'translateY(-12px)',
                    transition: 'opacity 0.2s, transform 0.2s',
                    zIndex: 2
                  }}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setPreviewModalOpen(true);
                    setIframeKey(prev => prev + 1);
                  }}
                  title="Preview"
                >
                  <BsEye size={22} />
                </button>
                <div style={{position: 'relative', width: '100%'}}>
                  <img
                    src={template.image}
                    alt={template.title}
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      objectFit: 'cover',
                      borderTopLeftRadius: '20px',
                      borderTopRightRadius: '20px',
                      display: 'block',
                      transition: 'filter 0.2s',
                    }}
                  />
                  <div className="img-overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,118,116,0.10) 100%)',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                  }} />
                </div>
                <div className="w-100 d-flex flex-column align-items-start p-4 flex-grow-1 justify-content-end" style={{minHeight: 120}}>
                  <div style={{fontWeight: 700, fontSize: 22, color: '#121212', fontFamily: 'Urbanist, sans-serif', marginBottom: 8, letterSpacing: '0.2px'}}>{template.title}</div>
                  <div style={{color: '#121212', fontSize: 16, fontWeight: 500, lineHeight: 1.5, marginBottom: 16}}>{template.tagline}</div>
                  <div className="d-flex w-100 justify-content-between align-items-center" style={{marginTop: 2}}>
                    <div style={{color: '#121212', fontSize: 16, fontWeight: 500}}>
                      Published: {formatPublishDate(template.publishedDate || '2024-01-01')}
                    </div>
                    <div style={{color: '#007674', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                      Free
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Portfolio Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="modal-overlay"
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
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="modal-content"
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "40px",
                maxWidth: "540px",
                width: "90%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="fw-semibold mb-4 text-center"
                style={{
                  color: "#121212",
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  letterSpacing: "0.3px",
                  fontFamily: "Urbanist, sans-serif",
                }}
              >
                Create New Portfolio
              </h3>
              
              <div className="mb-4">
                <label
                  className="form-label fw-semibold"
                  style={{
                    color: "#121212",
                    fontSize: "1.2rem",
                    fontWeight: "600",
                    marginBottom: "8px",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                >
                  Portfolio Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter portfolio title (e.g., My Developer Portfolio)"
                  value={portfolioTitle}
                  onChange={(e) => setPortfolioTitle(e.target.value)}
                  style={{
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "1.1rem",
                    transition: "all 0.3s ease",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007674";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(0, 118, 116, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div className="d-flex gap-3 justify-content-end mt-2">
                <button
                  className="btn flex-fill"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#f8f9fa",
                    color: "#374151",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#f8f9fa";
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn flex-fill"
                  onClick={handleCreatePortfolio}
                  disabled={!portfolioTitle.trim()}
                  style={{
                    background:
                      "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    boxShadow: "0 4px 16px rgba(0, 118, 116, 0.2)",
                    opacity: portfolioTitle.trim() ? 1 : 0.6,
                    transition: "all 0.3s ease",
                    fontFamily: "Urbanist, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (portfolioTitle.trim()) {
                      e.target.style.background =
                        "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                      e.target.style.boxShadow =
                        "0 8px 25px rgba(18, 18, 18, 0.4)";
                      e.target.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (portfolioTitle.trim()) {
                      e.target.style.background =
                        "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                      e.target.style.boxShadow =
                        "0 4px 16px rgba(0, 118, 116, 0.2)";
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  Create Portfolio
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for preview */}
      {previewModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.45)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            width: '100%',
            height: '100%',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
          }}>
            <div style={{position: 'absolute', top: 24, right: 36, zIndex: 2, display: 'flex', gap: 12}}>
              <button
                onClick={handleRefreshPreview}
                style={{
                  background: '#f3f4f6',
                  color: '#007674',
                  border: 'none',
                  borderRadius: '50%',
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  marginRight: 8
                }}
                title="Refresh Preview"
              >
                <BsArrowClockwise size={22} />
              </button>
              <button
                onClick={() => setPreviewModalOpen(false)}
                style={{
                  background: '#007674',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 18,
                  padding: '10px 24px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                Close Preview
              </button>
            </div>
            <div style={{flex: 1, overflowY: 'auto', overflowX: 'hidden', marginTop: 0}}>
              <iframe
                key={iframeKey}
                title="Template Preview"
                srcDoc={formData?.html}
                src={formData ? undefined : selectedTemplate?.filePath}
                style={{width: '100vw', height: '100vh', border: 'none', background: '#f8f9fa', overflowX: 'hidden', overflowY: 'auto'}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  </>
  );
};

export default PortfolioBuilderDashboard;