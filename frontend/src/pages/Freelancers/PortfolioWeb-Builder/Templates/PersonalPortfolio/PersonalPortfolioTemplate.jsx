import React, { useState, useEffect } from 'react';

const PersonalPortfolioTemplate = ({ portfolioData }) => {
  const [processedHTML, setProcessedHTML] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (portfolioData) {
      processTemplate();
    }
  }, [portfolioData]);

  const processTemplate = async () => {
    try {
      setIsLoading(true);
      
      // Fetch the HTML template
      const response = await fetch('/src/pages/Freelancers/PortfolioWeb-Builder/Templates/PersonalPortfolio/index.html');
      let htmlContent = await response.text();
      
      // Replace placeholders with user data
      const replacements = {
        '{{name}}': portfolioData.name || 'Your Name',
        '{{title}}': portfolioData.title || 'Professional Title',
        '{{description}}': portfolioData.description || 'Professional description about yourself',
        '{{about}}': portfolioData.about || 'Tell your story and share your passion for creating innovative digital solutions.',
        '{{email}}': portfolioData.email || 'your.email@example.com',
        '{{phone}}': portfolioData.phone || '+1 (555) 123-4567',
        '{{location}}': portfolioData.location || 'Your City, Country'
      };

      // Apply replacements
      Object.entries(replacements).forEach(([placeholder, value]) => {
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      });

      setProcessedHTML(htmlContent);
    } catch (error) {
      console.error('Error processing template:', error);
      // Fallback to basic template
      setProcessedHTML(generateFallbackHTML());
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolioData?.name || 'Your Name'} - Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Urbanist', sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 100px 0;
            text-align: center;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
        }
        
        .section {
            padding: 80px 0;
        }
        
        .section h2 {
            font-size: 2.5rem;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .contact-info {
            background: #f8f9fa;
            padding: 40px;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .contact-info h3 {
            margin-bottom: 1rem;
        }
        
        .contact-info p {
            margin-bottom: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="hero">
        <div class="container">
            <h1>${portfolioData?.name || 'Your Name'}</h1>
            <p>${portfolioData?.title || 'Professional Title'}</p>
            <p>${portfolioData?.description || 'Professional description'}</p>
        </div>
    </div>
    
    <div class="section">
        <div class="container">
            <h2>About Me</h2>
            <p>${portfolioData?.about || 'Tell your story here.'}</p>
        </div>
    </div>
    
    <div class="section">
        <div class="container">
            <h2>Contact</h2>
            <div class="contact-info">
                <h3>Get in Touch</h3>
                <p><strong>Email:</strong> ${portfolioData?.email || 'your.email@example.com'}</p>
                <p><strong>Phone:</strong> ${portfolioData?.phone || '+1 (555) 123-4567'}</p>
                <p><strong>Location:</strong> ${portfolioData?.location || 'Your City, Country'}</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  const generateSourceCode = () => {
    return processedHTML || generateFallbackHTML();
  };

  const downloadHTML = () => {
    const htmlContent = generateSourceCode();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${portfolioData?.name?.replace(/\s+/g, '-').toLowerCase() || 'portfolio'}-personal.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading template...
      </div>
    );
  }

  return (
    <div className="personal-portfolio-template">
      <div style={{ 
        marginBottom: '20px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={downloadHTML}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007476',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Download HTML
        </button>
      </div>
      
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        height: '600px'
      }}>
        <iframe
          srcDoc={processedHTML}
          title="Portfolio Preview"
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      </div>
    </div>
  );
};

export default PersonalPortfolioTemplate; 