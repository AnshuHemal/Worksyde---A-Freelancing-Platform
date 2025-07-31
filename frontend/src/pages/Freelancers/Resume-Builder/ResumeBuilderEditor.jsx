import React from "react";
import { useParams } from "react-router-dom";

const ResumeBuilderEditor = () => {
  const { resumeId } = useParams();

  return (
    <div
      style={{ minHeight: "100vh", background: "#f8f9fa", padding: "32px 0" }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 22,
            fontFamily: "Urbanist, sans-serif",
            color: "#121212",
            marginBottom: 24,
            letterSpacing: 0.5,
          }}
        >
          Freelance Figma Designer Resume{" "}
          <span style={{ color: "#007674", fontWeight: 400, fontSize: 16 }}>
            (ID: {resumeId})
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Left: Form Section */}
          <div
            style={{
              flex: 1.2,
              minWidth: 340,
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              padding: 32,
              marginBottom: 24,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18 }}>
              Personal Information
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", gap: 18 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{ fontWeight: 500, color: "#666", fontSize: 15 }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full Name"
                    style={{
                      borderRadius: 10,
                      border: "1.5px solid #e3e3e3",
                      padding: "10px 14px",
                      fontSize: 16,
                      marginTop: 4,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{ fontWeight: 500, color: "#666", fontSize: 15 }}
                  >
                    Designation
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Designation"
                    style={{
                      borderRadius: 10,
                      border: "1.5px solid #e3e3e3",
                      padding: "10px 14px",
                      fontSize: 16,
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontWeight: 500, color: "#666", fontSize: 15 }}>
                  Summary
                </label>
                <textarea
                  className="form-control"
                  placeholder="Summary"
                  rows={3}
                  style={{
                    borderRadius: 10,
                    border: "1.5px solid #e3e3e3",
                    padding: "10px 14px",
                    fontSize: 16,
                    marginTop: 4,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                <button
                  className="btn"
                  style={{
                    background: "#ede9fe",
                    color: "#7c3aed",
                    borderRadius: 10,
                    fontWeight: 600,
                    padding: "10px 22px",
                    border: "none",
                  }}
                >
                  Back
                </button>
                <button
                  className="btn"
                  style={{
                    background: "#f3f3f3",
                    color: "#222",
                    borderRadius: 10,
                    fontWeight: 600,
                    padding: "10px 22px",
                    border: "none",
                  }}
                >
                  Save & Exit
                </button>
                <button
                  className="btn"
                  style={{
                    background: "#a78bfa",
                    color: "#fff",
                    borderRadius: 10,
                    fontWeight: 600,
                    padding: "10px 22px",
                    border: "none",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          {/* Right: Resume Preview */}
          <div
            style={{
              flex: 1,
              minWidth: 320,
              background: "#f3f4f6",
              borderRadius: 18,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              padding: 32,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="Profile"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                }}
              />
              <div>
                <div
                  style={{ fontWeight: 700, fontSize: 17, color: "#121212" }}
                >
                  Lena Morgan
                </div>
                <div style={{ color: "#666", fontSize: 14 }}>
                  Freelance UI/UX & Figma Designer
                </div>
              </div>
            </div>
            <div
              style={{
                color: "#222",
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 8,
              }}
            >
              Professional Summary
            </div>
            <div style={{ color: "#444", fontSize: 14, marginBottom: 18 }}>
              Independent product designer with a passion for clean interfaces
              and smooth user flows. Specialized in Figma. I help startups and
              solo founders turn ideas into beautiful, usable digital products —
              fast.
            </div>
            <div
              style={{
                color: "#222",
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 8,
              }}
            >
              Work Experience
            </div>
            <div style={{ color: "#444", fontSize: 14, marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>
                Freelance & Contract{" "}
                <span
                  style={{
                    color: "#888",
                    fontWeight: 400,
                    fontSize: 13,
                    marginLeft: 8,
                  }}
                >
                  Jan 2020 - Apr 2025
                </span>
              </div>
              <div>
                Worked with over 25+ clients across SaaS, healthtech, edtech,
                and e-commerce. Delivered responsive UI designs, prototypes, and
                design systems using Figma.
              </div>
            </div>
            <div style={{ color: "#444", fontSize: 14, marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>
                Dribbblefox Creative{" "}
                <span
                  style={{
                    color: "#888",
                    fontWeight: 400,
                    fontSize: 13,
                    marginLeft: 8,
                  }}
                >
                  Apr 2019 - Dec 2019
                </span>
              </div>
              <div>
                Consulted on design system migration to Figma and provided UX
                support for mobile-first dashboards.
              </div>
            </div>
            <div
              style={{
                color: "#222",
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 8,
              }}
            >
              Projects
            </div>
            <div style={{ color: "#444", fontSize: 14, marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>
                UX for Remote Productivity App
              </div>
              <div>
                Designed wireframes to MVP for a remote productivity app. Helped
                reduce onboarding friction by 45%.
              </div>
            </div>
            <div
              style={{
                color: "#222",
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 8,
              }}
            >
              Education
            </div>
            <div style={{ color: "#444", fontSize: 14 }}>
              <div style={{ fontWeight: 600 }}>Diploma in Digital Design</div>
              <div>Lumen Creative College, Aug 2016 - May 2018</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderEditor;
