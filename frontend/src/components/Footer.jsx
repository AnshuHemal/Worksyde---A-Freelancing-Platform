import React from "react";
import logo from "../assets/worksyde.png";
import {
  FaDribbble,
  FaFacebook,
  FaInstagram,
  FaPinterest,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <>
      <div
        className="container-fluid d-flex align-items-center border border-1 justify-content-center"
        style={{ backgroundColor: "#fff", padding: "10px" }}
      >
        <div className="row bg-white p-3 w-100 justify-content-center align-items-center">
          <div className="row">
            <div className="col-lg-3 col-md-6">
              <h4
                className="mt-3"
                style={{ fontSize: "18px", fontWeight: "600" }}
              >
                For Clients
              </h4>
              <div className="d-flex flex-column mt-3">
                <a href="#" className="footer-a">
                  How Worksyde Works
                </a>
                <a href="#" className="footer-a">
                  Trust & Safety
                </a>
                <a href="#" className="footer-a">
                  Quality Guide
                </a>
                <a href="#" className="footer-a">
                  Worksyde Guides
                </a>
                <a href="#" className="footer-a">
                  Worksyde Answers
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4
                className="mt-3"
                style={{ fontSize: "18px", fontWeight: "600" }}
              >
                For Freelancers
              </h4>

              <div className="d-flex flex-column mt-3">
                <a href="#" className="footer-a">
                  How to Find Work
                </a>
                <a href="#" className="footer-a">
                  Community Hub
                </a>
                <a href="#" className="footer-a">
                  Forum
                </a>
                <a href="#" className="footer-a">
                  Events
                </a>
                <a href="#" className="footer-a">
                  Worksyde Answers
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4
                className="mt-3"
                style={{ fontSize: "18px", fontWeight: "600" }}
              >
                Categories
              </h4>

              <div className="d-flex flex-column mt-3">
                <a href="#" className="footer-a">
                  Accounting & Consulting
                </a>
                <a href="#" className="footer-a">
                  Admin Support
                </a>
                <a href="#" className="footer-a">
                  Customer Service
                </a>
                <a href="#" className="footer-a">
                  Data Science & Analytics
                </a>
                <a href="#" className="footer-a">
                  Design & Creative
                </a>
                <a href="#" className="footer-a">
                  Engineering & Architecture
                </a>
                <a href="#" className="footer-a">
                  IT & Networking
                </a>
                <a href="#" className="footer-a">
                  Sales & Marketing
                </a>
                <a href="#" className="footer-a">
                  Web, Mobile & Software Dev
                </a>
                <a href="#" className="footer-a">
                  Writing & Translation
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4
                className="mt-3"
                style={{ fontSize: "18px", fontWeight: "600" }}
              >
                Company
              </h4>

              <div className="d-flex flex-column mt-3">
                <a href="#" className="footer-a">
                  About Worksyde
                </a>
                <a href="#" className="footer-a">
                  Help & Support
                </a>
                <a href="#" className="footer-a">
                  Careers
                </a>
                <a href="#" className="footer-a">
                  Terms of Service
                </a>
                <a href="#" className="footer-a">
                  Privacy Policy
                </a>
                <a href="#" className="footer-a">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
          <hr className="mt-3" />
          <div className="mt-3 d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column">
              <img
                src={logo}
                alt="logo"
                className="img-fluid m-0"
                style={{ width: "150px" }}
              />{" "}
              <span className="m-0 ms-2" style={{ fontSize: "14px" }}>
                © 2025 Worksyde, All rights reserved.
              </span>
            </div>

            <div className="social-icons text-center">
              <FaXTwitter />
              <FaInstagram />
              <FaFacebook />
              <FaYoutube />
              <FaPinterest />
              <FaDribbble />
            </div>
            <div className="d-flex flex-column text-end">
              <span>₹ INR</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
