import React, { useState, useEffect } from "react";
import {
  BsSearch,
  BsThreeDots,
  BsDownload,
  BsCurrencyRupee,
} from "react-icons/bs";
import { MdOutlineWorkHistory } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000/api/auth";

function formatCurrencyString(value) {
  try {
    if (value === undefined || value === null) return "";
    const stringVal = String(value).trim();
    if (stringVal.includes("₹") || stringVal.includes("$")) return stringVal;
    const num = Number(stringVal);
    if (isNaN(num)) return stringVal;
    return `$${num.toFixed(2)}`;
  } catch {
    return String(value);
  }
}

function formatDateShort(date) {
  try {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function buildDateRange(acceptedAt, estimatedCompletionDate, status) {
  const start = acceptedAt ? formatDateShort(acceptedAt) : "";
  const end =
    status === "active" || !estimatedCompletionDate
      ? "Present"
      : formatDateShort(estimatedCompletionDate);
  if (!start && !end) return "";
  return `${start} - ${end}`;
}

function buildDueText(estimatedCompletionDate) {
  try {
    if (!estimatedCompletionDate) return "";
    const now = new Date();
    const due = new Date(estimatedCompletionDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 1)
      return `Due on ${due.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}`;
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays === 0) return "Due today";
    const overdue = Math.abs(diffDays);
    return `Overdue by ${overdue} day${overdue === 1 ? "" : "s"}`;
  } catch {
    return "";
  }
}

const FreelancerMyJobs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [pendingContracts, setPendingContracts] = useState([]);
  const [activeContracts, setActiveContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [freelancerId, setFreelancerId] = useState(null);
  const [earnings, setEarnings] = useState(0);

  // Mock pending contracts data
  const mockPendingContracts = [
    {
      id: 1,
      title: "Build Squarespace website",
      clientName: "Dan Goode",
      companyName: "Dans Galleries",
      amount: "$200.00",
      milestoneInfo: "First milestone funded for $50.00",
    },
  ];

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/current-user/`, {
          withCredentials: true,
        });
        if (response.data?.success && response.data?.user?._id) {
          setFreelancerId(response.data.user._id);
        } else {
          throw new Error("Failed to load current user");
        }
      } catch (err) {
        setError("Unable to load current user");
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!freelancerId) return;
    const fetchAcceptedOffers = async () => {
    try {
      setLoading(true);
        setError("");
        const res = await axios.get(
          `${API_URL}/job-offers/accepted/freelancer/${freelancerId}/`,
          { withCredentials: true }
        );
        const offers = res.data?.acceptedJobOffers || [];
        
        // Debug: Log the first offer to see the structure
        if (offers.length > 0) {
          console.log("First offer structure:", offers[0]);
          console.log("Client name from API:", offers[0].clientName);
        }

        // Separate pending and active contracts
        const pending = [];
        const active = offers.map((offer) => {
          const amount = formatCurrencyString(offer.projectAmount);
          const dateRange = buildDateRange(
            offer.acceptedAt,
            offer.estimatedCompletionDate,
            offer.status
          );
          const dueDate = buildDueText(offer.estimatedCompletionDate);

          // Determine payment type and milestone info
          const paymentSchedule = offer.paymentSchedule || "fixed_price";
          const isFixedPrice = paymentSchedule === "fixed_price";
          const milestoneNumber = isFixedPrice ? null : Math.floor(Math.random() * 3) + 1;
          const milestoneDescription =
            offer.workDescription || "Complete project milestone";
          const budget = amount;
          const escrowAmount = amount;

          // Extract client name from various possible fields
          let clientName = offer.clientName || 
                          offer.client?.name || 
                          offer.clientId?.name || 
                          "Unknown Client";
          
          // Ensure we have a meaningful client name
          if (!clientName || clientName === "Unknown Client" || clientName.trim() === "" || clientName === "Client") {
            // Try to get client name from the job post if available
            if (offer.jobId) {
              clientName = "Project Client"; // Fallback name
            } else {
              clientName = "Client"; // Simple fallback
            }
          }
          
          // Debug: Log client name extraction
          console.log(`Client name for offer ${offer.id}:`, {
            clientName: offer.clientName,
            clientNameExtracted: clientName,
            offer: offer
          });
          
          return {
            id: offer.id,
            title: offer.contractTitle || offer.jobTitle || "Project",
            clientName: clientName,
            companyName: clientName,
            status:
              offer.status === "active" ? "active" : offer.status || "active",
            dateRange,
            dueDate,
            budget,
            escrowAmount,
            paymentSchedule,
            isFixedPrice,
            milestoneNumber,
            milestoneDescription,
            canSubmitWork: offer.status === "active",
          };
        });

        setPendingContracts(mockPendingContracts);
        setActiveContracts(active);

        // Calculate total earnings
        const totalEarnings = active.reduce((sum, contract) => {
          const earnings = parseFloat(contract.budget.replace("$", "")) || 0;
          return sum + earnings;
        }, 0);
        setEarnings(totalEarnings + 91.34); // Add mock pending earnings
      } catch (err) {
        setError("Failed to load accepted job offers");
        setPendingContracts([]);
        setActiveContracts([]);
    } finally {
      setLoading(false);
    }
  };
    fetchAcceptedOffers();
  }, [freelancerId]);

  const filteredActiveContracts = activeContracts.filter((contract) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contract.title?.toLowerCase().includes(query) ||
      contract.clientName?.toLowerCase().includes(query)
    );
  });

  const handleSeeOffer = (contractId) => {
    toast.success("Opening offer details...");
    // TODO: Navigate to offer details
  };

  const handleSubmitWork = (contractId) => {
    navigate(`/ws/workroom/${contractId}`);
  };

  const tabs = [
    { id: "all", label: "All", count: filteredActiveContracts.length },
    {
      id: "hourly",
      label: "Hourly",
      count: filteredActiveContracts.filter((c) => c.hourlyRate).length,
    },
    { id: "active-milestones", label: "Active Milestones", count: 2 },
    { id: "awaiting-milestones", label: "Awaiting Milestones", count: 3 },
    { id: "payment-requests", label: "Payment Requests", count: 0 },
  ];

  return (
    <div
      className="section-container"
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        paddingTop: "30px",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px" }}>
        {/* Header with Earnings */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <h1
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: "#000000",
              letterSpacing: 0.3,
              margin: 0,
            }}
          >
            My Jobs
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18, color: "#121212", fontWeight: 600 }}>
              Earnings available now:
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#007674",
                cursor: "pointer",
              }}
            >
              <BsCurrencyRupee
                className="m-0 p-0"
                style={{ marginTop: "-2px" }}
              />
              {earnings.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Active Contracts Section */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            // padding: 24,
            marginBottom: 24,
            // border: "1px solid #e9ecef",
            // boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#000000",
                letterSpacing: 0.3,
                margin: 0,
              }}
            >
              Active Contracts
            </h2>
            <div style={{ position: "relative" }}>
              <BsSearch
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6b7280",
                }}
                size={18}
              />
            <input
              type="text"
                placeholder="Search contracts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  padding: "8px 12px 8px 36px",
                  fontSize: 16,
                  outline: "none",
                  background: "#ffffff",
                  color: "#121212",
                  width: 200,
                }}
              />
            </div>
          </div>



          {/* Active Contracts List */}
        {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 48,
                color: "#6b7280",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                    width: 20,
                    height: 20,
                  border: "2px solid #e5e7eb",
                    borderTop: "2px solid #007674",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              Loading contracts...
            </div>
          </div>
        ) : error ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 48,
                color: "#dc2626",
              }}
            >
            {error}
          </div>
          ) : filteredActiveContracts.length > 0 ? (
            <div>
              {filteredActiveContracts.map((contract) => (
                <div
                  key={contract.id}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 24,
                    marginBottom: 20,
                    border: "1px solid #e9ecef",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ display: "flex", gap: 20 }}>
                    {/* Left Section - Contract Info */}
                    <div style={{ flex: 1 }}>
                      {/* Contract Title */}
                      <div style={{ marginBottom: 16 }}>
                        <h3
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#333",
                            letterSpacing: 0.2,
                          }}
                        >
                          {contract.title}
                        </h3>
                        <p
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: 18,
                            color: "#121212",
                            fontWeight: 500,
                          }}
                        >
                          Hired by: {contract.clientName}
                        </p>
                        <p
                          style={{
                            margin: "0 0 12px 0",
                            fontSize: 16,
                            color: "#121212",
                          }}
                        >
                          {contract.companyName}
                        </p>
                      </div>

                      {/* Milestone Details */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: "#333",
                            }}
                          >
                            Active: {contract.isFixedPrice ? "Fixed Price" : `Milestone ${contract.milestoneNumber}`}
                          </span>
                        </div>
                      </div>

                      {/* Milestone Description */}
                      <div style={{ marginBottom: 16 }}>
                        <span style={{ fontSize: 16, color: "#121212" }}>
                          {contract.milestoneDescription.length > 50
                            ? `${contract.milestoneDescription.substring(
                                0,
                                50
                              )}... `
                            : contract.milestoneDescription}
                        </span>
                        {contract.milestoneDescription.length > 50 && (
                          <span
                            style={{
                              fontSize: 16,
                              color: "#007674",
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                          >
                            more
                          </span>
                        )}
                      </div>

                      {/* Due Date */}
                      <div style={{ marginBottom: 16 }}>
                        <span style={{ fontSize: 16, color: "#121212" }}>
                          {contract.dueDate}
                        </span>
                      </div>

                      {/* Budget and Escrow */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 4 }}>
                          <span style={{ fontSize: 16, color: "#121212" }}>
                            {contract.budget} Budget
                          </span>
                        </div>
          <div>
                          <span style={{ fontSize: 16, color: "#121212" }}>
                            {contract.escrowAmount} in Worksyde Wallet
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Date Range and Action Buttons */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 12,
                      }}
                    >
                      {/* Date Range */}
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 16, color: "#121212" }}>
                          {contract.dateRange}
                        </span>
                  </div>

                      {/* Action Buttons */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 8,
                          minWidth: 200,
                        }}
                      >
                    {contract.canSubmitWork && (
                      <button 
                        onClick={() => handleSubmitWork(contract.id)}
                            style={{
                              background:
                                "linear-gradient(135deg, #007674 0%, #005a58 100%)",
                              color: "#fff",
                              borderRadius: "8px",
                              fontSize: "16px",
                              fontWeight: 600,
                              border: "none",
                              padding: "12px 20px",
                              transition: "all 0.3s ease",
                              boxShadow: "0 4px 12px rgba(0, 118, 116, 0.3)",
                              cursor: "pointer",
                              // width: "100%",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background =
                                "linear-gradient(135deg, #121212 0%, #0a0a0a 100%)";
                              e.target.style.transform = "translateY(-1px)";
                              e.target.style.boxShadow =
                                "0 6px 16px rgba(18, 18, 18, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background =
                                "linear-gradient(135deg, #007674 0%, #005a58 100%)";
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow =
                                "0 4px 12px rgba(0, 118, 116, 0.3)";
                            }}
                          >
                            Submit Work for Payment
                      </button>
                    )}
                        <button
                          style={{
                            background: "transparent",
                            color: "#007674",
                            border: "2px solid #007674",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: 600,
                            padding: "8px 16px",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            // width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#007674";
                            e.target.style.color = "#fff";
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow =
                              "0 4px 12px rgba(40, 167, 69, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "transparent";
                            e.target.style.color = "#007674";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                      <BsThreeDots size={16} />
                    </button>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
            <div
              style={{
                textAlign: "center",
                padding: 48,
                color: "#121212",
                fontSize: 18,
              }}
            >
              {searchQuery
                ? "No contracts found matching your search."
                : "No active contracts found."}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerMyJobs; 
