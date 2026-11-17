// Draws the session DFA and highlights the machine's current state.
const NODES = [
  { id: "IDLE", label: "IDLE" },
  { id: "RUNNING_0", label: "0 warnings" },
  { id: "RUNNING_1", label: "1 warning" },
  { id: "RUNNING_2", label: "2 warnings" },
];
const ENDS = ["SUBMITTED", "TIMED_OUT", "TERMINATED"];

export default function StateTracker({ state }) {
  return (
    <div className="tracker" aria-label={`Exam state: ${state}`}>
      <ol className="tracker-row">
        {NODES.map((n) => (
          <li key={n.id} className={`node ${state === n.id ? "on" : ""}`}>{n.label}</li>
        ))}
      </ol>
      <ol className="tracker-row ends">
        {ENDS.map((e) => (
          <li key={e} className={`node end ${state === e ? "on" : ""}`}>{e.replace("_", " ")}</li>
        ))}
      </ol>
    </div>
  );
}
