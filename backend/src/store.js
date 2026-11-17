import { step, isRunning } from "./fsm.js";
import { questions } from "./data/questions.js";

const DURATION = Number(process.env.EXAM_DURATION_SECONDS || 300) * 1000;
const sessions = new Map(); // rollNo -> session (in-memory)

export function getSession(rollNo) {
  if (!sessions.has(rollNo)) {
    sessions.set(rollNo, { rollNo, state: "IDLE", answers: {}, startedAt: null, endsAt: null, log: [] });
  }
  return sessions.get(rollNo);
}

/** Apply an event to the DFA. Returns {ok, session}. Rejected events don't change state. */
export function fire(session, event) {
  const next = step(session.state, event);
  if (!next) return { ok: false, session };
  session.log.push({ from: session.state, event, to: next, at: new Date().toISOString() });
  session.state = next;
  return { ok: true, session };
}

/** Auto-fire TIMEOUT if the clock ran out. Called on every request. */
export function checkTimeout(session) {
  if (isRunning(session.state) && Date.now() > session.endsAt) fire(session, "TIMEOUT");
  return session;
}

export function startExam(session) {
  const r = fire(session, "START");
  if (r.ok) {
    session.startedAt = Date.now();
    session.endsAt = session.startedAt + DURATION;
  }
  return r;
}

export function score(session) {
  let correct = 0;
  for (const q of questions) if (session.answers[q.id] === q.answer) correct++;
  return { correct, total: questions.length };
}

export const publicSession = (s) => ({
  state: s.state,
  endsAt: s.endsAt,
  remainingSeconds: s.endsAt ? Math.max(0, Math.round((s.endsAt - Date.now()) / 1000)) : null,
  answers: s.answers,
  log: s.log,
});
