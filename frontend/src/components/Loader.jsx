import React from "react";

const sizeClassMap = {
  sm: "spinner-border-sm",
  md: "",
  lg: "",
};

const Loader = ({ fullscreen = false, message = "Loading...", size = "md" }) => {
  const spinnerSizeClass = sizeClassMap[size] || "";

  if (fullscreen) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div className={`spinner-border ${spinnerSizeClass}`} role="status" aria-label={message} style={{ color: "#007674" }} />
        {message ? (
          <div style={{ color: "#121212", fontSize: 18 }}>{message}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className={`spinner-border ${spinnerSizeClass}`} role="status" aria-label={message} style={{ color: "#007674" }} />
      {message ? (
        <span style={{ color: "#121212", fontSize: 18 }}>{message}</span>
      ) : null}
    </div>
  );
};

export default Loader;

