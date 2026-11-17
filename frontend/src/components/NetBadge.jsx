import { useEffect, useState } from "react";
import { api } from "../api.js";

// Shows live round-trip time to the server (Computer Networks)
export default function NetBadge() {
  const [ms, setMs] = useState(null);
  const [down, setDown] = useState(false);

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try { const t = await api.ping(); if (!stop) { setMs(t); setDown(false); } }
      catch { if (!stop) setDown(true); }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { stop = true; clearInterval(id); };
  }, []);

  return (
    <span className={`net ${down ? "bad" : ms > 400 ? "slow" : "good"}`} role="status">
      {down ? "Server unreachable" : ms === null ? "Checking connection" : `Connection ${ms} ms`}
    </span>
  );
}
