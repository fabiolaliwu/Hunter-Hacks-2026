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
        <a href="#" className="logo">
          hunter<span>hacks</span>2026
        </a>
        <div className="header-meta">NYC · 2026</div>
      </header>

      <main>
        <div className="eyebrow">hackathon 2026</div>

        <h1>
          Making NYC<br />for <em>everyone.</em>
        </h1>

        <p className="desc">
          To make the city we call home more accessible to all — whether it be
          your first time here or if you've lived here for a few years already.
        </p>

        <div className="live-strip">
          <span className="live-dot"></span>
          <span>{date}</span>
          <span className="divider">|</span>
          <span>{time}</span>
        </div>

        <div className="actions">
          <a href="camera.html" className="btn btn-primary">
            <span className="btn-icon">◎</span> camera
          </a>
          <a href="more.html" className="btn btn-secondary">
            <span className="btn-icon">⊕</span> map
          </a>
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-num">01</div>
            <h3>Explore the city</h3>
            <p>
              Point your camera at anything around you and get instant context
              about what you're seeing.
            </p>
          </div>
          <div className="card">
            <div className="card-num">02</div>
            <h3>Navigate with ease</h3>
            <p>
              Discover accessible routes, nearby landmarks, and local tips
              through an interactive map.
            </p>
          </div>
        </div>
      </main>

      <footer>
        <p>hunterhacks2026 · New York City</p>
        <span className="tag">open to all</span>
      </footer>
    </>
  );
}