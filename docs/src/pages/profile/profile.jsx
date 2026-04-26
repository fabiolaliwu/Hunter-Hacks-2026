import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../landing/landing.css";
import "./profile.css";

// The base URL for your Express backend
const API_BASE = "http://localhost:3001/api";

// Connects to the /getUser (login) or /createUser (signup) routes in routes.js
async function apiAuth(endpoint, payload) {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.message);
  return data;
}

export default function Profile() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [account, setAccount] = useState(null); // Stores { email, name }
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const saved = localStorage.getItem("profile_account");
      if (!saved) {
        if (isMounted) setCheckingSession(false);
        return;
      }

      try {
        const savedAccount = JSON.parse(saved);
        if (savedAccount?.email && isMounted) {
          setAccount(savedAccount);
        }

        const response = await fetch(`${API_BASE}/me`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (!isMounted) return;

        if (data.ok && data.user?.email) {
          const nextAccount = { email: data.user.email, name: data.user.name || "" };
          setAccount(nextAccount);
          localStorage.setItem("profile_account", JSON.stringify(nextAccount));
        } else {
          // Keep local session state so user can still access logout UI.
        }
      } catch {
        if (!isMounted) return;
        // Keep local session state on transient network/auth check failure.
      } finally {
        if (isMounted) setCheckingSession(false);
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  function clearStatus() {
    setStatus({ type: "idle", message: "" });
  }

  function handleLoginChange(e) {
    clearStatus();
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleRegisterChange(e) {
    clearStatus();
    setRegisterForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // LOG IN: Calls MongoDB and then loads user preferences
  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoading(true);
    clearStatus();

    try {
      const auth = await apiAuth("getUser", loginForm);
      const nextAccount = { email: auth.user.email, name: auth.user.name || "" };
      setAccount(nextAccount);
      localStorage.setItem("profile_account", JSON.stringify(nextAccount));
      setStatus({ type: "success", message: "Logged in." });
      navigate("/");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  // SIGN UP: Creates a new user in the MongoDB 'users' collection
  async function handleRegisterSubmit(event) {
    event.preventDefault();
    clearStatus();

    if (registerForm.password !== registerForm.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      const auth = await apiAuth("createUser", {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });
      const nextAccount = { email: auth.user.email, name: auth.user.name || "" };
      setAccount(nextAccount);
      localStorage.setItem("profile_account", JSON.stringify(nextAccount));
      setStatus({ type: "success", message: "Account created." });
      navigate("/");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Keep local logout even if request fails.
    }

    setAccount(null);
    localStorage.removeItem("profile_account");
    setLoginForm({ email: "", password: "" });
    setStatus({ type: "idle", message: "" });
    setAuthMode("login");
  }

  return (
    <div className="profile-page">
      <header className="header">
        <a href="/" className="logo">HUNTERHACKS2026</a>
      </header>

      <main className="profile-main">
        <section className="hero">
          <div>
            <div className="hero-label">[ PROFILE ]</div>
            <h1>YOUR<br />CITY, <br />YOUR <br /><em>IDENTITY</em></h1>
          </div>
          <div className="live-strip profile-live-strip">
            <span className="live-dot"></span>
            <span>{account ? "DATABASE CONNECTED" : "AUTH REQUIRED"}</span>
          </div>
        </section>

        <section className="card profile-card">
          {checkingSession && <p className="profile-status">Checking session...</p>}

          {!account && !checkingSession && (
            <>
              <div className="profile-auth-tabs">
                <button className={`profile-tab ${authMode === "login" ? "is-active" : ""}`} onClick={() => setAuthMode("login")}>Login</button>
                <button className={`profile-tab ${authMode === "register" ? "is-active" : ""}`} onClick={() => setAuthMode("register")}>Sign Up</button>
              </div>

              {authMode === "login" ? (
                <form className="profile-form" onSubmit={handleLoginSubmit}>
                  <label>Email <input type="email" name="email" value={loginForm.email} onChange={handleLoginChange} required /></label>
                  <label>Password <input type="password" name="password" value={loginForm.password} onChange={handleLoginChange} required /></label>
                  <button type="submit" className="btn btn-primary profile-btn" disabled={loading}>{loading ? "Connecting..." : "Login"}</button>
                </form>
              ) : (
                <form className="profile-form" onSubmit={handleRegisterSubmit}>
                  <label>Name <input type="text" name="name" value={registerForm.name} onChange={handleRegisterChange} required /></label>
                  <label>Email <input type="email" name="email" value={registerForm.email} onChange={handleRegisterChange} required /></label>
                  <label>Password <input type="password" name="password" value={registerForm.password} onChange={handleRegisterChange} required /></label>
                  <label>Confirm Password <input type="password" name="confirmPassword" value={registerForm.confirmPassword} onChange={handleRegisterChange} required /></label>
                  <button type="submit" className="btn btn-primary profile-btn" disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
                </form>
              )}
            </>
          )}

          {account && (
            <div className="profile-form">
              <p>Logged in as <strong>{account.email}</strong>.</p>
              <div className="profile-actions-row">
                <button type="button" className="btn btn-secondary profile-btn" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          )}

          {status.type !== "idle" && (
            <p className={`profile-status ${status.type === "error" ? "is-error" : "is-success"}`}>{status.message}</p>
          )}
        </section>
      </main>
      <footer><span>HUNTERHACKS2026 — NEW YORK CITY</span></footer>
    </div>
  );
}
