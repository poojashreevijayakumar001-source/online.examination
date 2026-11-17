import { Router } from "express";
import { auth } from "../middleware.js";
import { questions } from "../data/questions.js";
import { getSession, checkTimeout, fire, startExam, score, publicSession } from "../store.js";
import { isRunning, isFinal } from "../fsm.js";

const router = Router();
router.use(auth);

const load = (req) => checkTimeout(getSession(req.user.rollNo));

router.get("/status", (req, res) => res.json(publicSession(load(req))));

router.post("/start", (req, res) => {
  const s = load(req);
  const r = startExam(s);
  if (!r.ok) return res.status(409).json({ error: `Cannot START from state ${s.state}`, ...publicSession(s) });
  res.json(publicSession(s));
});

router.get("/questions", (req, res) => {
  const s = load(req);
  if (!isRunning(s.state)) return res.status(403).json({ error: "Exam is not running", state: s.state });
  res.json(questions.map(({ answer, ...q }) => q)); // never leak answers
});

router.post("/answer", (req, res) => {
  const s = load(req);
  const { questionId, option } = req.body || {};
  if (!fire(s, "ANSWER").ok) return res.status(409).json({ error: `ANSWER rejected in state ${s.state}`, state: s.state });
  s.answers[questionId] = option;
  res.json(publicSession(s));
});

router.post("/violation", (req, res) => {
  const s = load(req);
  if (!fire(s, "VIOLATION").ok) return res.status(409).json({ error: `VIOLATION rejected in state ${s.state}`, state: s.state });
  res.json(publicSession(s));
});

router.post("/submit", (req, res) => {
  const s = load(req);
  if (!fire(s, "SUBMIT").ok && !isFinal(s.state)) return res.status(409).json({ error: `SUBMIT rejected in state ${s.state}` });
  res.json({ ...publicSession(s), result: score(s) });
});

router.get("/result", (req, res) => {
  const s = load(req);
  if (!isFinal(s.state)) return res.status(403).json({ error: "Exam not finished", state: s.state });
  res.json({ ...publicSession(s), result: score(s) });
});

export default router;
