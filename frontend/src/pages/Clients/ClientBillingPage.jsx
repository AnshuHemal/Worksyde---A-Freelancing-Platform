import React, { useState, useEffect } from "react";
import ClientSettingsSidebar from "./ClientSettingsSidebar";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import ClientHeader from "../../components/ClientHeader";
import paypal_logo from "../../assets/paypal.svg";
import payment_illustration from "../../assets/payment.svg";
import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { PAYPAL_CONFIG, PAYPAL_BUTTON_STYLES } from "../../config/paypal";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const SIDEBAR_WIDTH = 290;
const API_URL = "http://localhost:5000/api/auth";

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
  
  // Wallet payment states
  const [showPayNowModal, setShowPayNowModal] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");
  const [showPayPalButton, setShowPayPalButton] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0.0);

  // PayPal configuration
  const paypalOptions = {
    "client-id": PAYPAL_CONFIG["client-id"],
    currency: PAYPAL_CONFIG.currency,
    intent: PAYPAL_CONFIG.intent,
    "disable-funding": "venmo,paylater,card",
    components: "buttons",
    environment: PAYPAL_CONFIG.environment,
  };

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

    try {
      const response = await axios.get(`${API_URL}/wallet/balance/`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setWalletBalance(response.data.walletBalance);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
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

  // Add payment card
  const handleAddPaymentCard = async () => {
    if (!userId) return;

    // Basic validation
    if (!cardNumber.replace(/\s/g, '')) {
      setCardError("Card number is required");
      return;
    }
    if (!firstName.trim()) {
      setCardError("First name is required");
      return;
    }
    if (!lastName.trim()) {
      setCardError("Last name is required");
      return;
    }
    if (!expMonth) {
      setCardError("Expiration month is required");
      return;
    }
    if (!expYear) {
      setCardError("Expiration year is required");
      return;
    }
    if (!securityCode) {
      setCardError("Security code is required");
      return;
    }
    if (!address1.trim()) {
      setCardError("Billing address is required");
      return;
    }
    if (!city.trim()) {
      setCardError("City is required");
      return;
    }

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
    if (!userId) return;

    // Basic validation
    if (!paypalEmail.trim()) {
      setPaypalError("PayPal email is required");
      return;
    }
    if (!paypalEmail.includes('@')) {
      setPaypalError("Please enter a valid email address");
      return;
    }

    setSubmittingPaypal(true);
    setPaypalError("");
    setPaypalSuccess("");

    try {
      const response = await axios.post(`${API_URL}/paypal-accounts/add/`, {
        paypalEmail: paypalEmail,
        isDefault: paypalAccounts.length === 0, // Make default if first account
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
    if (!confirm("Are you sure you want to delete this PayPal account?")) return;

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

  // Wallet payment functions
  const handlePayNowClick = () => {
    setShowPayNowModal(true);
    setWalletAmount("");
    setShowPayPalButton(false);
  };

  const handleClosePayNowModal = () => {
    setShowPayNowModal(false);
    setWalletAmount("");
    setShowPayPalButton(false);
    setProcessingPayment(false);
  };

  const handleAmountSubmit = () => {
    if (!walletAmount || parseFloat(walletAmount) <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }
    setShowPayPalButton(true);
  };

  const createWalletPayPalOrder = async (data, actions) => {
    try {
      setProcessingPayment(true);

      const response = await axios.post(
        `${API_URL}/wallet/payment/initiate/`,
        {
          amount: parseFloat(walletAmount),
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        return response.data.paypalOrderId;
      } else {
        throw new Error(response.data.message || "Failed to create PayPal order");
      }
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      toast.error("Failed to create PayPal order. Please try again.");
      throw error;
    } finally {
      setProcessingPayment(false);
    }
  };

  const onWalletPayPalApprove = async (data, actions) => {
    try {
      setProcessingPayment(true);

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
        toast.success("Payment completed successfully! Your wallet has been topped up.");
        fetchWalletBalance(); // Refresh wallet balance
        handleClosePayNowModal();
      } else {
        throw new Error(response.data.message || "Payment capture failed");
      }
    } catch (error) {
      console.error("Error completing PayPal payment:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const onWalletPayPalError = (err) => {
    console.error("PayPal error:", err);
    toast.error("PayPal payment failed. Please try again.");
    setProcessingPayment(false);
  };

  const onWalletPayPalCancel = () => {
    toast.error("Payment was cancelled.");
    setProcessingPayment(false);
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
              ₹{walletBalance.toFixed(2)}
            </div>
            <button
              onClick={handlePayNowClick}
              style={{
                background: "#007674",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 28px",
                fontSize: 18,
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 4,
                width: 150,
                textAlign: "center",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#005a58";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#007674";
              }}
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
                {paymentCards.length === 0 && paypalAccounts.length === 0 ? (
                  "It looks like you haven't set up a billing method yet. To ensure you're ready to hire when the time comes, please add a billing method at your convenience. This will help streamline the process and make your experience smoother when you're ready to proceed."
                ) : (
                  "Manage your billing methods below."
                )}
              </div>

              {/* Display existing payment cards */}
              {loadingCards ? (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#222", marginBottom: 16 }}>
                    Payment Cards
                  </div>
                  <div style={{ color: "#666", fontSize: 16 }}>Loading payment cards...</div>
                </div>
              ) : paymentCards.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#222", marginBottom: 16 }}>
                    Payment Cards
                  </div>
                  {paymentCards.map((card) => (
                    <div
                      key={card.id}
                      style={{
                        border: "1px solid #e6e6e6",
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 12,
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 40,
                            height: 25,
                            background: getCardBrandColor(card.cardBrand),
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {card.cardBrand?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: "#222" }}>
                            •••• •••• •••• {card.lastFourDigits}
                          </div>
                          <div style={{ fontSize: 14, color: "#666" }}>
                            {card.cardholderName} • Expires {card.expiryMonth}/{card.expiryYear}
                          </div>
                        </div>
                        {card.isDefault && (
                          <span
                            style={{
                              background: "#007476",
                              color: "#fff",
                              padding: "4px 8px",
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            Default
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {!card.isDefault && (
                          <button
                            onClick={() => handleSetDefaultCard(card.id)}
                            style={{
                              background: "none",
                              border: "1px solid #007476",
                              color: "#007476",
                              padding: "6px 12px",
                              borderRadius: 4,
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          style={{
                            background: "none",
                            border: "1px solid #dc3545",
                            color: "#dc3545",
                            padding: "6px 12px",
                            borderRadius: 4,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Display existing PayPal accounts */}
              {loadingPaypal ? (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#222", marginBottom: 16 }}>
                    PayPal Accounts
                  </div>
                  <div style={{ color: "#666", fontSize: 16 }}>Loading PayPal accounts...</div>
                </div>
              ) : paypalAccounts.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#222", marginBottom: 16 }}>
                    PayPal Accounts
                  </div>
                  {paypalAccounts.map((account) => (
                    <div
                      key={account.id}
                      style={{
                        border: "1px solid #e6e6e6",
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 12,
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                          src={paypal_logo}
                          alt="PayPal"
                          style={{ width: 60, height: 20 }}
                        />
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: "#222" }}>
                            {account.paypalEmail}
                          </div>
                          <div style={{ fontSize: 14, color: "#666" }}>
                            PayPal Account
                          </div>
                        </div>
                        {account.isDefault && (
                          <span
                            style={{
                              background: "#007476",
                              color: "#fff",
                              padding: "4px 8px",
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            Default
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {!account.isDefault && (
                          <button
                            onClick={() => handleSetDefaultPaypalAccount(account.id)}
                            style={{
                              background: "none",
                              border: "1px solid #007476",
                              color: "#007476",
                              padding: "6px 12px",
                              borderRadius: 4,
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePaypalAccount(account.id)}
                          style={{
                            background: "none",
                            border: "1px solid #dc3545",
                            color: "#dc3545",
                            padding: "6px 12px",
                            borderRadius: 4,
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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

      {/* Pay Now Modal */}
      {showPayNowModal && (
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
          onClick={handleClosePayNowModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "32px",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "90vh",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e6e6e6",
              overflow: "auto",
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
                Add Money to Wallet
              </h3>
              <motion.button
                onClick={handleClosePayNowModal}
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

            {!showPayPalButton ? (
              <>
                {/* Amount Input Section */}
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#000000",
                    margin: "0 0 16px 0"
                  }}>
                    How many INR do you want to add to your wallet?
                  </h3>
                  
                  <input
                    type="number"
                    placeholder="Enter amount in INR"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
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
                  />
                </div>

                {/* Submit Button */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                  }}
                >
                  <motion.button
                    onClick={handleClosePayNowModal}
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
                    onClick={handleAmountSubmit}
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
                    Continue
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                {/* PayPal Payment Section */}
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#000000",
                    margin: "0 0 16px 0"
                  }}>
                    Complete Payment
                  </h3>
                  
                  <p style={{
                    fontSize: "16px",
                    color: "#666",
                    margin: "0 0 24px 0"
                  }}>
                    Amount: ₹{parseFloat(walletAmount).toFixed(2)} (≈ ${(parseFloat(walletAmount) / 83).toFixed(2)} USD)
                  </p>

                  <PayPalScriptProvider options={paypalOptions}>
                    <PayPalButtons
                      createOrder={createWalletPayPalOrder}
                      onApprove={onWalletPayPalApprove}
                      onError={onWalletPayPalError}
                      onCancel={onWalletPayPalCancel}
                      style={PAYPAL_BUTTON_STYLES}
                      disabled={processingPayment}
                    />
                  </PayPalScriptProvider>
                </div>

                {/* Currency Conversion Notice */}
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #e9ecef",
                    marginTop: "16px",
                  }}
                >
                  <strong style={{ fontSize: "14px", fontWeight: "600" }}>
                    Payment Info:
                  </strong>{" "}
                  <br />
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#121212",
                      lineHeight: "1.4",
                      marginTop: "8px",
                    }}
                  >
                    PayPal will process your payment in USD (approximately ${(parseFloat(walletAmount) / 83).toFixed(2)}) for international compatibility. Your original amount of ₹{parseFloat(walletAmount).toFixed(2)} will be added to your wallet.
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
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
      return '#0066cc';
    case 'amex':
      return '#006fcf';
    default:
      return '#666';
  }
};

export default ClientBillingPage; 