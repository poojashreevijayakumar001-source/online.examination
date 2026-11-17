import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Fixed-window rate limiter (Computer Networks: protects against brute force / flooding)
const hits = new Map();
export function rateLimit({ windowMs = 60_000, max = 60 } = {}) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = hits.get(key) || { count: 0, reset: now + windowMs };
    if (now > entry.reset) { entry.count = 0; entry.reset = now + windowMs; }
    entry.count++;
    hits.set(key, entry);
    res.set("X-RateLimit-Limit", String(max));
    res.set("X-RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    if (entry.count > max) return res.status(429).json({ error: "Too many requests" });
    next();
  };
}
