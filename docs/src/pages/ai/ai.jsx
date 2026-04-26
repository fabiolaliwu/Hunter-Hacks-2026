import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import './ai.css';

const AI = () => {
  const videoRef = useRef(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY
  });

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    };
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleAnalyzeClick = async () => {
    if (!videoRef.current) return;
    setLoading(true);
    setAnalysis("");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);
      const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];





      // testing purposes
      // const base64Image = await new Promise((resolve) => {
      //   const img = new Image();
      //   img.src = "/empire.jpg"; 
      //   img.onload = () => {
      //     const canvas = document.createElement("canvas");
      //     canvas.width = img.width; canvas.height = img.height;
      //     canvas.getContext("2d").drawImage(img, 0, 0);
      //     resolve(canvas.toDataURL("image/jpeg").split(",")[1]);
      //   };
      // });







      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [
          {
            role: "user",
            parts: [
              { text: "Identify any landmarks, buildings, or cultural items in this image. Provide: A brief overview of what this is. Two fascinating historical facts or 'hidden secrets' about this spot. Keep it short." },
              {
                inlineData: {
                  data: base64Image,
                  mimeType: "image/jpeg"
                }
              }
            ]
          }
        ]
      });

      setAnalysis(response.text);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAnalysis("Analysis failed. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">

      {/* Header */}
      <header className="map-header">
        <a href="/" className="map-logo">HUNTERHACKS2026</a>
        <div className="map-header-right">
          <span className="map-header-tag">Gemini 2.5 Flash</span>
        </div>
      </header>

      {/* Hero */}
      <div className="ai-hero">
        <div>
          <p className="map-hero-label">AI SCENE ANALYSIS</p>
          <h1>
            See with <em>AI.</em>
          </h1>
        </div>
        <div className="map-hero-side">
          <div className="map-live-strip">
            <span className="map-live-dot"></span>
            <span>LIVE FEED</span>
          </div>
        </div>
      </div>

      {/* Description Row */}
      <div className="map-desc-row">
        <span className="map-desc-num">01</span>
        <p className="map-desc">
          Point your camera at any scene and let Gemini 2.5 Flash analyze and describe what you both see in real time.
        </p>
      </div>

      {/* Camera Feed */}
      <div className="ai-feed-section">
        <p className="map-filter-label">02 — Live Camera</p>
        <div className="ai-feed-wrapper">
          <video ref={videoRef} autoPlay playsInline className="ai-camera-stream" />
          <div className="ai-overlay">
            <button
              className={`ai-action-btn ${loading ? 'loading' : ''}`}
              onClick={handleAnalyzeClick}
              disabled={loading}
            >
              <span className="ai-btn-dot" />
              {loading ? "Analyzing..." : "Analyze Scene"}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {analysis && (
        <div className="ai-result-section">
          <div className="map-filter-meta" style={{ marginBottom: '16px' }}>
            <div>
              <span className="map-filter-count-label">Analysis Result</span>
            </div>
            <div className="map-live-strip">
              <span className="map-live-dot" />
              <span>Gemini</span>
            </div>
          </div>
          <div className="ai-result-card">
            <p className="ai-result-num">SCENE DESCRIPTION</p>
            <p className="ai-result-text">{analysis}</p>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="map-cards">
        <div className="map-card">
          <p className="map-card-num">01</p>
          <h3>Live Capture</h3>
          <p>Snap a picture from your camera with a single click.</p>
        </div>
        <div className="map-card">
          <p className="map-card-num">02</p>
          <h3>Gemini Vision</h3>
          <p>Powered by Gemini 2.5 Flash for fast scene understanding.</p>
        </div>
        <div className="map-card">
          <p className="map-card-num">03</p>
          <h3>Instant Results</h3>
          <p>Get a easy to read description of your scene in just seconds.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="map-footer">
        <span>© {new Date().getFullYear()} For the Culture NYC</span>
        <span className="map-footer-tag">Gemini AI</span>
      </footer>

    </div>
  );
};

export default AI;