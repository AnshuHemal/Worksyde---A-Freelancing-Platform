import React, { useState } from "react";
import Header1 from "../../components/Header1";
import jobReview from "../../assets/job_review.svg";
import { motion } from "framer-motion";
import { BsEnvelope, BsClock, BsStar, BsArrowRight } from "react-icons/bs";
import axios from "axios";
import toast from "react-hot-toast";

const ClientJobVerifyEmail = () => {
  const [isResending, setIsResending] = useState(false);

  const handleCheckMail = () => {
    window.open("https://mail.google.com", "_blank");
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await axios.post(
        "http://localhost:5000/api/auth/resend-verification-email/",
        {},
        { withCredentials: true }
      );
      toast.success("Verification email resent!");
    } catch (err) {
      toast.error("Failed to resend email. Try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <style>{`
        .verify-card {
          border-radius: 25px;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          box-shadow: 0 6px 24px rgba(0, 118, 116, 0.10);
          border: 1px solid rgba(0, 118, 116, 0.08);
          font-family: Urbanist, sans-serif;
          font-weight: 500;
          transition: box-shadow 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .verify-card:hover {
          box-shadow: 0 12px 32px rgba(0, 118, 116, 0.18);
        }
        .verify-btn {
          border-radius: 50px;
          padding: 14px 36px;
          font-weight: 600;
          font-size: 1.1rem;
          background: linear-gradient(135deg, #007674 0%, #005a58 100%);
          color: #fff;
          border: none;
          box-shadow: 0 6px 20px rgba(0, 118, 116, 0.18);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .verify-btn:disabled {
          background: #ccc;
          box-shadow: none;
          cursor: not-allowed;
        }
        .verify-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #121212 0%, #0a0a0a 100%);
          box-shadow: 0 8px 25px rgba(18, 18, 18, 0.18);
        }
        .verify-illustration {
          width: 100% !important;
          height: 250px !important;
          margin-bottom: 16px;
          object-fit: cover;
        }
        .resend-btn {
          border-radius: 50px;
          padding: 12px 28px;
          font-weight: 500;
          font-size: 1rem;
          background: #f0f9f9;
          color: #007674;
          border: 1.5px solid #007674;
          margin-top: 12px;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .resend-btn:disabled {
          color: #aaa;
          border-color: #ccc;
          background: #f5f5f5;
          cursor: not-allowed;
        }
        .resend-btn:hover:not(:disabled) {
          background: #e8f4f4;
          color: #005a58;
          border-color: #005a58;
        }
      `}</style>
      <Header1 />
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
          <div className="row g-4">
            {/* Left Column - Main Content */}
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="card border-0 shadow-lg h-100 verify-card"
                style={{
                  borderRadius: "25px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  border: "1px solid rgba(0, 118, 116, 0.1)",
                }}
              >
                <div className="card-body p-5">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center mb-5"
                  >
                    <img
                      src={jobReview}
                      alt="Verify Email Illustration"
                      className="verify-illustration"
                    />
                    <h2
                      className="fw-semibold mb-2"
                      style={{ color: "#121212", fontSize: "2.3rem", letterSpacing: '0.3px' }}
                    >
                      Verify Your Email
                    </h2>
                    <p
                      className="mb-3"
                      style={{
                        color: "#121212",
                        fontSize: "1.2rem",
                        lineHeight: 1.6,
                      }}
                    >
                      We’ve sent a verification link to your email address.
                      <br />
                      Please check your inbox and click the link to continue.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="d-flex flex-column flex-md-row gap-3 justify-content-center"
                  >
                    <button
                      className="verify-btn"
                      onClick={handleCheckMail}
                      style={{ minWidth: 200 }}
                    >
                      <BsEnvelope className="me-2" size={22} />
                      Check Email
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
            {/* Right Column - Info & Tips */}
            <div className="col-lg-4">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="card border-0 shadow-lg h-100 verify-card"
                style={{
                  borderRadius: "25px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  border: "1px solid rgba(0, 118, 116, 0.1)",
                }}
              >
                <div className="card-body p-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mb-4"
                  >
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212" }}
                    >
                      What Happens Next?
                    </h5>
                    <div
                      className="p-3 rounded-3"
                      style={{
                        border: "1px solid #e3e3e3",
                      }}
                    >
                      <h6
                        className="fw-semibold mb-2"
                        style={{ color: "#007674" }}
                      >
                        Review Timeline
                      </h6>
                      <div className="d-flex align-items-center mb-2">
                        <BsClock
                          className="me-2"
                          style={{ color: "#007674" }}
                        />
                        <span
                          className="fw-semibold"
                          style={{ color: "#007674" }}
                        >
                          5-10 Minutes
                        </span>
                      </div>
                      <p
                        className="mb-0"
                        style={{ color: "#121212", fontSize: "1.1rem" }}
                      >
                        It usually takes a few minutes for the email to arrive.
                        Be sure to check your spam folder.
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <h5
                      className="fw-semibold mb-3"
                      style={{ color: "#121212" }}
                    >
                      <BsStar className="me-2" style={{ color: "#007674" }} />
                      Tips
                    </h5>
                    <div
                      className="p-3 rounded-3"
                      style={{
                        border: "1px solid #e3e3e3",
                      }}
                    >
                      <ul
                        className="mb-0"
                        style={{ color: "#121212", fontSize: "1.1rem" }}
                      >
                        <li className="mb-2">
                          Check your spam or promotions folder
                        </li>
                        <li className="mb-2">
                          Make sure your email address is correct
                        </li>
                        <li className="mb-2">
                          Still no email? Try resending or contact support
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientJobVerifyEmail;
