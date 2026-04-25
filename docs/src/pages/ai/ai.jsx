import React from 'react';
import './ai.css';

const AI = () => {
  return (
    <div className="ai-page">
      <nav className="ai-nav">
        <div className="logo">Vision<span>AI</span></div>
        <div className="status">
          <span className="dot"></span> System Live
        </div>
      </nav>

      <div className="ai-container">
        <aside className="ai-sidebar">
          <h3>Tools</h3>
          <button className="tool-btn active">Object Detection</button>
          <button className="tool-btn">Scene Description</button>
          <button className="tool-btn">Text Recognition</button>
        </aside>

        <main className="ai-viewport">
          <div className="camera-box">
            {/* Camera feed or Gemini Vision output goes here */}
            <div className="camera-overlay">
              <p>Detecting environment...</p>
            </div>
          </div>
          
          <div className="ai-controls">
            <button className="capture-btn">Analyze Scene</button>
            <div className="output-console">
              <p className="typing">Ready for input...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AI;