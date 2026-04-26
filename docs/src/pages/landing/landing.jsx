import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./landing.css";

const phrases = [
  "To make the city we call home more accessible to all. Whether it be your first time here or if you've lived here your whole life.",
  "Para hacer la ciudad que llamamos hogar más accesible para todos. Ya sea tu primera vez aquí o si has vivido aquí toda tu vida.",
  "让我们所称之为家的城市对所有人更加可及。无论你是第一次来到这里，还是在这里生活了一辈子。",
  "Pour rendre la ville que nous appelons chez nous plus accessible à tous. Que ce soit votre première fois ici ou que vous y ayez vécu toute votre vie.",
  "私たちが故郷と呼ぶ街を、すべての人にとってよりアクセスしやすくするために。初めて訪れる人でも、ずっと住んでいる人でも。",
  "Сделать город, который мы называем домом, более доступным для всех. Будь то ваш первый визит сюда или вы прожили здесь всю жизнь."
];

export default function Landing() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const today = new Date();
    setDate(today.toDateString());

    const tick = () => setTime(new Date().toLocaleTimeString());
    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const current = phrases[index];

    const baseSpeed = isDeleting ? 35 : 70;
    const variance = Math.random() * 40;

    const delay = baseSpeed + variance;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setText(current.slice(0, text.length + 1));
      } else {
        setText(current.slice(0, text.length - 1));
      }

      if (!isDeleting && text === current) {
        setTimeout(() => setIsDeleting(true), 1500);
      }

      if (isDeleting && text === "") {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % phrases.length);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, isDeleting, index]);

  return (
    <>
      <header>
        <Link to="/" className="logo">
          HUNTERHACKS2026
        </Link>

        <div className="header-right">
          <Link to="/profile" className="header-tag">
            User Profile
          </Link>
        </div>
      </header>

      <main>
        <div className="hero">
          <div className="hero-label">[ Nourish NYC ]</div>

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
            {text}
            <span className="cursor">|</span>
          </p>
        </div>

        <div className="actions">
          <Link to="/ai" className="btn btn-primary">
            ◎ CAMERA
          </Link>

          <Link to="/map" className="btn btn-secondary">
            ⊕ Map
          </Link>
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-num">01 —</div>
            <h3>EXPLORE THE CITY</h3>
            <p>
              Point your camera at anything around you and get instant context about what you're seeing.
            </p>
          </div>

          <div className="card">
            <div className="card-num">02 —</div>
            <h3>NAVIGATE WITH EASE</h3>
            <p>
              Discover accessible routes, nearby landmarks, and local tips through an interactive map.
            </p>
          </div>
        </div>
      </main>

      <footer>
        <span>HUNTERHACKS2026 — NEW YORK CITY</span>
        <span className="footer-tag">NYC</span>
      </footer>
    </>
  );
}