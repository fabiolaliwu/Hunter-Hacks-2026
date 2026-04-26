import { useState } from "react";
import "../landing/landing.css";
import "./profile.css";

// The base URL for your Express backend
const API_BASE = "http://localhost:3001/api";

// Helper to clean and lowercase emails
function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

// Connects to the /getUser (login) or /createUser (signup) routes in routes.js
async function apiAuth(endpoint, payload) {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.message);
  return data;
}

// Fetches MongoDB 'preferences' for a specific user
async function apiGetPreferences(token) {
  const response = await fetch(`${API_BASE}/getPreferences`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.message);
  return data.preferences;
}

// Updates a single preference field in MongoDB
async function apiSetPreference(key, value, token) {
  const response = await fetch(`${API_BASE}/setPreference`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify({ key, value }),
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.message);
  return data.preferences;
}

export default function Profile() {
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [account, setAccount] = useState(null); // Stores { email, token }
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    email: "",
    borough: "",
    bio: "",
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);

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

  function handleProfileChange(e) {
    clearStatus();
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // LOG IN: Calls MongoDB and then loads user preferences
  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoading(true);
    clearStatus();

    try {
      const auth = await apiAuth("getUser", loginForm);
      const prefs = await apiGetPreferences(auth.token);

      setAccount({ email: auth.user.email, token: auth.token });
      setProfileForm({
        displayName: prefs.displayName || auth.user.name || "",
        email: auth.user.email,
        borough: prefs.borough || "",
        bio: prefs.bio || "",
      });
      setStatus({ type: "success", message: "Logged in. Data loaded from MongoDB." });
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
      await apiAuth("createUser", {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });

      setLoginForm({ email: registerForm.email, password: registerForm.password });
      setAuthMode("login");
      setStatus({ type: "success", message: "Account created! Please log in." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  // SAVE PROFILE: Syncs each form field to the MongoDB preferences object
  async function handleProfileSubmit(event) {
    event.preventDefault();
    setLoading(true);
    clearStatus();

    try {
      // Loop through profile fields and save to MongoDB
      for (const key of Object.keys(profileForm)) {
        await apiSetPreference(key, profileForm[key], account.token);
      }
      setStatus({ type: "success", message: "Profile saved to database." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setAccount(null);
    setLoginForm({ email: "", password: "" });
    setProfileForm({ displayName: "", email: "", borough: "", bio: "" });
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
          {!account && (
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
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <label>Display Name <input type="text" name="displayName" value={profileForm.displayName} onChange={handleProfileChange} /></label>
              <label>Email <input type="email" name="email" value={profileForm.email} disabled /></label>
              <label>Home Borough <input type="text" name="borough" value={profileForm.borough} onChange={handleProfileChange} /></label>
              <label>Bio <textarea name="bio" rows="4" value={profileForm.bio} onChange={handleProfileChange} /></label>
              <div className="profile-actions-row">
                <button type="submit" className="btn btn-primary profile-btn" disabled={loading}>{loading ? "Saving..." : "Save Profile"}</button>
                <button type="button" className="btn btn-secondary profile-btn" onClick={handleLogout}>Logout</button>
              </div>
            </form>
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