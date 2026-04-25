import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from "@google/genai"; // New import
import './ai.css';

const AI = () => {
  const videoRef = useRef(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize the new GoogleGenAI client
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
    setAnalysis("Analyzing with Gemini 3...");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);

      // Extract base64 image data
      const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];

      // New SDK syntax: ai.models.generateContent
    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
        {
        role: "user",
        parts: [
            { text: "Describe this scene briefly." },
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
    <div className="simple-ai-page">
      <header className="simple-header">
        <h2>Capture with Gemini 3 Flash</h2>
      </header>
      <main className="feed-container">
        <video ref={videoRef} autoPlay playsInline className="camera-stream" />
        <div className="overlay">
          <button className="action-btn" onClick={handleAnalyzeClick} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Scene"}
          </button>
        </div>
      </main>
      {analysis && (
        <div className="result-container">
          <p className="result-text">{analysis}</p>
        </div>
      )}
    </div>
  );
};

export default AI;