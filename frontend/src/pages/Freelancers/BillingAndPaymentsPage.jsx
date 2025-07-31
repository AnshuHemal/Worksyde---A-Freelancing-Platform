import React, { useState, useEffect } from "react";
import axios from "axios";
import FreelancersSettingsSidebar from "./FreelancersSettingsSidebar";
import { useNavigate } from "react-router-dom";
import paypal_logo from "../../assets/paypal.svg";

const SIDEBAR_WIDTH = 290;

const BillingAndPaymentsPage = () => {
  const navigate = useNavigate();
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
  const [userId, setUserId] = useState(null);

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
    axios
      .get("http://localhost:5000/api/auth/current-user/", {
        withCredentials: true,
      })
      .then((res) => setUserId(res.data.user._id))
      .catch(() => setUserId(null));
  }, []);

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
          style={{ width: "100%", maxWidth: 900, padding: "28px 0 0 0" }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              marginBottom: 32,
              color: "#222",
              textAlign: "left",
            }}
          >
            Billing & Payments
          </div>
          {/* Billing methods card */}
          {!showAddMethod ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e6e6e6",
                borderRadius: 12,
                padding: 36,
                width: "100%",
                boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
                minHeight: 200,
                marginTop: 8,
                marginBottom: 16,
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
                  fontSize: 17,
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
                width: "100%",
                boxShadow: "0 1px 8px 0 rgba(60,72,100,0.04)",
                minHeight: 200,
                marginTop: 8,
                marginBottom: 16,
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
                onClick={() => setShowAddMethod(false)}
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
                    fontSize: 18,
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
                      fontSize: 15,
                      marginLeft: 12,
                    }}
                  >
                    Visa, Mastercard, Rupay
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
                      ×
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
                        style={{ fontSize: 18, fontWeight: 600, color: "#222" }}
                      >
                        Payment card
                      </div>
                      <div
                        style={{
                          fontSize: 14,
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
                          fontSize: 14,
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
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            paddingLeft: "48px",
                            border: "1px solid #e6e6e6",
                            borderRadius: 8,
                            fontSize: 16,
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
                            <span style={{ fontSize: 12, color: "#666" }}>
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
                            fontSize: 14,
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
                            fontSize: 16,
                            outline: "none",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 14,
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
                            fontSize: 16,
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
                            fontSize: 14,
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
                            fontSize: 16,
                            outline: "none",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 14,
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
                            fontSize: 16,
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
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#222",
                            }}
                          >
                            Security code
                          </label>
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: "1px solid #ccc",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                            title="Help"
                          >
                            <span style={{ fontSize: 10, color: "#666" }}>
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
                            fontSize: 16,
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Billing Address Section */}
                    <div>
                      <div
                        style={{
                          fontSize: 18,
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
                            fontSize: 14,
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
                              fontSize: 16,
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
                            fontSize: 14,
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
                            fontSize: 16,
                            outline: "none",
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 14,
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
                            fontSize: 16,
                            outline: "none",
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: 14,
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
                              fontSize: 16,
                              outline: "none",
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: 14,
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
                              fontSize: 16,
                              outline: "none",
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        style={{
                          marginTop: 24,
                          background: "#007476",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 16,
                          border: "none",
                          borderRadius: 8,
                          padding: "12px 24px",
                          cursor: "pointer",
                          alignSelf: "flex-start",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#005a58";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#007476";
                        }}
                      >
                        Save
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
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BillingAndPaymentsPage;
