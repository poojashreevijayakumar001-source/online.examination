import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import examRoutes from "./routes/exam.js";
import { rateLimit } from "./middleware.js";

const app = express();
const origins = (process.env.CLIENT_ORIGIN || "*").split(",");

app.use(cors({ origin: origins.includes("*") ? true : origins }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

// CN: lightweight endpoint to measure round-trip latency from the browser
app.get("/api/ping", (_req, res) => res.json({ pong: true, serverTime: Date.now() }));
app.get("/", (_req, res) => res.json({ service: "Online Exam System API", status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/exam", examRoutes);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
