import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ClientHeader from "../../components/ClientHeader";
import { BsArrowLeft, BsQuestionCircle, BsShield } from "react-icons/bs";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { PAYPAL_CONFIG, PAYPAL_BUTTON_STYLES } from "../../config/paypal";
import toast from "react-hot-toast";
import worksydeLogo from "../../assets/worksyde.png";
import paypalLogo from "../../assets/paypal.svg";

const API_URL = "http://localhost:5000/api/auth";

// PayPal configuration
const paypalOptions = {
  "client-id": PAYPAL_CONFIG["client-id"],
  currency: PAYPAL_CONFIG.currency,
  intent: PAYPAL_CONFIG.intent,
  "disable-funding": "venmo,paylater,card",
  components: "buttons",
  environment: PAYPAL_CONFIG.environment,
};

const ClientJobOfferCheckout = () => {
  const { jobofferid } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [jobOffer, setJobOffer] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [companyAddress, setCompanyAddress] = useState({
    country: "India",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
  });
  const [savedAddress, setSavedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [processing, setProcessing] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchJobOfferData = async () => {
      try {
        setLoading(true);

        // Fetch job offer details
        const jobOfferResponse = await axios.get(
          `${API_URL}/job-offers/${jobofferid}`,
          {
            withCredentials: true,
          }
        );
        // Handle nested response structure
        const jobOfferData =
          jobOfferResponse.data.jobOffer || jobOfferResponse.data;
        setJobOffer(jobOfferData);

        // Fetch freelancer details if job offer has freelancer ID
        if (jobOfferData.freelancerId) {
          try {
            // Use the correct freelancer complete profile endpoint
            const freelancerResponse = await axios.get(
              `${API_URL}/freelancer/complete-profile/${jobOfferData.freelancerId}/`,
              {
                withCredentials: true,
              }
            );
            setFreelancer(freelancerResponse.data);
          } catch (freelancerError) {
            console.error("Error fetching freelancer:", freelancerError);
            console.error(
              "Freelancer error details:",
              freelancerError.response?.data
            );

            // Try alternative endpoint as fallback
            try {
              const altFreelancerResponse = await axios.get(
                `${API_URL}/freelancer/profile/${jobOfferData.freelancerId}/`,
                {
                  withCredentials: true,
                }
              );
              setFreelancer(altFreelancerResponse.data);
            } catch (altError) {
              console.error(
                "Alternative freelancer endpoint also failed:",
                altError
              );
              // Continue without freelancer data
            }
          }
        } else {
          console.log("No freelancer ID found in job offer data");
        }
      } catch (error) {
        console.error("Error fetching job offer:", error);
        setJobOffer(null);
      } finally {
        setLoading(false);
      }
    };

    if (jobofferid) {
      fetchJobOfferData();
    }
  }, [jobofferid]);

  const handleAddressChange = (field, value) => {
    setCompanyAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const isFormValid = () => {
    return (
      companyAddress.addressLine1.trim() !== "" &&
      companyAddress.city.trim() !== ""
    );
  };

  const handleSave = async () => {
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSavedAddress({ ...companyAddress });
      setCurrentStep(2);
      setIsEditing(false);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setCurrentStep(1);
    // Restore the saved address values to the form
    if (savedAddress) {
      setCompanyAddress(savedAddress);
    }
  };

  // PayPal payment functions
  const createPayPalOrder = async (data, actions) => {
    try {
      setProcessing(true);

      const paymentAmount = fees.total || 0;

      // Call your backend to create PayPal order
      const response = await axios.post(
        `${API_URL}/paypal/payment/initiate/`,
        {
          amount: paymentAmount,
          currency: "INR",
          description: `Payment for ${
            jobOffer?.contractTitle || "Freelancing Project"
          }`,
          jobOfferId: jobOffer?.id || null,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setPaypalOrderId(response.data.paypalOrderId);

        return response.data.paypalOrderId;
      } else {
        throw new Error(
          response.data.message || "Failed to create PayPal order"
        );
      }
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      toast.error("Failed to create PayPal order. Please try again.");
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const onPayPalApprove = async (data, actions) => {
    try {
      setProcessing(true);

      // Call your backend to capture the payment
      const response = await axios.post(
        `${API_URL}/paypal/payment/complete/`,
        {
          paypalOrderId: data.orderID,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setPaymentSuccess(true);
        toast.success(
          `Payment completed successfully! Transaction ID: ${response.data.transactionId}`
        );
      } else {
        throw new Error(response.data.message || "Payment capture failed");
      }
    } catch (error) {
      console.error("Error completing PayPal payment:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const onPayPalError = (err) => {
    console.error("PayPal error:", err);
    toast.error("PayPal payment failed. Please try again.");
    setProcessing(false);
  };

  const onPayPalCancel = () => {
    toast.error("Payment was cancelled.");
    setProcessing(false);
  };

  // Removed unused PayPal SDK functions

  // Calculate fees and totals
  const calculateFees = () => {
    if (!jobOffer)
      return { subtotal: 0, marketplaceFee: 0, contractFee: 0, total: 0 };

    // Handle different formats of project amount
    let subtotal = 0;
    if (jobOffer.projectAmount) {
      // Remove ₹ symbol and any commas, then parse
      const cleanAmount = jobOffer.projectAmount.replace(/[₹,]/g, "");
      subtotal = parseInt(cleanAmount) || 0;
    } else {
      console.log("No project amount found in job offer");
    }

    const marketplaceFee = 50; // Fixed fee
    const contractFee = 100; // Fixed fee
    const total = subtotal + marketplaceFee + contractFee;

    return { subtotal, marketplaceFee, contractFee, total };
  };

  const fees = calculateFees();

  // Get freelancer name
  const getFreelancerName = () => {
    if (freelancer) {
      // Backend returns 'name' field directly
      const name =
        freelancer.freelancer.name ||
        freelancer.firstName ||
        freelancer.lastName ||
        "";
      return name || "Freelancer";
    }

    // Fallback: try to get name from job offer or use default
    if (jobOffer?.freelancerName) {
      return jobOffer.freelancerName;
    }

    // If no freelancer data available, use a generic name
    return "Freelancer";
  };

  // Get freelancer initial
  const getFreelancerInitial = () => {
    const name = getFreelancerName();
    return name.charAt(0).toUpperCase();
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

  if (!jobOffer) {
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
        <div style={{ color: "#dc3545" }}>Job offer not found</div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <ClientHeader />
      <div
        className="section-container"
        style={{ maxWidth: 1400, margin: "60px auto 0 auto", padding: 24 }}
      >
        {/* Header */}
        <div style={{ marginBottom: 30 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              color: "#007674",
              cursor: "pointer",
              fontSize: 18,
              marginTop: 16,
              textDecoration: "underline",
              padding: 0,
              marginBottom: 0,
              fontFamily: "inherit",
            }}
          >
            Back to Offer Details
          </button>

          <div style={{ display: "flex", alignItems: "center" }}>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 600,
                marginBottom: 0,
                letterSpacing: 0.3,
                color: "#121212",
              }}
            >
              Hire {getFreelancerName()}
            </h1>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 32,
            alignItems: "flex-start",
          }}
        >
          {/* Left Column - Multi-step Form */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #eee",
              padding: 0,
            }}
          >
            {/* Step 1: Add/Edit company address */}
            <div
              style={{
                fontWeight: 700,
                fontSize: 24,
                padding: "18px 24px",
                borderBottom: "1px solid #f0f0f0",
                color: currentStep >= 1 ? "#121212" : "#999",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                1. {savedAddress && !isEditing ? "Edit" : "Add"} company address
              </span>
              {savedAddress && !isEditing && (
                <button
                  onClick={handleEdit}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#007674",
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 600,
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  Edit
                </button>
              )}
            </div>

            {currentStep === 1 && (
              <div style={{ padding: "24px" }}>
                {savedAddress && !isEditing ? (
                  // Display saved address in read-only format
                  <div style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        fontSize: 16,
                        color: "#666",
                        lineHeight: 1.5,
                        padding: "16px",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "6px",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      {savedAddress.addressLine1}
                      {savedAddress.addressLine2 && (
                        <>
                          <br />
                          {savedAddress.addressLine2}
                        </>
                      )}
                      <br />
                      {savedAddress.city}, {savedAddress.country}{" "}
                      {savedAddress.postalCode}
                    </div>
                  </div>
                ) : (
                  // Show address form for editing/adding
                  <>
                    <div style={{ marginBottom: 24 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 16,
                          fontWeight: 500,
                          color: "#121212",
                          marginBottom: 8,
                        }}
                      >
                        Country
                      </label>
                      <select
                        value={companyAddress.country}
                        onChange={(e) =>
                          handleAddressChange("country", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "6px",
                          fontSize: 16,
                          outline: "none",
                          fontFamily: "inherit",
                          backgroundColor: "#fff",
                        }}
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 16,
                          fontWeight: 500,
                          color: "#121212",
                          marginBottom: 8,
                        }}
                      >
                        Address line 1 *
                      </label>
                      <input
                        type="text"
                        value={companyAddress.addressLine1}
                        onChange={(e) =>
                          handleAddressChange("addressLine1", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "6px",
                          fontSize: 16,
                          outline: "none",
                          fontFamily: "inherit",
                          backgroundColor: "#fff",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 16,
                          fontWeight: 500,
                          color: "#121212",
                          marginBottom: 8,
                        }}
                      >
                        Address line 2 (optional)
                      </label>
                      <input
                        type="text"
                        value={companyAddress.addressLine2}
                        onChange={(e) =>
                          handleAddressChange("addressLine2", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "6px",
                          fontSize: 16,
                          outline: "none",
                          fontFamily: "inherit",
                          backgroundColor: "#fff",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                        marginBottom: 32,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 16,
                            fontWeight: 500,
                            color: "#121212",
                            marginBottom: 8,
                          }}
                        >
                          City *
                        </label>
                        <input
                          type="text"
                          value={companyAddress.city}
                          onChange={(e) =>
                            handleAddressChange("city", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            fontSize: 16,
                            outline: "none",
                            fontFamily: "inherit",
                            backgroundColor: "#fff",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 16,
                            fontWeight: 500,
                            color: "#121212",
                            marginBottom: 8,
                          }}
                        >
                          Postal code (optional)
                        </label>
                        <input
                          type="text"
                          value={companyAddress.postalCode}
                          onChange={(e) =>
                            handleAddressChange("postalCode", e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            fontSize: 16,
                            outline: "none",
                            fontFamily: "inherit",
                            backgroundColor: "#fff",
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={processing || !isFormValid()}
                      style={{
                        padding: "16px 32px",
                        backgroundColor:
                          processing || !isFormValid() ? "#ccc" : "#007674",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: 16,
                        fontWeight: 600,
                        cursor:
                          processing || !isFormValid()
                            ? "not-allowed"
                            : "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {processing ? "Saving..." : "Save"}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Step 2: Add a billing method */}
            <div
              style={{
                fontWeight: 600,
                fontSize: 20,
                padding: "18px 24px",
                borderTop: "1px solid #f0f0f0",
                color: currentStep >= 2 && !isEditing ? "#121212" : "#999",
              }}
            >
              2. Add a billing method
            </div>

            {currentStep === 2 && !isEditing && (
              <div style={{ padding: "24px" }}>
                {/* Payment Method Selection */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ marginBottom: 16 }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        cursor: "pointer",
                        padding: "12px 0",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => handlePaymentMethodChange("card")}
                        style={{
                          width: "18px",
                          height: "18px",
                          accentColor: "#007674",
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 500,
                            color: "#121212",
                          }}
                        >
                          Payment card
                        </div>
                        <div
                          style={{ fontSize: 14, color: "#666", marginTop: 2 }}
                        >
                          Visa, Mastercard, American Express, Discover, Diners
                        </div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        cursor: "pointer",
                        padding: "12px 0",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={() => handlePaymentMethodChange("paypal")}
                        style={{
                          width: "18px",
                          height: "18px",
                          accentColor: "#007674",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <img
                          src={paypalLogo}
                          alt="PayPal"
                          style={{ width: "90px", objectFit: "contain" }}
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Redirection Notice */}
                {paymentMethod === "paypal" && (
                  <div style={{ marginBottom: 32, textAlign: "center" }}>
                    {/* Redirection Graphic */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          width: "150px",
                          height: "100px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px",
                        }}
                      >
                        <img
                          src={worksydeLogo}
                          alt="Worksyde"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "0",
                            height: "0",
                            borderLeft: "8px solid #007674",
                            borderTop: "6px solid transparent",
                            borderBottom: "6px solid transparent",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: "150px",
                          height: "100px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px",
                        }}
                      >
                        <img
                          src={paypalLogo}
                          alt="PayPal"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 600,
                        color: "#121212",
                        marginBottom: 8,
                      }}
                    >
                      You are about to leave Worksyde
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        color: "#121212",
                        lineHeight: 1.4,
                      }}
                    >
                      You will be redirected to PayPal so you can connect your
                      PayPal account to Worksyde.
                    </div>
                  </div>
                )}

                {/* PayPal Payment Button */}
                {paymentMethod === "paypal" && (
                  <div
                    style={{
                      marginTop: 24,
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ width: "100%", maxWidth: "400px" }}>
                      <PayPalButtons
                        createOrder={createPayPalOrder}
                        onApprove={onPayPalApprove}
                        onError={onPayPalError}
                        onCancel={onPayPalCancel}
                        style={PAYPAL_BUTTON_STYLES}
                        disabled={processing}
                      />
                    </div>
                  </div>
                )}

                {/* Currency Conversion Notice */}
                {paymentMethod === "paypal" && (
                  <div
                    style={{
                      backgroundColor: "#fff",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid #e9ecef",
                      marginTop: "26px",
                      marginBottom: "26px",
                    }}
                  >
                    <strong style={{ fontSize: "20 px", fontWeight: "600" }}>
                      Payment Info:
                    </strong>{" "}
                    <br />
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#121212",
                        lineHeight: "1.4",
                        marginTop: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      PayPal will process your payment in USD (approximately $
                      {(fees.total / 83).toFixed(2)}) for international
                      compatibility. Your original amount of ₹
                      {fees.total.toLocaleString()} will be displayed in your
                      transaction history.
                    </div>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ marginBottom: 24 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 16,
                          fontWeight: 500,
                          color: "#121212",
                          marginBottom: 8,
                        }}
                      >
                        Card number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "6px",
                          fontSize: 16,
                          outline: "none",
                          fontFamily: "inherit",
                          backgroundColor: "#fff",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                        marginBottom: 24,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 16,
                            fontWeight: 500,
                            color: "#121212",
                            marginBottom: 8,
                          }}
                        >
                          Expiry date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            fontSize: 16,
                            outline: "none",
                            fontFamily: "inherit",
                            backgroundColor: "#fff",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 16,
                            fontWeight: 500,
                            color: "#121212",
                            marginBottom: 8,
                          }}
                        >
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            fontSize: 16,
                            outline: "none",
                            fontFamily: "inherit",
                            backgroundColor: "#fff",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 32 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 16,
                          fontWeight: 500,
                          color: "#121212",
                          marginBottom: 8,
                        }}
                      >
                        Cardholder name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "6px",
                          fontSize: 16,
                          outline: "none",
                          fontFamily: "inherit",
                          backgroundColor: "#fff",
                        }}
                      />
                    </div>

                    <button
                      disabled={processing}
                      style={{
                        padding: "16px 32px",
                        backgroundColor: processing ? "#ccc" : "#007674",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: processing ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {processing ? "Processing..." : "Save Payment Method"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Project Summary */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #eee",
              padding: 0,
              position: "sticky",
              top: 24,
            }}
          >
            <div style={{ padding: "24px" }}>

              {/* Freelancer Profile Card */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: "#007674",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 22,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {getFreelancerInitial()}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        color: "#121212",
                        marginBottom: 4,
                      }}
                    >
                      Hire {getFreelancerName()} for:
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#121212",
                      }}
                    >
                      {jobOffer.contractTitle ||
                        jobOffer.projectTitle ||
                        "Freelancing Project"}
                    </div>
                    {freelancer && freelancer.title && (
                      <div
                        style={{
                          fontSize: 14,
                          color: "#666",
                          marginTop: 4,
                        }}
                      >
                        {freelancer.title}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Funds Section */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: "#121212",
                      letterSpacing: 0.3,
                      margin: 0,
                    }}
                  >
                    Project funds
                  </h3>
                  <BsQuestionCircle
                    style={{ fontSize: 16, color: "#666", cursor: "pointer" }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 18, color: "#121212" }}>
                      Subtotal
                    </span>
                    <span style={{ fontSize: 18, color: "#121212" }}>
                      ₹ {fees.subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 18, color: "#121212" }}>
                      Marketplace fee
                    </span>
                    <span style={{ fontSize: 18, color: "#121212" }}>
                      ₹ {fees.marketplaceFee}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 18, color: "#121212" }}>
                      Contract initiation fee
                    </span>
                    <span style={{ fontSize: 18, color: "#121212" }}>
                      ₹ {fees.contractFee}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#121212",
                      }}
                    >
                      Estimated total
                    </span>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#121212",
                      }}
                    >
                      ₹ {fees.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <a
                    href="#"
                    style={{
                      fontSize: 16,
                      color: "#121212",
                      textDecoration: "none",
                    }}
                  >
                    Learn about{" "}
                    <span
                      style={{
                        color: "#007674",
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      fees
                    </span>{" "}
                    and{" "}
                    <span
                      style={{
                        color: "#007674",
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      estimated taxes
                    </span>
                  </a>
                </div>
              </div>

              <button
                disabled={currentStep < 2 || isEditing}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor:
                    currentStep >= 2 && !isEditing ? "#007674" : "#f0f0f0",
                  color: currentStep >= 2 && !isEditing ? "#fff" : "#999",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor:
                    currentStep >= 2 && !isEditing ? "pointer" : "not-allowed",
                  marginBottom: 16,
                  transition: "all 0.3s ease",
                }}
              >
                Fund contract & hire
              </button>

              <div
                style={{
                  fontSize: 16,
                  color: "#666",
                  marginBottom: 16,
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                Any available balance you have will be applied towards your
                total amount.
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 16,
                  color: "#121212",
                }}
              >
                <BsShield style={{ fontSize: 16, color: "#666" }} />
                Worksyde Payment Protection
              </div>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default ClientJobOfferCheckout;
