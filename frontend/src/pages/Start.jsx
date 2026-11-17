import { useState } from "react";
import { api } from "../api.js";
import StateTracker from "../components/StateTracker.jsx";

export default function Start({ user, onStarted }) {
  const [error, setError] = useState("");
  async function start() {
    try { await api.start(); onStarted(); } catch (e) { setError(e.message); }
  }
  return (
    <main className="page">
      <h1>Hello, {user.name}</h1>
      <div className="panel">
        <h2>Before you begin</h2>
        <ul className="rules">
          <li>The timer starts when you press Start and cannot be paused.</li>
          <li>Leaving this tab counts as a warning. The third warning ends your exam.</li>
          <li>You can change an answer until you submit or time runs out.</li>
        </ul>
        <StateTracker state="IDLE" />
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" onClick={start}>Start exam</button>
      </div>
    </main>
  );
}
