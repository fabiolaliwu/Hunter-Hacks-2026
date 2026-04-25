import React from 'react';
import './ai.css';

const AI = () => {
  return (
    <div className="ai-page-wrapper">
      {/* Top Navigation / Header */}
      <nav className="ai-nav">
        <h2>HunterHacks <span className="highlight">2026</span></h2>
        <div className="status-badge">AI System Online</div>
      </nav>

      <main className="ai-main-container">
        {/* Left Side: Visual/Camera Section */}
        <section className="visual-panel">
          <div className="camera-viewport">
            <div className="scan-effect"></div>
            {/* When ready, replace the <p> with <CameraFeed /> */}
            <p className="placeholder-text">INITIALIZING CAMERA FEED...</p>
          </div>
          <div className="metadata">
            <span>LAT: 40.7685° N</span>
            <span>LONG: 73.9646° W</span>
          </div>
        </section>

        {/* Right Side: Chat/Interface Section */}
        <section className="interface-panel">
          <div className="chat-history">
            <div className="msg bot-msg">
              <span className="label">SYSTEM:</span>
              Welcome, Fabiola. How can I assist with your project today?
            </div>
          </div>

          <div className="controls">
            <input 
              type="text" 
              placeholder="Enter command or question..." 
              className="ai-input" 
            />
            <button className="execute-btn">EXECUTE</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AIPage;