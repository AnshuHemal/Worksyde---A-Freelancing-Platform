import React, { useState, useEffect } from "react";
import ClientSettingsSidebar from "./ClientSettingsSidebar";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import ClientHeader from "../../components/ClientHeader";
import paypal_logo from "../../assets/paypal.svg";
import payment_illustration from "../../assets/payment.svg";

const SIDEBAR_WIDTH = 290;

const ClientBillingPage = () => {
  const { userId } = useUser();
  const navigate = useNavigate();

  // State for showing add method modal
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
  const [paymentCards, setPaymentCards] = useState([]); // Placeholder, no API
  const [loadingCards] = useState(false); // Placeholder
  const [submittingCard, setSubmittingCard] = useState(false);
  const [cardError, setCardError] = useState("");
  const [cardSuccess, setCardSuccess] = useState("");
  // PayPal states
  const [paypalAccounts, setPaypalAccounts] = useState([]); // Placeholder, no API
  const [loadingPaypal] = useState(false); // Placeholder
  const [submittingPaypal, setSubmittingPaypal] = useState(false);
  const [paypalError, setPaypalError] = useState("");
  const [paypalSuccess, setPaypalSuccess] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

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

  // Navigation handler for sidebar
  const handleSidebarNavigate = (key) => {
    switch (key) {
      case "billing":
        navigate("/ws/client/deposit-method");
        break;
      case "info":
        navigate("/ws/client/info");
        break;
      case "security":
        navigate("/ws/client/security");
        break;
      case "notifications":
        navigate("/ws/client/notifications");
        break;
      default:
        break;
    }
  };

  // Helper functions (no API, just UI logic)
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

  // Simulate add card (no API)
  const handleAddPaymentCard = () => {
    setSubmittingCard(true);
    setTimeout(() => {
      setSubmittingCard(false);
      setCardSuccess("Payment card added successfully!");
      setShowAddMethod(false);
      resetCardForm();
    }, 1000);
  };
  // Simulate add PayPal (no API)
  const handleAddPaypalAccount = () => {
    setSubmittingPaypal(true);
    setTimeout(() => {
      setSubmittingPaypal(false);
      setPaypalSuccess("PayPal account added successfully!");
      setPaypalEmail("");
    }, 1000);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fff" }}>
      <ClientSettingsSidebar
        activeKey="billing"
        onNavigate={handleSidebarNavigate}
        clientId={userId}
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

          {/* Company billing cycle card */}
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
              Company billing cycle
            </div>
            <div style={{ color: "#6b6b6b", fontSize: 20, marginBottom: 8 }}>
              Weekly
            </div>
            <div style={{ color: "#444", fontSize: 18 }}>
              Terms: <span style={{ fontWeight: 500 }}>Standard</span>
            </div>
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
              Outstanding balance
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111", marginBottom: 16 }}>
              ₹0.00
            </div>
            <button
              style={{
                background: "#f2f2f2",
                color: "#b0b0b0",
                border: "none",
                borderRadius: 8,
                padding: "12px 28px",
                fontSize: 18,
                fontWeight: 600,
                cursor: "not-allowed",
                marginTop: 4,
                width: 150,
                textAlign: "center",
              }}
              disabled
            >
              Pay now
            </button>
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
It looks like you haven't set up a billing method yet. To ensure you're ready to hire when the time comes, please add a billing method at your convenience. This will help streamline the process and make your experience smoother when you're ready to proceed.              </div>
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
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                      <div style={{ fontSize: 20, fontWeight: 600, color: "#222" }}>
                        Payment card
                      </div>
                      <div style={{ fontSize: 16, color: "#888", marginLeft: "auto" }}>
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
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
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
                            <span style={{ fontSize: 16, color: "#666" }}>?</span>
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
                      <div style={{ fontSize: 22, fontWeight: 600, color: "#222", marginBottom: 16 }}>
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
                              <option>Loading...</option>
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
                          Address line 2 <span style={{ color: "#888", fontWeight: 400 }}>(optional)</span>
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
                            Postal code <span style={{ color: "#888", fontWeight: 400 }}>(optional)</span>
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
                        {submittingCard ? "Adding..." : "Save"}
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
                        {submittingPaypal ? "Adding..." : "Add PayPal Account"}
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
                        style={{ width: "145px", height: "130px" }}
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
                        src={paypal_logo}
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

export default ClientBillingPage; 