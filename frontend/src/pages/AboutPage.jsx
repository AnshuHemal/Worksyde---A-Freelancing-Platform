import React, { useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AboutPage = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    
    const handleIframeLoad = () => {
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

        return () => {
          window.removeEventListener('scroll', handleScroll);
          window.removeEventListener('resize', handleResize);
        };
      } catch (e) {
        console.log('Cross-origin iframe, using alternative method');
      }
    };

    if (iframe) {
      iframe.addEventListener("load", handleIframeLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener("load", handleIframeLoad);
      }
    };
  }, []);

  return (
    <>
      <Header activeTab="about" />
      <main style={{ paddingTop: 80}}>
        <div className="container-fluid p-0" style={{ minHeight: "50vh" }}>
          <iframe
            ref={iframeRef}
            src="/about.html"
            title="About Page"
            style={{ 
              width: "100%", 
              border: "0", 
              display: "block",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              overflow: "hidden"
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
