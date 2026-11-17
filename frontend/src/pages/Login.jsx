import { useEffect, useState } from "react";
import { api, setToken } from "../api.js";

export default function Login({ onLogin }) {
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [trace, setTrace] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Live DFA validation of the roll number as the student types
  useEffect(() => {
    if (!rollNo) { setTrace(null); return; }
    const id = setTimeout(() => api.validateRoll(rollNo).then(setTrace).catch(() => setTrace(null)), 250);
    return () => clearTimeout(id);
  }, [rollNo]);

  async function submit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const { token, user } = await api.login(rollNo, password);
      setToken(token);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <section className="login-intro">
        <h1>Online exam, checked by automata</h1>
        <p>Your attempt is a finite state machine. Every action is accepted or rejected by the server, so the exam cannot be skipped, replayed or extended.</p>
      </section>
      <form className="panel" onSubmit={submit}>
        <h2>Sign in</h2>
        <label>
          Roll number
          <input value={rollNo} onChange={(e) => setRollNo(e.target.value.trim())} placeholder="21CSE001" autoComplete="username" required />
        </label>
        {trace && (
          <p className={`dfa-line ${trace.accepted ? "ok" : "no"}`}>
            {trace.accepted ? "Format accepted" : "Format not complete yet"}: {trace.trace.join(" → ")}
          </p>
        )}
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <p className="hint">Demo account: 21CSE001 / pass123</p>
      </form>
    </main>
  );
}
