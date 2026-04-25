import React, { useEffect, useRef } from 'react';
import './ai.css';

const AI = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Function to start the camera
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    };

    startCamera();

    // Cleanup: Stop the camera when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="simple-ai-page">
      <header className="simple-header">
        <h2>Capture what you want to know </h2>
      </header>
      
      <main className="feed-container">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="camera-stream"
        />
        <div className="overlay">
          <button className="action-btn">Analyze Scene</button>
        </div>
      </main>
    </div>
  );
};

export default AI;