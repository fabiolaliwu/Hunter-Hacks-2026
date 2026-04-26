import { useState } from "react";
import "../landing/landing.css";
import "./profile.css";

// This waits a moment so fake API calls feel real.
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// This makes sure the email is clean and lowercase.
function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

// This pretends to send login data to a server.
async function stubPostLogin(payload) {
  await wait(450);

  if (!payload.email || !payload.password) {
    throw new Error("Please enter both email and password.");
  }

  return {
    ok: true,
    token: "stub-token-2026",
    email: normalizeEmail(payload.email),
  };
}

// This pretends to fetch a user's profile from a server.
async function stubGetProfile(email) {
  await wait(350);

  const safeEmail = normalizeEmail(email);
  const cached = localStorage.getItem(`profile:${safeEmail}`);

  if (cached) {
    return JSON.parse(cached);
  }

  const seeded = {
    displayName: safeEmail.split("@")[0] || "Hunter Hacker",
    email: safeEmail,
    borough: "Manhattan",
    bio: "I build tools that make NYC easier to navigate.",
  };

  localStorage.setItem(`profile:${safeEmail}`, JSON.stringify(seeded));
  return seeded;
}

// This pretends to save profile form data to a server.
async function stubPostProfile(profile) {
  await wait(400);

  if (!profile.email) {
    throw new Error("Missing account email.");
  }

  const safeEmail = normalizeEmail(profile.email);
  const cleanProfile = {
    ...profile,
    email: safeEmail,
    displayName: profile.displayName.trim(),
    borough: profile.borough.trim(),
    bio: profile.bio.trim(),
  };

  localStorage.setItem(`profile:${safeEmail}`, JSON.stringify(cleanProfile));
  return { ok: true, profile: cleanProfile };
}

// This shows a login-first profile page with stubbed form requests.
export default function Profile() {
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [account, setAccount] = useState(null);
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    email: "",
    borough: "",
    bio: "",
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);

  // This clears status messages before another action.
  function clearStatus() {
    setStatus({ type: "idle", message: "" });
  }

  // This updates login inputs by field name.
  function handleLoginChange(event) {
    clearStatus();
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  // This updates registration inputs by field name.
  function handleRegisterChange(event) {
    clearStatus();
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  }

  // This updates profile editor inputs by field name.
  function handleProfileChange(event) {
    clearStatus();
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  }

  // This logs in, then loads a profile with fake API calls.
  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoading(true);
    clearStatus();

    try {
      const loginResult = await stubPostLogin(loginForm);
      const profile = await stubGetProfile(loginResult.email);

      setAccount({ email: loginResult.email, token: loginResult.token });
      setProfileForm(profile);
      setStatus({ type: "success", message: "Logged in. Profile loaded." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  // This checks basic sign-up fields and then logs in.
  async function handleRegisterSubmit(event) {
    event.preventDefault();
    clearStatus();

    if (!registerForm.name.trim()) {
      setStatus({ type: "error", message: "Please add your name." });
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      await stubPostLogin({
        email: registerForm.email,
        password: registerForm.password,
      });

      const seededProfile = {
        displayName: registerForm.name.trim(),
        email: normalizeEmail(registerForm.email),
        borough: "Brooklyn",
        bio: "Excited to build inclusive city tools.",
      };

      await stubPostProfile(seededProfile);
      setLoginForm({ email: registerForm.email, password: registerForm.password });
      setAuthMode("login");
      setStatus({
        type: "success",
        message: "Account created. Please log in.",
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  // This saves profile edits with a fake POST request.
  async function handleProfileSubmit(event) {
    event.preventDefault();
    setLoading(true);
    clearStatus();

    try {
      const result = await stubPostProfile(profileForm);
      setProfileForm(result.profile);
      setStatus({ type: "success", message: "Profile saved." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  // This resets all local state and signs the user out.
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
            <h1>
              YOUR<br />
              CITY, <br />
              YOUR <br />
              <em>IDENTITY</em>
            </h1>
          </div>

          <div className="live-strip profile-live-strip">
            <span className="live-dot"></span>
            <span>{account ? "AUTHENTICATED" : "AUTH REQUIRED"}</span>
          </div>
        </section>

        <section className="card profile-card">
          {!account && (
            <>
              <div className="profile-auth-tabs">
                <button
                  type="button"
                  className={`profile-tab ${authMode === "login" ? "is-active" : ""}`}
                  onClick={() => {
                    clearStatus();
                    setAuthMode("login");
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`profile-tab ${authMode === "register" ? "is-active" : ""}`}
                  onClick={() => {
                    clearStatus();
                    setAuthMode("register");
                  }}
                >
                  Sign Up
                </button>
              </div>

              {authMode === "login" ? (
                <form className="profile-form" onSubmit={handleLoginSubmit}>
                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      placeholder="email@hunter.cuny.edu"
                      value={loginForm.email}
                      onChange={handleLoginChange}
                    />
                  </label>

                  <label>
                    Password
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                    />
                  </label>

                  <button type="submit" className="btn btn-primary profile-btn" disabled={loading}>
                    {loading ? "Submitting..." : "Login"}
                  </button>
                </form>
              ) : (
                <form className="profile-form" onSubmit={handleRegisterSubmit}>
                  <label>
                    Name
                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={registerForm.name}
                      onChange={handleRegisterChange}
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      placeholder="email@hunter.cuny.edu"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                    />
                  </label>

                  <label>
                    Password
                    <input
                      type="password"
                      name="password"
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                    />
                  </label>

                  <label>
                    Confirm Password
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Repeat password"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                    />
                  </label>

                  <button type="submit" className="btn btn-primary profile-btn" disabled={loading}>
                    {loading ? "Submitting..." : "Create Account"}
                  </button>
                </form>
              )}
            </>
          )}

          {account && (
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <label>
                Display Name
                <input
                  type="text"
                  name="displayName"
                  value={profileForm.displayName}
                  onChange={handleProfileChange}
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                />
              </label>

              <label>
                Home Borough
                <input
                  type="text"
                  name="borough"
                  value={profileForm.borough}
                  onChange={handleProfileChange}
                />
              </label>

              <label>
                Bio
                <textarea
                  name="bio"
                  rows="4"
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                />
              </label>

              <div className="profile-actions-row">
                <button type="submit" className="btn btn-primary profile-btn" disabled={loading}>
                  {loading ? "Saving..." : "Save Profile"}
                </button>
                <button type="button" className="btn btn-secondary profile-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </form>
          )}

          {status.type !== "idle" && (
            <p className={`profile-status ${status.type === "error" ? "is-error" : "is-success"}`}>
              {status.message}
            </p>
          )}
        </section>
      </main>

      <footer>
        <span>HUNTERHACKS2026 — NEW YORK CITY</span>
      </footer>
    </div>
  );
}

export { Profile };
