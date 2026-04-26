import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { connect } from "./server.js";

const router = Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET in .env.");
  }

  return secret;
}

function usersCollectionName() {
  return process.env.USERS_COLLECTION || "users";
}

function tokenLifetime() {
  return process.env.JWT_EXPIRES_IN || "7d";
}

function authCookieName() {
  return process.env.JWT_COOKIE_NAME || "auth_token";
}

function authCookieMaxAgeMs() {
  const value = Number(process.env.JWT_COOKIE_MAX_AGE_MS);
  if (Number.isFinite(value) && value > 0) {
    return value;
  }

  return 7 * 24 * 60 * 60 * 1000;
}

function shouldUseSecureCookies() {
  return process.env.NODE_ENV === "production";
}

function pickSafeUser(user) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
  };
}

async function getUsersCollection() {
  const db = await connect();
  return db.collection(usersCollectionName());
}

function getBearerToken(authHeader = "") {
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}

function parseCookies(cookieHeader = "") {
  const cookies = {};

  for (const pair of cookieHeader.split(";")) {
    const [rawKey, ...rest] = pair.split("=");
    const key = rawKey?.trim();
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join("=").trim());
  }

  return cookies;
}

function getCookieToken(cookieHeader = "") {
  const cookies = parseCookies(cookieHeader);
  return cookies[authCookieName()] || null;
}

function getRequestToken(req) {
  return getCookieToken(req.headers.cookie) || getBearerToken(req.headers.authorization);
}

function setAuthCookie(res, token) {
  res.cookie(authCookieName(), token, {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: "lax",
    maxAge: authCookieMaxAgeMs(),
    path: "/",
  });
}

function clearAuthCookie(res) {
  res.clearCookie(authCookieName(), {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: "lax",
    path: "/",
  });
}

router.post("/createUser", async (req, res) => {
  try {
    const { email, password, name = "" } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Email and password are required." });
    }

    const users = await getUsersCollection();
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await users.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({ ok: false, message: "User already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const doc = {
      email: normalizedEmail,
      name: String(name).trim(),
      passwordHash,
      preferences: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insert = await users.insertOne(doc);
    const user = { ...doc, _id: insert.insertedId };
    const token = jwt.sign({ sub: String(insert.insertedId), email: normalizedEmail }, getJwtSecret(), {
      expiresIn: tokenLifetime(),
    });
    setAuthCookie(res, token);

    return res.status(201).json({ ok: true, token, user: pickSafeUser(user) });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

router.post("/getUser", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Email and password are required." });
    }

    const users = await getUsersCollection();
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await users.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ ok: false, message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ ok: false, message: "Invalid credentials." });
    }

    const token = jwt.sign({ sub: String(user._id), email: user.email }, getJwtSecret(), {
      expiresIn: tokenLifetime(),
    });
    setAuthCookie(res, token);

    return res.status(200).json({ ok: true, token, user: pickSafeUser(user) });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = getRequestToken(req);

    if (!token) {
      return res.status(401).json({ ok: false, message: "Missing auth token." });
    }

    const payload = jwt.verify(token, getJwtSecret());
    const users = await getUsersCollection();
    const user = await users.findOne(
      { _id: new ObjectId(payload.sub) },
      { projection: { email: 1, name: 1 } }
    );

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found." });
    }

    return res.status(200).json({ ok: true, user: pickSafeUser(user) });
  } catch (error) {
    return res.status(401).json({ ok: false, message: error.message });
  }
});

router.get("/getPreferences", async (req, res) => {
  try {
    const token = getRequestToken(req);

    if (!token) {
      return res.status(401).json({ ok: false, message: "Missing auth token." });
    }

    const payload = jwt.verify(token, getJwtSecret());
    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(payload.sub) }, { projection: { preferences: 1 } });

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found." });
    }

    return res.status(200).json({ ok: true, preferences: user.preferences || {} });
  } catch (error) {
    return res.status(401).json({ ok: false, message: error.message });
  }
});

router.post("/setPreference", async (req, res) => {
  try {
    const token = getRequestToken(req);

    if (!token) {
      return res.status(401).json({ ok: false, message: "Missing auth token." });
    }

    const { key, value } = req.body ?? {};

    if (!key) {
      return res.status(400).json({ ok: false, message: "Preference key is required." });
    }

    const payload = jwt.verify(token, getJwtSecret());
    const users = await getUsersCollection();
    const updatePath = `preferences.${String(key).trim()}`;

    await users.updateOne(
      { _id: new ObjectId(payload.sub) },
      { $set: { [updatePath]: value, updatedAt: new Date() } }
    );

    const user = await users.findOne(
      { _id: new ObjectId(payload.sub) },
      { projection: { preferences: 1 } }
    );

    return res.status(200).json({ ok: true, preferences: user?.preferences || {} });
  } catch (error) {
    return res.status(401).json({ ok: false, message: error.message });
  }
});

router.post("/logout", (req, res) => {
  try {
    clearAuthCookie(res);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;
