import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import AOS from "aos";
import "aos/dist/aos.css";
import Footer from "../components/Footer";
import Google from "../assets/google-logo.png";
import Meta from "../assets/meta-logo.jpg";
import Microsoft from "../assets/microsoft-logo.jpg";
import Odoo from "../assets/odoo-logo.png";
import Infosys from "../assets/infosys-logo.png";
import Cisco from "../assets/cisco-logo.webp";
import Adobe from "../assets/adobe-logo.png";
import IBM from "../assets/ibm-logo.png";
import image1 from "../assets/image1.jpg";
import image2 from "../assets/image2.webp";
import image3 from "../assets/image3.webp";
import image4 from "../assets/image4.webp";
import image5 from "../assets/image5.webp";
import image6 from "../assets/image6.webp";
import image7 from "../assets/image7.webp";
import i1 from "../assets/data-science.jpg";
import i2 from "../assets/design-creative.avif";
import i3 from "../assets/eng-arch.jpg";
import i4 from "../assets/sales-marketing.avif";
import i5 from "../assets/web.avif";
import i6 from "../assets/accounting.avif";
import technology_icon from "../assets/technology-icon.svg";
import reviews_icon from "../assets/reviews-icon.svg";
import arrow_circle from "../assets/arrow_circle_icon.svg";
import banner from "../assets/banner.jpg";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./HomePage.css";

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    if (headingRef.current) {
      observer.observe(headingRef.current);
    }
    return () => {
      if (headingRef.current) {
        observer.unobserve(headingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // Horizontal scroll effect for client logos
  useEffect(() => {
    const initHorizontalScroll = () => {
      const logoWraps = document.querySelectorAll('.clients-one-logo-wrap');
      
      logoWraps.forEach((wrap, index) => {
        if (wrap) {
          // Reset any existing transforms
          wrap.style.transform = 'translateX(0)';
          
          // Create the scroll animation
          const animate = () => {
            const currentTransform = wrap.style.transform;
            const currentX = parseInt(currentTransform.match(/translateX\(([^)]+)\)/)?.[1] || '0');
            
            // Calculate the width to scroll (full width of the content)
            const scrollWidth = wrap.scrollWidth;
            const containerWidth = wrap.parentElement.offsetWidth;
            
            if (scrollWidth > containerWidth) {
              // If content is wider than container, animate
              const newX = currentX - 1; // Move 1px to the left
              
              // Reset to beginning when fully scrolled out
              if (Math.abs(newX) >= scrollWidth - containerWidth) {
                wrap.style.transform = 'translateX(0)';
              } else {
                wrap.style.transform = `translateX(${newX}px)`;
              }
            }
          };
          
          // Start animation with a slight delay for each row
          setTimeout(() => {
            const animationId = setInterval(animate, 30); // 30ms interval for smooth animation
            
            // Store the animation ID for cleanup
            wrap.dataset.animationId = animationId;
          }, index * 1000); // Stagger the start of each row
        }
      });
    };

    // Initialize scroll on mount
    initHorizontalScroll();
    
    // Re-initialize on window resize
    const handleResize = () => {
      // Clear existing animations
      document.querySelectorAll('.clients-one-logo-wrap').forEach(wrap => {
        if (wrap.dataset.animationId) {
          clearInterval(parseInt(wrap.dataset.animationId));
        }
      });
      
      // Re-initialize after a short delay
      setTimeout(initHorizontalScroll, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      document.querySelectorAll('.clients-one-logo-wrap').forEach(wrap => {
        if (wrap.dataset.animationId) {
          clearInterval(parseInt(wrap.dataset.animationId));
        }
      });
    };
  }, []);
  return (
    <div
      style={{
        overflowX: "hidden",
        overflowY: "auto",
        height: "100vh",
      }}
    >
      <Header activeTab="home" />

      <section className="home-one-hero">
        <div className="w-layout-container container w-container">
          <div className="w-layout-vflex home-one-hero-wrapper">
            <div className="home-one-hero-heading">
              <div className="overflow-hidden">
                <h1
                  data-aos="fade-down"
                  style={{
                    fontFamily: "Urbanist",
                    fontWeight: "500",
                    color: "#121212",
                  }}
                >
                  Transforming Freelance Into{" "}
                  <span className="gradient-color-text-one">
                    Seamless Success.
                  </span>
                </h1>
              </div>
              <div className="w-layout-vflex home-one-hero-description margin-auto">
                <div className="overflow-hidden">
                  <p className="body-font-two" data-aos="fade-up">
                    <span>
                      At Worksyde, we make freelancing effortless—connecting you
                      with top talent for smooth, successful project outcomes
                      every time.
                    </span>
                  </p>
                </div>
                <div className="my-3" data-aos="zoom-in">
                  <Link
                    to="/login"
                    className="login-button me-3"
                    style={{ padding: "15px 25px", fontSize: "17px" }}
                  >
                    Get Started, It's Free.
                  </Link>
                </div>
              </div>
            </div>
            <div
              className="dashboard-one-wrap position-relative"
              data-aos="zoom-in"
            >
              <img
                src={image1}
                alt="Dashboard"
                width={992}
                height={668}
                loading="lazy"
                // sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px"
                className="border-radius-twenty responsive-full-height"
              />
            </div>
          </div>
          <div className="w-layout-blockcontainer client-marquee-container w-container">
            <div className="w-layout-vflex marquee-one-wrapper">
              <div className="heading-style-h6 text-align-center">
                <span
                  className="color-dark"
                  style={{ fontFamily: "Urbanist", fontWeight: "600" }}
                >
                  Loved by Game-Changers and Visionaries{" "}
                </span>
              </div>
            </div>
            <div className="w-layout-hflex clients-one-logo-wrapper overflow-hidden">
              <div className="w-layout-hflex clients-one-logo-wrap">
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Google}
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Meta}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Microsoft}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={IBM}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Infosys}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Odoo}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Adobe}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Cisco}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
              </div>
              <div className="w-layout-hflex clients-one-logo-wrap">
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Google}
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Meta}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Microsoft}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={IBM}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Infosys}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Odoo}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Adobe}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
                <div className="w-layout-vflex client-one-logo">
                  <img
                    src={Cisco}
                    alt="logo"
                    width={140}
                    height={41}
                    loading="lazy"
                    className="client-icon"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="w-layout-blockcontainer big-container w-container">
            <div className="about-one-wrapper">
              <div className="w-layout-blockcontainer container w-container">
                <div className="w-layout-vflex about-one-flex-box mx-auto">
                  <div className="container" style={{ textAlign: "center" }}>
                    <div className="top-heading-one">
                      <div className="top-heading">About Worksyde</div>
                    </div>
                  </div>
                  <div
                    className={`about-one-heading-wrap position-relative overflow-hidden ${
                      isVisible ? "animate-fadeInUp" : ""
                    }`}
                    ref={headingRef}
                  >
                    <div
                      className="overflow-hidden"
                      style={{ marginLeft: "40px", marginRight: "40px" }}
                    >
                      <h2
                        className={`about-one-heading-text no-margin ${
                          isVisible ? "animate-zoomIn" : ""
                        }`}
                        style={{ fontFamily: "Urbanist", fontWeight: "500" }}
                      >
                        &quot;We connect you with the best freelancers to turn
                        your ideas into reality,{" "}
                        <span className="gradient-color-text-one">
                          ensuring seamless collaboration{" "}
                        </span>
                        and{" "}
                        <span>
                          delivering results with full transparency and
                          efficiency.&quot;
                        </span>
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="reviews-one overflow-hidden"
        style={{ backgroundColor: "#fcfafd" }}
      >
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-hflex reviews-one-wrapper position-relative">
            <div className="w-layout-vflex reviews-one-content-wrapper position-relative z-index-two">
              <motion.div
                className="top-heading-two border-radius-fifty"
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="text-block">Enterprise Solutions</div>
              </motion.div>

              <motion.div
                className="reviews-one-heading padding-button-twenty-three"
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="overflow-hidden">
                  <h2
                    className="no-margin"
                    style={{ fontFamily: "Urbanist", fontWeight: "500" }}
                  >
                    This is How{" "}
                    <motion.span
                      className="gradient-color-text-one"
                      style={{ fontFamily: "Urbanist" }}
                      whileInView={{ opacity: 1, x: 0 }}
                      initial={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.7 }}
                      viewport={{ once: true, amount: 0.2 }}
                    >
                      Good Companies{" "}
                    </motion.span>
                    Find Good Company.
                  </h2>
                </div>
              </motion.div>

              <motion.div
                className="reviews-one-description overflow-hidden"
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <motion.p
                  className="no-margin"
                  style={{
                    color: "#121212",
                    fontFamily: "Urbanist",
                    fontSize: "18px",
                  }}
                  whileInView={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  Gain access to the top 1% of professionals on Worksyde, along
                  with a powerful toolkit to manage your hybrid teams.
                </motion.p>

                <motion.p
                  className="no-margin mt-3"
                  style={{
                    color: "#121212",
                    fontFamily: "Urbanist",
                    fontSize: "18px",
                  }}
                  whileInView={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  This is the future of{" "}
                  <span style={{ color: "#007476" }}>smart & flexible</span>{" "}
                  work.
                </motion.p>
              </motion.div>

              <div className="w-layout-vflex reviews-one-iconbox-wrap">
                <motion.div
                  className="w-layout-hflex reviews-one-iconbox"
                  whileInView={{ opacity: 1, x: 0 }}
                  initial={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <img src={reviews_icon} alt="logo" loading="lazy" />
                  <p className="reviews-one-iconbox-text no-margin">
                    Find the right talent to fill skill gaps with ease.
                  </p>
                </motion.div>

                <motion.div
                  className="w-layout-hflex reviews-one-iconbox"
                  whileInView={{ opacity: 1, x: 0 }}
                  initial={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <img src={reviews_icon} alt="logo" loading="lazy" />
                  <p className="reviews-one-iconbox-text no-margin">
                    Simplify hiring, organizing, and paying your team.
                  </p>
                </motion.div>

                <motion.div
                  className="w-layout-hflex reviews-one-iconbox"
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <img src={reviews_icon} alt="logo" loading="lazy" />
                  <p className="reviews-one-iconbox-text no-margin">
                    Get expert support from Worksyde every step of the way.
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="w-layout-hflex image-wrapper position-relative z-index-two">
              <motion.img
                src={image4}
                alt="image"
                width={669}
                height="auto"
                loading="lazy"
                className="border-radius-twenty responsive-full-width"
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true, amount: 0.2 }}
              />
              <motion.div
                className="reviews-one-position-image"
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <img
                  src={image5}
                  alt="image"
                  width={144}
                  height={196}
                  loading="lazy"
                  className="reviews-one-position-image-one border-radius-ten"
                />
              </motion.div>
            </div>
          </div>

          <div className="w-layout-hflex reviews-one-wrapper two position-relative">
            <motion.div
              className="w-layout-hflex card-image-wrapper-two position-relative"
              whileInView={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="laptop-image-two">
                <img
                  src={image6}
                  alt="Laptop"
                  width={673}
                  height={425}
                  loading="lazy"
                  className="laptop-image"
                />
              </div>

              <motion.div
                className="card-position-image"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <img
                  src={image7}
                  alt="image"
                  width={218}
                  height={107}
                  loading="lazy"
                  className="border-radius-ten"
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="w-layout-vflex reviews-one-content-wrapper position-relative z-index-two"
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="top-heading-two border-radius-fifty">
                <div className="text-block">For Clients</div>
              </div>

              <motion.div
                className="reviews-one-heading padding-button-twenty-three"
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="overflow-hidden">
                  <h2
                    className="no-margin"
                    style={{ fontFamily: "Urbanist", fontWeight: "500" }}
                  >
                    Discover the Right Talent,{" "}
                    <motion.span
                      className="gradient-color-text-one"
                      whileInView={{ opacity: 1, x: 0 }}
                      initial={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true, amount: 0.2 }}
                    >
                      on Your Terms.
                    </motion.span>
                  </h2>
                </div>
              </motion.div>
              <motion.div
                className="reviews-one-description overflow-hidden"
                whileInView={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <motion.p
                  className="no-margin"
                  style={{
                    color: "#121212",
                    fontFamily: "Urbanist",
                    fontSize: "18px",
                  }}
                  whileInView={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  Connect with a vast network of skilled freelancers and get
                  work done—whether it’s a fast task or a major project{" "}
                  <span style={{ color: "#007476" }}>overhaul.</span>
                </motion.p>
              </motion.div>
              <div className="w-layout-vflex reviews-one-iconbox-wrap">
                <motion.div
                  className="w-layout-hflex reviews-one-iconbox"
                  whileInView={{ opacity: 1, x: 0 }}
                  initial={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <img src={reviews_icon} alt="logo" loading="lazy" />
                  <p className="reviews-one-iconbox-text no-margin">
                    Post a job and hire a professional.
                  </p>
                </motion.div>

                <motion.div
                  className="w-layout-hflex reviews-one-iconbox"
                  whileInView={{ opacity: 1, x: 0 }}
                  initial={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <img src={reviews_icon} alt="logo" loading="lazy" />
                  <p className="reviews-one-iconbox-text no-margin">
                    Browse and buy some projects.
                  </p>
                </motion.div>

                <motion.div
                  className="w-layout-hflex reviews-one-iconbox"
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <img src={reviews_icon} alt="logo" loading="lazy" />
                  <p className="reviews-one-iconbox-text no-margin">
                    Let us help you find the right talent.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.div
        className="three-sections-linear-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <section className="counter-three">
          <div className="w-layout-blockcontainer container w-container">
            <div className="w-layout-vflex counter-three-wrapper">
              <motion.div
                className="w-layout-hflex counter-three-heading-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <div className="counter-three-heading overflow-hidden">
                  <h2
                    className="no-margin"
                    style={{ fontFamily: "Urbanist", fontWeight: "500" }}
                  >
                    Harness the{" "}
                    <span className="gradient-color-text-one">
                      Power of AI{" "}
                    </span>
                    for Smarter Freelancing.
                  </h2>
                </div>
                <div className="counter-three-text">
                  <p
                    data-w-id="3b223cb4-f7c2-fb95-08e6-cb69df35591f"
                    className="no-margin"
                  >
                    <span className="color-dark">
                      Transform your freelancing experience with AI-driven tools
                      designed to help you connect with top talent, manage
                      projects effortlessly, and optimize every aspect of your
                      workflow. Whether you're building a portfolio, crafting
                      the perfect proposal, or finding the ideal client, AI
                      makes it smarter, faster, and easier.
                    </span>
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="w-layout-grid counter-three-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <motion.div
                  className="w-layout-vflex counter-three-wrap"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  <div className="w-layout-hflex counter-wrap">
                    <div className="heading-style-h1 color-blue">99 %</div>
                  </div>
                  <div className="heading-style-h6 color-dark">
                    On-Time Project Delivery
                  </div>
                  <div className="counter-three-line"></div>
                </motion.div>

                <motion.div
                  className="w-layout-vflex counter-three-wrap"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  <div className="w-layout-hflex counter-wrap">
                    <div className="heading-style-h1 color-blue">20k +</div>
                  </div>
                  <div className="heading-style-h6 color-dark">
                    Freelancers Worldwide
                  </div>
                  <div className="counter-three-line"></div>
                </motion.div>

                <motion.div
                  className="w-layout-vflex counter-three-wrap"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                >
                  <div className="w-layout-hflex counter-wrap">
                    <div className="heading-style-h1 color-blue">2k +</div>
                  </div>
                  <div className="heading-style-h6 color-dark">
                    Projects Completed
                  </div>
                  <div className="counter-three-line"></div>
                </motion.div>

                <motion.div
                  className="w-layout-vflex counter-three-wrap"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                >
                  <div className="w-layout-hflex counter-wrap">
                    <div className="heading-style-h1 color-blue">95%</div>
                  </div>
                  <div className="heading-style-h6 color-dark">
                    Client Satisfaction Rate
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          <motion.section
            className="hero"
            style={{
              backgroundImage: "none",
              backgroundColor: "#fcfafd",
              paddingTop: "50px",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
          >
            <div className="w-layout-blockcontainer container w-container">
              <div className="w-layout-vflex hero-four-wrapper">
                <motion.div
                  className="hero-four-image overflow-hidden border-radius-twenty"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 1.6 }}
                >
                  <img
                    width="1290"
                    data-w-id="3b223cb4-f7c2-fb95-08e6-cb69df355913"
                    alt="banner"
                    src={banner}
                    loading="lazy"
                    sizes="(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px"
                    className="border-radius-twenty responsive-full-width"
                  />
                </motion.div>
              </div>
            </div>
          </motion.section>
        </section>

        <section className="marquee-three">
          <div className="w-layout-hflex marquee-three-wrap">
            <div className="w-layout-hflex clients-one-logo-wrap clients-two-logo-wrap">
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  Web Development
                </div>
              </div>

              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text color-dark">
                  AI Resume Builder
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  SEO Optimization
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text color-dark">
                  Content Writing
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  Graphic Design
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text color-dark">
                  Social Media Management
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  Digital Marketing
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text color-dark">
                  Blockchain Development
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo clients-logo-two">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  Design UI/UX
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <div className="about-one-marquee-text color-dark">
                  Mobile Application
                </div>
              </div>
            </div>

            <div className="w-layout-hflex clients-one-logo-wrap clients-two-logo-wrap">
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  Web Development
                </div>
              </div>

              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text color-dark">
                  AI Resume Builder
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  SEO Optimization
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text color-dark">
                  Content Writing
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  Graphic Design
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text color-dark">
                  Social Media Management
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  Digital Marketing
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text color-dark">
                  Blockchain Development
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo clients-logo-two">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  Design UI/UX
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <div className="about-one-marquee-text color-dark">
                  Mobile Application
                </div>
              </div>
            </div>

            <div className="w-layout-hflex clients-one-logo-wrap clients-two-logo-wrap">
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  Web Development
                </div>
              </div>

              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text color-dark">
                  AI Resume Builder
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  SEO Optimization
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text color-dark">
                  Content Writing
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  Graphic Design
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text color-dark">
                  Social Media Management
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  Digital Marketing
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo">
                <div className="about-one-marquee-text color-dark">
                  Blockchain Development
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo clients-logo-two">
                <div className="about-one-marquee-text marquee-gradient-one-text">
                  Design UI/UX
                </div>
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <img
                  width="74"
                  height="74"
                  alt="icon"
                  src={arrow_circle}
                  loading="lazy"
                  className="client-icon"
                />
              </div>
              <div className="w-layout-vflex clients-one-logo home-one-clients-logo-one">
                <div className="about-one-marquee-text color-dark">
                  Mobile Application
                </div>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
      <section
        className="features-solution-section"
        style={{ backgroundImage: "linear-gradient(#fcfafd, #fcfafd 50%)" }}
      >
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-vflex features-solution-wrapper">
            <div className="w-layout-grid empowering-one-first-grid">
              <div className="empowering-one-content-box empowering-one-content-box-two border-radius-twenty">
                <div className="empowering-one-image-wrap empowering-one-image-wrap-two">
                  <div className="w-layout-hflex empowering-one-image-wrapper">
                    <img
                      style={{ height: "250px" }}
                      alt="Dashboard"
                      src={i1}
                      loading="lazy"
                      sizes="(max-width: 479px) 100vw, 374px"
                      className="border-radius-twenty responsive-full-width full-height"
                    />
                  </div>
                  <div className="empowering-one-box-content empowering-one-content-box-one">
                    <div
                      data-w-id="1cbb85f3-024a-7a5b-1908-be77e468cda5"
                      className="heading-style-h6"
                    >
                      Data Science & Analytics
                    </div>
                    <div className="empowering-one-text">
                      <p
                        data-w-id="1cbb85f3-024a-7a5b-1908-be77e468cda8"
                        className="no-margin"
                      >
                        Data Science & Analytics turn complex data into
                        actionable insights, driving smarter decisions and
                        business growth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="empowering-one-content-box empowering-one-box-wrapper-two border-radius-twenty empowering-one-content-box-two">
                <div className="empowering-one-image-wrap">
                  <img
                    style={{ height: "250px" }}
                    alt="Dashboard"
                    src={i2}
                    loading="lazy"
                    sizes="(max-width: 479px) 100vw, 374px"
                    className="border-radius-twenty responsive-full-width full-height"
                  />
                </div>
                <div className="empowering-one-box-content empowering-one-content-box-one">
                  <div
                    data-w-id="58375783-f309-ce9e-a848-91412a65ceb3"
                    className="heading-style-h6"
                  >
                    Design & Creative
                  </div>
                  <div className="empowering-one-text">
                    <p
                      data-w-id="58375783-f309-ce9e-a848-91412a65ceb6"
                      className="no-margin"
                    >
                      Design & Creative combine innovation and aesthetics to
                      craft visually impactful and functional experiences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="empowering-one-content-box empowering-one-box-wrapper-two border-radius-twenty empowering-one-content-box-two">
                <div className="empowering-one-image-wrap">
                  <img
                    style={{ height: "250px" }}
                    alt="Dashboard"
                    src={i3}
                    loading="lazy"
                    sizes="(max-width: 479px) 100vw, 362px"
                    className="border-radius-twenty responsive-full-width full-height"
                  />
                </div>
                <div className="empowering-one-box-content empowering-one-content-box-one">
                  <div
                    data-w-id="968c2f1f-3514-0a77-95d8-3fdf92c5259d"
                    className="heading-style-h6"
                  >
                    Engineering & Architecture
                  </div>
                  <div className="empowering-one-text">
                    <p
                      data-w-id="968c2f1f-3514-0a77-95d8-3fdf92c525a0"
                      className="no-margin"
                    >
                      Combines technical expertise and creative design to build
                      functional, sustainable, and visually stunning structures.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-layout-grid empowering-one-first-grid">
              <div
                data-w-id="b7c11934-7fc5-8165-07cb-5cf33d34745a"
                className="empowering-one-content-box empowering-one-content-box-two border-radius-twenty"
              >
                <div className="empowering-one-image-wrap empowering-one-image-wrap-two">
                  <div className="w-layout-hflex empowering-one-image-wrapper">
                    <img
                      style={{ height: "250px" }}
                      alt="Dashboard"
                      src={i4}
                      loading="lazy"
                      sizes="(max-width: 479px) 100vw, 374px"
                      className="border-radius-twenty responsive-full-width full-height"
                    />
                  </div>
                  <div className="empowering-one-box-content empowering-one-content-box-one">
                    <div
                      data-w-id="1cbb85f3-024a-7a5b-1908-be77e468cda5"
                      className="heading-style-h6"
                    >
                      Sales & Marketing
                    </div>
                    <div className="empowering-one-text">
                      <p
                        data-w-id="1cbb85f3-024a-7a5b-1908-be77e468cda8"
                        className="no-margin"
                      >
                        Drives business growth by connecting products with
                        customers through strategic outreach & compelling
                        messaging
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                data-w-id="b7c11934-7fc5-8165-07cb-5cf33d347469"
                className="empowering-one-content-box empowering-one-box-wrapper-two border-radius-twenty empowering-one-content-box-two"
              >
                <div className="empowering-one-image-wrap">
                  <img
                    style={{ height: "250px" }}
                    alt="Dashboard"
                    src={i5}
                    loading="lazy"
                    sizes="(max-width: 479px) 100vw, 374px"
                    className="border-radius-twenty responsive-full-width full-height"
                  />
                </div>
                <div className="empowering-one-box-content empowering-one-content-box-one">
                  <div
                    data-w-id="58375783-f309-ce9e-a848-91412a65ceb3"
                    className="heading-style-h6"
                  >
                    Web, Mobile & Software Dev
                  </div>
                  <div className="empowering-one-text">
                    <p
                      data-w-id="58375783-f309-ce9e-a848-91412a65ceb6"
                      className="no-margin"
                    >
                      Web, Mobile & Software Development create innovative
                      digital solutions that enhance user experiences and drive
                      business success across platforms.
                    </p>
                  </div>
                </div>
              </div>

              <div
                data-w-id="968c2f1f-3514-0a77-95d8-3fdf92c52599"
                className="empowering-one-content-box empowering-one-box-wrapper-two border-radius-twenty empowering-one-content-box-two"
              >
                <div className="empowering-one-image-wrap">
                  <img
                    style={{ height: "250px" }}
                    alt="Dashboard"
                    src={i6}
                    loading="lazy"
                    sizes="(max-width: 479px) 100vw, 362px"
                    className="border-radius-twenty responsive-full-width full-height"
                  />
                </div>
                <div className="empowering-one-box-content empowering-one-content-box-one">
                  <div
                    data-w-id="968c2f1f-3514-0a77-95d8-3fdf92c5259d"
                    className="heading-style-h6"
                  >
                    Accounting & Consulting
                  </div>
                  <div className="empowering-one-text">
                    <p
                      data-w-id="968c2f1f-3514-0a77-95d8-3fdf92c525a0"
                      className="no-margin"
                    >
                      Accounting & Consulting provide expert financial insights
                      and strategic advice to help businesses optimize
                      operations and achieve long-term success.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        className="technology-one-section"
        style={{ backgroundColor: "#fcfafd" }}
      >
        <div className="w-layout-blockcontainer container w-container">
          <div className="w-layout-hflex technology-one-wrapper">
            <motion.div
              className="technology-one-image-wrap"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <img
                width="519"
                height="597"
                alt="image"
                src={image3}
                loading="lazy"
                className="border-radius-twenty responsive-full-width responsive-full-height"
              />
              <motion.div
                className="technology-one-position-image border-radius-twenty"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <img
                  width="291.48"
                  height="178.27"
                  alt="image"
                  src={image2}
                  loading="lazy"
                  className="border-radius-twenty"
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="w-layout-vflex technology-one-content-wrapper responsive-full-width"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div
                className="technology-one-heading padding-button-twenty-three overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <h2
                  className="no-margin"
                  style={{ fontFamily: "Urbanist", fontWeight: "500" }}
                >
                  The <span className="gradient-color-text-one">premium</span>{" "}
                  freelance solution for business.
                </h2>
              </motion.div>

              <motion.div
                className="w-layout-hflex technology-one-list-item mt-3"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="technology-one-list-text">
                  <p className="no-margin reviews-one-iconbox-text">
                    Dedicated Hiring Experts <br />
                  </p>
                </div>
              </motion.div>
              <motion.span
                className="reviews-one-iconbox-text mx-3"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                Count on an account manager to find you the right talent and see
                to your project’s every need.
              </motion.span>

              <motion.div
                className="w-layout-hflex technology-one-list-item mt-3"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="technology-one-list-text">
                  <p className="no-margin reviews-one-iconbox-text">
                    Satisfaction Guarantee
                  </p>
                </div>
              </motion.div>
              <motion.span
                className="reviews-one-iconbox-text mx-3"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                Order confidently, with guaranteed refunds for
                less-than-satisfactory deliveries.
              </motion.span>

              <motion.div
                className="w-layout-hflex technology-one-list-item mt-3"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="technology-one-list-text">
                  <p className="no-margin reviews-one-iconbox-text">
                    Advanced Management Tools
                  </p>
                </div>
              </motion.div>
              <motion.span
                className="reviews-one-iconbox-text mx-3"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                Seamlessly integrate freelancers into your team and projects.
              </motion.span>

              <motion.div
                className="w-layout-hflex technology-one-list-item mt-3"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="technology-one-list-text">
                  <p className="no-margin reviews-one-iconbox-text">
                    Flexible Payment Models
                  </p>
                </div>
              </motion.div>
              <motion.span
                className="reviews-one-iconbox-text mx-3"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                Pay per project or opt for hourly rates to facilitate
                longer-term collaboration.
              </motion.span>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
