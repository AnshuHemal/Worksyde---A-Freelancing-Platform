import React, { useState, useEffect } from "react";
import axios from "axios";
import FreelancersSettingsSidebar from "./FreelancersSettingsSidebar";
import { useNavigate } from "react-router-dom";
import paypal_logo from "../../assets/paypal.svg";
import payment_illustration from "../../assets/payment.svg";
import { useUser } from "../../contexts/UserContext";
import Loader from "../../components/Loader";


const SIDEBAR_WIDTH = 290;
const API_URL = "http://localhost:5000/api/auth";

const BillingAndPaymentsPage = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [countries, setCountries] = useState([]);
  const [countryLoading, setCountryLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [cardNumber, setCardNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Payment card states
  const [paymentCards, setPaymentCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [submittingCard, setSubmittingCard] = useState(false);
  const [cardError, setCardError] = useState("");
  const [cardSuccess, setCardSuccess] = useState("");

  // PayPal states
  const [paypalAccounts, setPaypalAccounts] = useState([]);
  const [loadingPaypal, setLoadingPaypal] = useState(false);
  const [submittingPaypal, setSubmittingPaypal] = useState(false);
  const [paypalError, setPaypalError] = useState("");
    const [paypalSuccess, setPaypalSuccess] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  
  const [walletBalance, setWalletBalance] = useState(0.0);
  const [loadingWalletBalance, setLoadingWalletBalance] = useState(false);

  useEffect(() => {
    async function fetchCountries() {
      setCountryLoading(true);
      try {
        const res = await fetch("https://api.first.org/data/v1/countries");
        const data = await res.json();
        const countryNames = Object.values(data.data)
          .map((c) => c.country)
          .sort();
        setCountries(countryNames);
        if (countryNames.includes("India")) setSelectedCountry("India");
        else setSelectedCountry(countryNames[0]);
      } catch (e) {
        setCountries(["India"]);
        setSelectedCountry("India");
      }
      setCountryLoading(false);
    }
    fetchCountries();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPaymentCards();
      fetchPaypalAccounts();
      fetchWalletBalance();
    }
  }, [userId]);

  // Fetch payment cards
  const fetchPaymentCards = async () => {
    if (!userId) return;

    setLoadingCards(true);
    try {
      const response = await axios.get(`${API_URL}/payment-cards/`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setPaymentCards(response.data.cards);
      }
    } catch (error) {
      console.error("Error fetching payment cards:", error);
    } finally {
      setLoadingCards(false);
    }
  };

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    if (!userId) return;

    setLoadingWalletBalance(true);
    try {
      const response = await axios.get(`${API_URL}/wallet/balance/`, {
        withCredentials: true,
      });

      console.log("Wallet balance response:", response.data);
      if (response.data.success) {
        setWalletBalance(response.data.walletBalance);
        console.log("Updated wallet balance state:", response.data.walletBalance);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    } finally {
      setLoadingWalletBalance(false);
    }
  };

  // Fetch PayPal accounts
  const fetchPaypalAccounts = async () => {
    if (!userId) return;

    setLoadingPaypal(true);
    try {
      const response = await axios.get(`${API_URL}/paypal-accounts/`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setPaypalAccounts(response.data.accounts);
      }
    } catch (error) {
      console.error("Error fetching PayPal accounts:", error);
    } finally {
      setLoadingPaypal(false);
    }
  };

  // Add payment card
  const handleAddPaymentCard = async () => {
    if (!userId) return;

    setSubmittingCard(true);
    setCardError("");
    setCardSuccess("");

    try {
      // Determine card type based on card number
      const cardType = getCardType(cardNumber);

      const cardData = {
        cardType: cardType,
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName: `${firstName} ${lastName}`.trim(),
        expiryMonth: expMonth,
        expiryYear: expYear,
        cvv: securityCode,
        billingAddress: address1,
        billingCity: city,
        billingCountry: selectedCountry,
        billingPostalCode: postalCode,
        isDefault: paymentCards.length === 0, // Make default if first card
      };

      const response = await axios.post(`${API_URL}/payment-cards/add/`, cardData, {
        withCredentials: true,
      });

      if (response.data.success) {
        setCardSuccess("Payment card added successfully!");
        setShowAddMethod(false);
        resetCardForm();
        fetchPaymentCards(); // Refresh the cards list
      }
    } catch (error) {
      setCardError(error.response?.data?.message || "Failed to add payment card");
    } finally {
      setSubmittingCard(false);
    }
  };

  // Delete payment card
  const handleDeleteCard = async (cardId) => {
    if (!confirm("Are you sure you want to delete this payment card?")) return;

    try {
      const response = await axios.delete(`${API_URL}/payment-cards/${cardId}/delete/`, {
        withCredentials: true,
      });

      if (response.data.success) {
        fetchPaymentCards(); // Refresh the cards list
      }
    } catch (error) {
      console.error("Error deleting payment card:", error);
    }
  };

  // Set default payment card
  const handleSetDefaultCard = async (cardId) => {
    try {
      const response = await axios.put(`${API_URL}/payment-cards/${cardId}/set-default/`, {}, {
        withCredentials: true,
      });

      if (response.data.success) {
        fetchPaymentCards(); // Refresh the cards list
      }
    } catch (error) {
      console.error("Error setting default card:", error);
    }
  };

  // Add PayPal account
  const handleAddPaypalAccount = async () => {
    if (!userId || !paypalEmail) return;

    setSubmittingPaypal(true);
    setPaypalError("");
    setPaypalSuccess("");

    try {
      const response = await axios.post(`${API_URL}/paypal-accounts/add/`, {
        paypalEmail: paypalEmail,
      }, {
        withCredentials: true,
      });

      if (response.data.success) {
        setPaypalSuccess("PayPal account added successfully!");
        setPaypalEmail("");
        fetchPaypalAccounts(); // Refresh the accounts list
      }
    } catch (error) {
      setPaypalError(error.response?.data?.message || "Failed to add PayPal account");
    } finally {
      setSubmittingPaypal(false);
    }
  };

  // Delete PayPal account
  const handleDeletePaypalAccount = async (accountId) => {
    try {
      const response = await axios.delete(`${API_URL}/paypal-accounts/${accountId}/delete/`, {
        withCredentials: true,
      });

      if (response.data.success) {
        fetchPaypalAccounts(); // Refresh the accounts list
      }
    } catch (error) {
      console.error("Error deleting PayPal account:", error);
    }
  };

  // Set default PayPal account
  const handleSetDefaultPaypalAccount = async (accountId) => {
    try {
      const response = await axios.put(`${API_URL}/paypal-accounts/${accountId}/set-default/`, {}, {
        withCredentials: true,
      });

      if (response.data.success) {
        fetchPaypalAccounts(); // Refresh the accounts list
      }
    } catch (error) {
      console.error("Error setting default PayPal account:", error);
    }
  };



  // Handle PayPal payment initiation
  const handlePaypalPayment = async () => {
    try {
      const response = await axios.post(`${API_URL}/paypal/payment/initiate/`, {
        amount: 100, // Example amount - you can make this dynamic
        currency: 'USD',
        description: 'Worksyde Service Payment'
      }, {
        withCredentials: true,
      });

      if (response.data.success) {
        // Redirect to PayPal
        window.open(response.data.redirectUrl, '_blank');
      }
    } catch (error) {
      console.error("Error initiating PayPal payment:", error);
    }
  };

  // Helper function to determine card type
  const getCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5')) return 'mastercard';
    if (cleanNumber.startsWith('6')) return 'rupay';
    if (cleanNumber.startsWith('3')) return 'amex';
    return 'visa'; // default
  };

  // Reset card form
  const resetCardForm = () => {
    setCardNumber("");
    setFirstName("");
    setLastName("");
    setExpMonth("");
    setExpYear("");
    setSecurityCode("");
    setAddress1("");
    setAddress2("");
    setCity("");
    setPostalCode("");
    setSelectedCountry("India");
    setCardError("");
    setCardSuccess("");
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Navigation handler for sidebar
  const handleSidebarNavigate = (key) => {
    switch (key) {
      case "billing":
        navigate("/ws/payments/billing-methods");
        break;
      case "contact":
        navigate("/ws/settings/contact-info");
        break;
      case "profile":
        navigate("/ws/settings/profile");
        break;
      case "profile-settings":
        navigate("/ws/settings/profile");
        break;
      case "security":
        navigate("/ws/settings/password-and-security");
        break;
      case "notifications":
        navigate("/ws/settings/notifications");
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fff" }}>
      <FreelancersSettingsSidebar
        activeKey="billing"
        onNavigate={handleSidebarNavigate}
        freelancerId={userId}
      />
      <main
        style={{
          flex: 1,
          marginLeft: SIDEBAR_WIDTH,
          background: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          className="section-container"
          style={{ width: "100%", padding: "36px 20px 0 20px", minWidth: 320 }}

        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              marginBottom: 32,
              marginLeft: 20,
              marginRight: 20,
              color: "#222",
              textAlign: "left",
            }}
          >
            Billing & Payments
          </div>

          {/* Outstanding balance card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              padding: 36,
              boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
              minHeight: 120,
              marginBottom: 24,
              marginLeft: 20,
              marginRight: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 24, color: "#111", marginBottom: 8 }}>
              Your wallet balance
            </div>
            {loadingWalletBalance ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  className="spinner-border spinner-border-sm"
                  style={{ color: "#007476", width: "20px", height: "20px" }}
                />
                <div style={{ fontSize: 16, color: "#666" }}>
                  Loading wallet balance...
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 28, fontWeight: 700, color: "#111", marginBottom: 16 }}>
                ₹{" "}{walletBalance.toFixed(2)}
              </div>
            )}
            <div style={{ color: "#6b6b6b", fontSize: 16 }}>
              This is your current available balance from completed projects and payments.
            </div>
          </div>



          {/* Billing methods card */}
          {!showAddMethod ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e6e6e6",
                borderRadius: 12,
                padding: 36,
                boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
                minHeight: 200,
                marginTop: 8,
                marginBottom: 50,
                marginLeft: 20,
                marginRight: 20,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 26,
                  color: "#111",
                  marginBottom: 12,
                }}
              >
                Billing methods
              </div>
              <div
                style={{
                  color: "#6b6b6b",
                  fontSize: 18,
                  marginBottom: 18,
                  maxWidth: 700,
                }}
              >
                You haven’t set up any billing methods yet. Your billing method
                will be charged only when your available balance from Worksyde
                earnings is not sufficient to pay for your monthly membership
                and/or Tokens.
              </div>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "none",
                  border: "none",
                  color: "#007476",
                  fontWeight: 600,
                  fontSize: 17,
                  cursor: "pointer",
                  padding: 0,
                  marginTop: 8,
                  outline: "none",
                  transition: "color 0.2s",
                }}
                onClick={() => setShowAddMethod(true)}
                onMouseOver={(e) => (e.currentTarget.style.color = "#007476")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#007476")}
              >
                <svg
                  width="22"
                  height="22"
                  fill="#007476"
                  viewBox="0 0 24 24"
                  style={{ marginRight: 2 }}
                >
                  <path
                    d="M12 5v14m-7-7h14"
                    stroke="#007476"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                Add a billing method
              </button>
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e6e6e6",
                borderRadius: 12,
                padding: 36,
                // width: "100%",
                boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
                minHeight: 200,
                marginTop: 8,
                marginBottom: 16,
                marginLeft: 20,
                marginRight: 20,
                display: "flex",
                flexDirection: "column",
                gap: 18,
                position: "relative",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 26,
                  color: "#111",
                  marginBottom: 28,
                }}
              >
                Add a billing method
              </div>
              <button
                style={{
                  position: "absolute",
                  top: 28,
                  right: 28,
                  background: "#fff",
                  border: "1.5px solid #007476",
                  color: "#007476",
                  fontWeight: 600,
                  fontSize: 18,
                  borderRadius: 8,
                  padding: "6px 22px",
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s, border 0.2s",
                  boxShadow: "0 1px 4px 0 rgba(60,72,100,0.04)",
                }}
                onClick={() => {
                  setShowAddMethod(false);
                  resetCardForm();
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#007476";
                  e.currentTarget.style.border = "1.5px solid #007476";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#007476";
                  e.currentTarget.style.border = "1.5px solid #007476";
                }}
              >
                Cancel
              </button>
              {/* Error/Success Messages */}
              {cardError && (
                <div style={{
                  background: "#fee",
                  border: "1px solid #fcc",
                  color: "#c33",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "16px",
                }}>
                  {cardError}
                </div>
              )}

              {cardSuccess && (
                <div style={{
                  background: "#efe",
                  border: "1px solid #cfc",
                  color: "#3c3",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "16px",
                }}>
                  {cardSuccess}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                  marginTop: 12,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 20,
                    fontWeight: 500,
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <input
                    type="radio"
                    name="billing-method"
                    value="card"
                    checked={selectedMethod === "card"}
                    onChange={() => setSelectedMethod("card")}
                    style={{ width: 24, height: 24, marginRight: 16 }}
                  />
                  Payment card
                  <span
                    style={{
                      color: "#888",
                      fontWeight: 400,
                      fontSize: 16,
                      marginLeft: 12,
                    }}
                  >
                    Visa, Mastercard, Rupay.
                  </span>
                  {selectedMethod === "card" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedMethod("");
                        setCardNumber("");
                        setFirstName("");
                        setLastName("");
                        setExpMonth("");
                        setExpYear("");
                        setSecurityCode("");
                        setAddress1("");
                        setAddress2("");
                        setCity("");
                        setPostalCode("");
                      }}
                      style={{
                        marginLeft: 16,
                        background: "#eee",
                        border: "none",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        cursor: "pointer",
                        color: "#888",
                        transition: "background 0.2s",
                      }}
                      title="Cancel"
                    >
                      x
                    </button>
                  )}
                </label>
                {selectedMethod === "card" && (
                  <div
                    style={{
                      marginTop: 0,
                      background: "#fff",
                      border: "1px solid #e6e6e6",
                      borderRadius: 12,
                      padding: 32,
                      display: "flex",
                      flexDirection: "column",
                      gap: 24,
                    }}
                  >
                    {/* Header Section */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: "#007476",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                      <div
                        style={{ fontSize: 20, fontWeight: 600, color: "#222" }}
                      >
                        Payment card
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          color: "#888",
                          marginLeft: "auto",
                        }}
                      >
                        Visa, Mastercard, Rupay
                      </div>
                    </div>

                    {/* Card Number Section */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 18,
                          fontWeight: 500,
                          color: "#222",
                          marginBottom: 8,
                        }}
                      >
                        Card number
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            paddingLeft: "48px",
                            border: "1px solid #e6e6e6",
                            borderRadius: 8,
                            fontSize: 18,
                            outline: "none",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            left: 16,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#666",
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"
                              fill="#666"
                            />
                          </svg>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            right: 16,
                            top: "50%",
                            transform: "translateY(-50%)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div style={{ display: "flex", gap: 4 }}>
                            <div
                              style={{
                                width: 32,
                                height: 20,
                                backgroundColor: "#f0f0f0",
                                borderRadius: 4,
                              }}
                            ></div>
                            <div
                              style={{
                                width: 32,
                                height: 20,
                                backgroundColor: "#f0f0f0",
                                borderRadius: 4,
                              }}
                            ></div>
                            <div
                              style={{
                                width: 32,
                                height: 20,
                                backgroundColor: "#f0f0f0",
                                borderRadius: 4,
                              }}
                            ></div>
                            <div
                              style={{
                                width: 32,
                                height: 20,
                                backgroundColor: "#f0f0f0",
                                borderRadius: 4,
                              }}
                            ></div>
                            <div
                              style={{
                                width: 32,
                                height: 20,
                                backgroundColor: "#f0f0f0",
                                borderRadius: 4,
                              }}
                            ></div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              marginLeft: 8,
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                                fill="#666"
                              />
                            </svg>
                            <span style={{ fontSize: 16, color: "#666" }}>
                              Securely stored
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 18,
                            fontWeight: 500,
                            color: "#222",
                            marginBottom: 8,
                          }}
                        >
                          First name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="White"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e6e6e6",
                            borderRadius: 8,
                            fontSize: 18,
                            outline: "none",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 18,
                            fontWeight: 500,
                            color: "#222",
                            marginBottom: 8,
                          }}
                        >
                          Last name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Turtle"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e6e6e6",
                            borderRadius: 8,
                            fontSize: 18,
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Expiration and Security Code */}
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 18,
                            fontWeight: 500,
                            color: "#222",
                            marginBottom: 8,
                          }}
                        >
                          Expiration month
                        </label>
                        <input
                          type="text"
                          value={expMonth}
                          onChange={(e) => setExpMonth(e.target.value)}
                          placeholder="MM"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e6e6e6",
                            borderRadius: 8,
                            fontSize: 18,
                            outline: "none",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 18,
                            fontWeight: 500,
                            color: "#222",
                            marginBottom: 8,
                          }}
                        >
                          Expiration year
                        </label>
                        <input
                          type="text"
                          value={expYear}
                          onChange={(e) => setExpYear(e.target.value)}
                          placeholder="YY"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e6e6e6",
                            borderRadius: 8,
                            fontSize: 18,
                            outline: "none",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            marginBottom: 8,
                          }}
                        >
                          <label
                            style={{
                              fontSize: 18,
                              fontWeight: 500,
                              color: "#222",
                            }}
                          >
                            Security code
                          </label>
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              border: "1px solid #ccc",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                            title="Help"
                          >
                            <span style={{ fontSize: 16, color: "#666" }}>
                              ?
                            </span>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={securityCode}
                          onChange={(e) => setSecurityCode(e.target.value)}
                          placeholder="3 digits"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e6e6e6",
                            borderRadius: 8,
                            fontSize: 18,
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Billing Address Section */}
                    <div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 600,
                          color: "#222",
                          marginBottom: 16,
                        }}
                      >
                        Billing address
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 18,
                            fontWeight: 500,
                            color: "#222",
                            marginBottom: 8,
                          }}
                        >
                          Country
                        </label>
                        <div style={{ position: "relative" }}>
                          <select
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              border: "1px solid #e6e6e6",
                              borderRadius: 8,
                              fontSize: 18,
                              background: "#fff",
                              color: "#222",
                              appearance: "none",
                              outline: "none",
                            }}
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                          >
                            {countryLoading ? (
                              <option>Loading countries...</option>
                            ) : (
                              countries.map((country) => (
                                <option key={country} value={country}>
                                  {country}
                                </option>
                              ))
                            )}
                          </select>
                          <div
                            style={{
                              position: "absolute",
                              right: 16,
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M3 4.5L6 7.5L9 4.5"
                                stroke="#666"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 18,
                            fontWeight: 500,
                            color: "#222",
                            marginBottom: 8,
                          }}
                        >
                          Address line 1
                        </label>
                        <input
                          type="text"
                          value={address1}
                          onChange={(e) => setAddress1(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e6e6e6",
                            borderRadius: 8,
                            fontSize: 18,
                            outline: "none",
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 18,
                            fontWeight: 500,
                            color: "#222",
                            marginBottom: 8,
                          }}
                        >
                          Address line 2{" "}
                          <span style={{ color: "#888", fontWeight: 400 }}>
                            (optional)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={address2}
                          onChange={(e) => setAddress2(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            border: "1px solid #e6e6e6",
                            borderRadius: 8,
                            fontSize: 18,
                            outline: "none",
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: 18,
                              fontWeight: 500,
                              color: "#222",
                              marginBottom: 8,
                            }}
                          >
                            City
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Ahmedabad"
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              border: "1px solid #e6e6e6",
                              borderRadius: 8,
                              fontSize: 18,
                              outline: "none",
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: 18,
                              fontWeight: 500,
                              color: "#222",
                              marginBottom: 8,
                            }}
                          >
                            Postal code{" "}
                            <span style={{ color: "#888", fontWeight: 400 }}>
                              (optional)
                            </span>
                          </label>
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              border: "1px solid #e6e6e6",
                              borderRadius: 8,
                              fontSize: 18,
                              outline: "none",
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingCard}
                        onClick={handleAddPaymentCard}
                        style={{
                          marginTop: 24,
                          background: submittingCard ? "#ccc" : "#007476",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 18,
                          border: "none",
                          borderRadius: 8,
                          padding: "12px 24px",
                          cursor: submittingCard ? "not-allowed" : "pointer",
                          alignSelf: "flex-start",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!submittingCard) {
                            e.target.style.backgroundColor = "#005a58";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!submittingCard) {
                            e.target.style.backgroundColor = "#007476";
                          }
                        }}
                      >
                        {submittingCard ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              className="spinner-border spinner-border-sm"
                              style={{ color: "#fff", width: "16px", height: "16px" }}
                            />
                            Adding...
                          </div>
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  </div>
                )}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 18,
                    fontWeight: 500,
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <input
                    type="radio"
                    name="billing-method"
                    value="paypal"
                    checked={selectedMethod === "paypal"}
                    onChange={() => setSelectedMethod("paypal")}
                    style={{ width: 24, height: 24, marginRight: 16 }}
                  />
                  <img
                    src={paypal_logo}
                    alt="paypal_logo"
                    style={{ width: "90px" }}
                  />
                                    {selectedMethod === "paypal" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedMethod("");
                      }}
                      style={{
                        marginLeft: 16,
                        background: "#eee",
                        border: "none",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        cursor: "pointer",
                        color: "#888",
                        transition: "background 0.2s",
                      }}
                      title="Cancel"
                    >
                      ×
                    </button>
                  )}
                </label>

                {/* PayPal Account Form */}
                {selectedMethod === "paypal" && (
                  <div
                    style={{
                      marginTop: "24px",
                      background: "#fff",
                      border: "1px solid #e6e6e6",
                      borderRadius: "12px",
                      padding: "32px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 20,
                        color: "#111",
                        marginBottom: 24,
                      }}
                    >
                      Add PayPal Account
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 18,
                          fontWeight: 500,
                          color: "#222",
                          marginBottom: 8,
                        }}
                      >
                        PayPal Email
                      </label>
                      <input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "1px solid #e6e6e6",
                          borderRadius: 8,
                          fontSize: 18,
                          outline: "none",
                        }}
                      />
                    </div>

                    {/* PayPal Error/Success Messages */}
                    {paypalError && (
                      <div style={{
                        background: "#fee",
                        border: "1px solid #fcc",
                        color: "#c33",
                        padding: "12px",
                        borderRadius: "6px",
                        marginBottom: "16px",
                      }}>
                        {paypalError}
                      </div>
                    )}

                    {paypalSuccess && (
                      <div style={{
                        background: "#efe",
                        border: "1px solid #cfc",
                        color: "#3c3",
                        padding: "12px",
                        borderRadius: "6px",
                        marginBottom: "16px",
                      }}>
                        {paypalSuccess}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        onClick={handleAddPaypalAccount}
                        disabled={submittingPaypal || !paypalEmail}
                        style={{
                          background: submittingPaypal || !paypalEmail ? "#ccc" : "#007476",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "12px 24px",
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: submittingPaypal || !paypalEmail ? "not-allowed" : "pointer",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!submittingPaypal && paypalEmail) {
                            e.target.style.backgroundColor = "#005a58";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!submittingPaypal && paypalEmail) {
                            e.target.style.backgroundColor = "#007476";
                          }
                        }}
                      >
                        {submittingPaypal ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              className="spinner-border spinner-border-sm"
                              style={{ color: "#fff", width: "16px", height: "16px" }}
                            />
                            Adding...
                          </div>
                        ) : (
                          "Add PayPal Account"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setPaypalEmail("");
                          setPaypalError("");
                          setPaypalSuccess("");
                        }}
                        style={{
                          background: "transparent",
                          color: "#666",
                          border: "1px solid #ccc",
                          borderRadius: 8,
                          padding: "12px 24px",
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#f5f5f5";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                {/* PayPal Redirection Layout */}
                {selectedMethod === "paypal" && (
                  <div
                    style={{
                      marginTop: "14px",
                      background: "#fff",
                      borderRadius: "12px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    {/* Payment Illustration */}
                    <div
                      style={{
                        marginBottom: "32px",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={payment_illustration}
                        alt="Payment redirection"
                        style={{
                          width: "145px",
                          height: "130px",
                        }}
                      />
                    </div>
                    
                    {/* Main Heading */}
                    <h3
                      style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        color: "#1a1a1a",
                        margin: "0 0 16px 0",
                        lineHeight: "1.3",
                      }}
                    >
                      You are about to leave Worksyde.
                    </h3>
                    
                    {/* Description */}
                    <p
                      style={{
                        fontSize: "16px",
                        color: "#666",
                        margin: "0 0 32px 0",
                        lineHeight: "1.5",
                      }}
                    >
                      You will be redirected to PayPal so you can connect your PayPal account to Worksyde.
                    </p>
                    
                    {/* PayPal Button */}
                    <button
                      onClick={() => {
                        handlePaypalPayment();
                        setSelectedMethod("");
                      }}
                      style={{
                        background: "#0070ba",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "14px 32px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#005a8b";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#0070ba";
                      }}
                    >
                      <span>Pay with</span>
                      <img
                        src={"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAxcHgiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAxMDEgMzIiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHhtbG5zPSJodHRwOiYjeDJGOyYjeDJGO3d3dy53My5vcmcmI3gyRjsyMDAwJiN4MkY7c3ZnIj48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJNIDEyLjIzNyAyLjggTCA0LjQzNyAyLjggQyAzLjkzNyAyLjggMy40MzcgMy4yIDMuMzM3IDMuNyBMIDAuMjM3IDIzLjcgQyAwLjEzNyAyNC4xIDAuNDM3IDI0LjQgMC44MzcgMjQuNCBMIDQuNTM3IDI0LjQgQyA1LjAzNyAyNC40IDUuNTM3IDI0IDUuNjM3IDIzLjUgTCA2LjQzNyAxOC4xIEMgNi41MzcgMTcuNiA2LjkzNyAxNy4yIDcuNTM3IDE3LjIgTCAxMC4wMzcgMTcuMiBDIDE1LjEzNyAxNy4yIDE4LjEzNyAxNC43IDE4LjkzNyA5LjggQyAxOS4yMzcgNy43IDE4LjkzNyA2IDE3LjkzNyA0LjggQyAxNi44MzcgMy41IDE0LjgzNyAyLjggMTIuMjM3IDIuOCBaIE0gMTMuMTM3IDEwLjEgQyAxMi43MzcgMTIuOSAxMC41MzcgMTIuOSA4LjUzNyAxMi45IEwgNy4zMzcgMTIuOSBMIDguMTM3IDcuNyBDIDguMTM3IDcuNCA4LjQzNyA3LjIgOC43MzcgNy4yIEwgOS4yMzcgNy4yIEMgMTAuNjM3IDcuMiAxMS45MzcgNy4yIDEyLjYzNyA4IEMgMTMuMTM3IDguNCAxMy4zMzcgOS4xIDEzLjEzNyAxMC4xIFoiPjwvcGF0aD48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJNIDM1LjQzNyAxMCBMIDMxLjczNyAxMCBDIDMxLjQzNyAxMCAzMS4xMzcgMTAuMiAzMS4xMzcgMTAuNSBMIDMwLjkzNyAxMS41IEwgMzAuNjM3IDExLjEgQyAyOS44MzcgOS45IDI4LjAzNyA5LjUgMjYuMjM3IDkuNSBDIDIyLjEzNyA5LjUgMTguNjM3IDEyLjYgMTcuOTM3IDE3IEMgMTcuNTM3IDE5LjIgMTguMDM3IDIxLjMgMTkuMzM3IDIyLjcgQyAyMC40MzcgMjQgMjIuMTM3IDI0LjYgMjQuMDM3IDI0LjYgQyAyNy4zMzcgMjQuNiAyOS4yMzcgMjIuNSAyOS4yMzcgMjIuNSBMIDI5LjAzNyAyMy41IEMgMjguOTM3IDIzLjkgMjkuMjM3IDI0LjMgMjkuNjM3IDI0LjMgTCAzMy4wMzcgMjQuMyBDIDMzLjUzNyAyNC4zIDM0LjAzNyAyMy45IDM0LjEzNyAyMy40IEwgMzYuMTM3IDEwLjYgQyAzNi4yMzcgMTAuNCAzNS44MzcgMTAgMzUuNDM3IDEwIFogTSAzMC4zMzcgMTcuMiBDIDI5LjkzNyAxOS4zIDI4LjMzNyAyMC44IDI2LjEzNyAyMC44IEMgMjUuMDM3IDIwLjggMjQuMjM3IDIwLjUgMjMuNjM3IDE5LjggQyAyMy4wMzcgMTkuMSAyMi44MzcgMTguMiAyMy4wMzcgMTcuMiBDIDIzLjMzNyAxNS4xIDI1LjEzNyAxMy42IDI3LjIzNyAxMy42IEMgMjguMzM3IDEzLjYgMjkuMTM3IDE0IDI5LjczNyAxNC42IEMgMzAuMjM3IDE1LjMgMzAuNDM3IDE2LjIgMzAuMzM3IDE3LjIgWiI+PC9wYXRoPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Ik0gNTUuMzM3IDEwIEwgNTEuNjM3IDEwIEMgNTEuMjM3IDEwIDUwLjkzNyAxMC4yIDUwLjczNyAxMC41IEwgNDUuNTM3IDE4LjEgTCA0My4zMzcgMTAuOCBDIDQzLjIzNyAxMC4zIDQyLjczNyAxMCA0Mi4zMzcgMTAgTCAzOC42MzcgMTAgQyAzOC4yMzcgMTAgMzcuODM3IDEwLjQgMzguMDM3IDEwLjkgTCA0Mi4xMzcgMjMgTCAzOC4yMzcgMjguNCBDIDM3LjkzNyAyOC44IDM4LjIzNyAyOS40IDM4LjczNyAyOS40IEwgNDIuNDM3IDI5LjQgQyA0Mi44MzcgMjkuNCA0My4xMzcgMjkuMiA0My4zMzcgMjguOSBMIDU1LjgzNyAxMC45IEMgNTYuMTM3IDEwLjYgNTUuODM3IDEwIDU1LjMzNyAxMCBaIj48L3BhdGg+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZD0iTSA2Ny43MzcgMi44IEwgNTkuOTM3IDIuOCBDIDU5LjQzNyAyLjggNTguOTM3IDMuMiA1OC44MzcgMy43IEwgNTUuNzM3IDIzLjYgQyA1NS42MzcgMjQgNTUuOTM3IDI0LjMgNTYuMzM3IDI0LjMgTCA2MC4zMzcgMjQuMyBDIDYwLjczNyAyNC4zIDYxLjAzNyAyNCA2MS4wMzcgMjMuNyBMIDYxLjkzNyAxOCBDIDYyLjAzNyAxNy41IDYyLjQzNyAxNy4xIDYzLjAzNyAxNy4xIEwgNjUuNTM3IDE3LjEgQyA3MC42MzcgMTcuMSA3My42MzcgMTQuNiA3NC40MzcgOS43IEMgNzQuNzM3IDcuNiA3NC40MzcgNS45IDczLjQzNyA0LjcgQyA3Mi4yMzcgMy41IDcwLjMzNyAyLjggNjcuNzM3IDIuOCBaIE0gNjguNjM3IDEwLjEgQyA2OC4yMzcgMTIuOSA2Ni4wMzcgMTIuOSA2NC4wMzcgMTIuOSBMIDYyLjgzNyAxMi45IEwgNjMuNjM3IDcuNyBDIDYzLjYzNyA3LjQgNjMuOTM3IDcuMiA2NC4yMzcgNy4yIEwgNjQuNzM3IDcuMiBDIDY2LjEzNyA3LjIgNjcuNDM3IDcuMiA2OC4xMzcgOCBDIDY4LjYzNyA4LjQgNjguNzM3IDkuMSA2OC42MzcgMTAuMSBaIj48L3BhdGg+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZD0iTSA5MC45MzcgMTAgTCA4Ny4yMzcgMTAgQyA4Ni45MzcgMTAgODYuNjM3IDEwLjIgODYuNjM3IDEwLjUgTCA4Ni40MzcgMTEuNSBMIDg2LjEzNyAxMS4xIEMgODUuMzM3IDkuOSA4My41MzcgOS41IDgxLjczNyA5LjUgQyA3Ny42MzcgOS41IDc0LjEzNyAxMi42IDczLjQzNyAxNyBDIDczLjAzNyAxOS4yIDczLjUzNyAyMS4zIDc0LjgzNyAyMi43IEMgNzUuOTM3IDI0IDc3LjYzNyAyNC42IDc5LjUzNyAyNC42IEMgODIuODM3IDI0LjYgODQuNzM3IDIyLjUgODQuNzM3IDIyLjUgTCA4NC41MzcgMjMuNSBDIDg0LjQzNyAyMy45IDg0LjczNyAyNC4zIDg1LjEzNyAyNC4zIEwgODguNTM3IDI0LjMgQyA4OS4wMzcgMjQuMyA4OS41MzcgMjMuOSA4OS42MzcgMjMuNCBMIDkxLjYzNyAxMC42IEMgOTEuNjM3IDEwLjQgOTEuMzM3IDEwIDkwLjkzNyAxMCBaIE0gODUuNzM3IDE3LjIgQyA4NS4zMzcgMTkuMyA4My43MzcgMjAuOCA4MS41MzcgMjAuOCBDIDgwLjQzNyAyMC44IDc5LjYzNyAyMC41IDc5LjAzNyAxOS44IEMgNzguNDM3IDE5LjEgNzguMjM3IDE4LjIgNzguNDM3IDE3LjIgQyA3OC43MzcgMTUuMSA4MC41MzcgMTMuNiA4Mi42MzcgMTMuNiBDIDgzLjczNyAxMy42IDg0LjUzNyAxNCA4NS4xMzcgMTQuNiBDIDg1LjczNyAxNS4zIDg1LjkzNyAxNi4yIDg1LjczNyAxNy4yIFoiPjwvcGF0aD48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJNIDk1LjMzNyAzLjMgTCA5Mi4xMzcgMjMuNiBDIDkyLjAzNyAyNCA5Mi4zMzcgMjQuMyA5Mi43MzcgMjQuMyBMIDk1LjkzNyAyNC4zIEMgOTYuNDM3IDI0LjMgOTYuOTM3IDIzLjkgOTcuMDM3IDIzLjQgTCAxMDAuMjM3IDMuNSBDIDEwMC4zMzcgMy4xIDEwMC4wMzcgMi44IDk5LjYzNyAyLjggTCA5Ni4wMzcgMi44IEMgOTUuNjM3IDIuOCA5NS40MzcgMyA5NS4zMzcgMy4zIFoiPjwvcGF0aD48L3N2Zz4"}
                        alt="PayPal"
                        style={{ height: "20px" }}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>


    </div>
  );
};

// Helper function to get card brand color
const getCardBrandColor = (brand) => {
  switch (brand?.toLowerCase()) {
    case 'visa':
      return '#1a1f71';
    case 'mastercard':
      return '#eb001b';
    case 'rupay':
      return '#007476';
    case 'amex':
      return '#006fcf';
    default:
      return '#007476';
  }
};

export default BillingAndPaymentsPage;
