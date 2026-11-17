import { useEffect, useState } from "react";
import { api } from "../api.js";
import StateTracker from "../components/StateTracker.jsx";

const MESSAGES = {
  SUBMITTED: "Your exam was submitted.",
  TIMED_OUT: "Time ran out, so your saved answers were submitted.",
  TERMINATED: "Your exam ended after three tab-switch warnings. Saved answers were scored.",
};

export default function Result({ onLogout }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.result().then(setData).catch(() => {}); }, []);
  if (!data) return <main className="page"><p>Loading result…</p></main>;
  return (
    <main className="page">
      <h1>{data.result.correct} / {data.result.total}</h1>
      <p>{MESSAGES[data.state]}</p>
      <StateTracker state={data.state} />
      <div className="panel">
        <h2>Transition log</h2>
        <table>
          <thead><tr><th>From</th><th>Event</th><th>To</th></tr></thead>
          <tbody>
            {data.log.filter((l) => l.event !== "ANSWER").map((l, i) => (
              <tr key={i}><td>{l.from}</td><td>{l.event}</td><td>{l.to}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="primary" onClick={onLogout}>Sign out</button>
    </main>
  );
}
