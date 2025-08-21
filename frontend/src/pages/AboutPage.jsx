import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

const AboutPage = () => {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const iframe = iframeRef.current;
    
    // Fallback timeout to hide loading after 5 seconds
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);
    
    const handleIframeLoad = () => {
      clearTimeout(loadingTimeout);
      
      try {
        const iframeDocument = iframe?.contentDocument || iframe?.contentWindow?.document;
        if (!iframeDocument) return;
        
        // Add scroll event listener to parent window
        const handleScroll = () => {
          // Send scroll position to iframe
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'scroll',
              scrollY: window.scrollY,
              scrollX: window.scrollX
            }, '*');
          }
        };

        // Add resize event listener
        const handleResize = () => {
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'resize',
              width: window.innerWidth,
              height: window.innerHeight
            }, '*');
          }
        };

        // Add event listeners to parent window
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);

        // Set iframe height
        const height = iframeDocument.body?.scrollHeight || 0;
        iframe.style.height = `${height}px`;

        // Trigger initial scroll event
        handleScroll();

        // Hide loading when iframe is loaded
        setLoading(false);

        return () => {
          window.removeEventListener('scroll', handleScroll);
          window.removeEventListener('resize', handleResize);
        };
      } catch (e) {
        console.log('Cross-origin iframe, using alternative method');
        // Still hide loading even if there's an error
        setLoading(false);
      }
    };

    if (iframe) {
      iframe.addEventListener("load", handleIframeLoad);
    }

    return () => {
      clearTimeout(loadingTimeout);
      if (iframe) {
        iframe.removeEventListener("load", handleIframeLoad);
      }
    };
  }, []);

  return (
    <>
      <Header activeTab="about" />
      <main style={{ paddingTop: 80}}>
        <div className="container-fluid p-0" style={{ minHeight: "50vh", position: "relative" }}>
          {/* Loading Overlay */}
          {loading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(255, 255, 255, 0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                minHeight: "50vh",
              }}
            >
              <Loader message="Loading about page..." />
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src="/about.html"
            title="About Page"
            style={{ 
              width: "100%", 
              border: "0", 
              display: loading ? "none" : "block",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              overflow: "hidden",
              opacity: loading ? 0 : 1,
              transition: "opacity 0.3s ease-in-out"
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
