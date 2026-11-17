import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import StateTracker from "../components/StateTracker.jsx";

const isRunning = (s) => s.startsWith("RUNNING");
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function Exam({ onFinished }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [state, setState] = useState("RUNNING_0");
  const [remaining, setRemaining] = useState(0);
  const [notice, setNotice] = useState("");
  const finished = useRef(false);

  const sync = useCallback((s) => {
    setState(s.state);
    if (s.answers) setAnswers(s.answers);
    if (s.remainingSeconds !== null && s.remainingSeconds !== undefined) setRemaining(s.remainingSeconds);
    if (!isRunning(s.state) && !finished.current) { finished.current = true; onFinished(); }
  }, [onFinished]);

  useEffect(() => {
    api.questions().then(setQuestions).catch(() => onFinished());
    api.status().then(sync).catch(() => {});
  }, [sync, onFinished]);

  // local countdown; the server remains the source of truth
  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (remaining === 0 && isRunning(state) && questions.length) api.status().then(sync).catch(() => {});
  }, [remaining, state, questions.length, sync]);

  // each tab switch fires a VIOLATION event on the server DFA
  useEffect(() => {
    const onHide = async () => {
      if (!document.hidden || finished.current) return;
      try {
        const s = await api.violation();
        setNotice("You left the exam tab. This was recorded as a warning.");
        sync(s);
      } catch { /* ignore */ }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [sync]);

  async function choose(qid, option) {
    setAnswers((a) => ({ ...a, [qid]: option }));
    try { sync(await api.answer(qid, option)); } catch (e) { setNotice(e.message); }
  }
  async function submit() {
    if (!confirm("Submit your exam now?")) return;
    try { sync(await api.submit()); } catch (e) { setNotice(e.message); }
  }

  const answered = Object.keys(answers).length;

  return (
    <main className="page exam">
      <header className="exam-bar">
        <div>
          <strong>{answered} of {questions.length} answered</strong>
          {notice && <p className="warn" role="alert">{notice}</p>}
        </div>
        <div className={`clock ${remaining < 60 ? "low" : ""}`} aria-live="off">{fmt(remaining)}</div>
      </header>
      <StateTracker state={state} />
      {questions.map((q, i) => (
        <fieldset key={q.id} className="question">
          <legend>
            <span className="subject">{q.subject}</span> Question {i + 1}
          </legend>
          <p className="qtext">{q.text}</p>
          {q.options.map((opt, idx) => (
            <label key={idx} className={`opt ${answers[q.id] === idx ? "picked" : ""}`}>
              <input type="radio" name={`q${q.id}`} checked={answers[q.id] === idx} onChange={() => choose(q.id, idx)} />
              {opt}
            </label>
          ))}
        </fieldset>
      ))}
      <button className="primary" onClick={submit}>Submit exam</button>
    </main>
  );
}
