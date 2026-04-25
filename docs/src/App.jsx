import { useEffect, useState } from "react";
import "./index.css";

export default function App() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const today = new Date();
    setDate(today.toDateString());
    function tick() {
      setTime(new Date().toLocaleTimeString());
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header>
        <a href="#" className="logo">HUNTERHACKS2026</a>
        <div className="header-right">
          <span className="header-tag">NYC</span>
          <span className="header-tag">2026</span>
        </div>
      </header>

      <main>
        <div className="hero">
          <div className="hero-label">[ HACKATHON ]</div>
          <h1>
            MAKING<br />
            <em>THE</em><br />
            CITY<br />
            FOR ALL.
          </h1>
          <div className="hero-side">
            <div className="live-strip">
              <span className="live-dot"></span>
              <span>{date}</span>
            </div>
            <div className="live-time">{time}</div>
          </div>
        </div>

        <div className="desc-row">
          <div className="desc-num">001</div>
          <p className="desc">
            To make the city we call home more accessible to all —
            whether it be your first time here or if you've lived
            here for a few years already.
          </p>
        </div>

        <div className="actions">
          <a href="camera.html" className="btn btn-primary">
            ◎ CAMERA
          </a>
          <a href="map.jsx" className="btn btn-secondary">
            ⊕ MAP
          </a>
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-num">01 —</div>
            <h3>EXPLORE THE CITY</h3>
            <p>Point your camera at anything around you and get instant context about what you're seeing.</p>
          </div>
          <div className="card">
            <div className="card-num">02 —</div>
            <h3>NAVIGATE WITH EASE</h3>
            <p>Discover accessible routes, nearby landmarks, and local tips through an interactive map.</p>
          </div>
        </div>
      </main>

      <footer>
        <span>HUNTERHACKS2026 — NEW YORK CITY</span>
        <span className="footer-tag">OPEN TO ALL</span>
      </footer>
    </>
  );
}