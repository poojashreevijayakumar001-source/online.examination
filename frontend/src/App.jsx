import { useCallback, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api.js";
import Login from "./pages/Login.jsx";
import Start from "./pages/Start.jsx";
import Exam from "./pages/Exam.jsx";
import Result from "./pages/Result.jsx";
import NetBadge from "./components/NetBadge.jsx";

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("user")); } catch { return null; }
  });
  const [page, setPage] = useState("loading");

  const route = useCallback(async () => {
    try {
      const s = await api.status();
      setPage(s.state === "IDLE" ? "start" : s.state.startsWith("RUNNING") ? "exam" : "result");
    } catch {
      setToken(null); setUser(null); setPage("login");
    }
  }, []);

  useEffect(() => { if (getToken() && user) route(); else setPage("login"); }, []); // eslint-disable-line

  const login = (u) => { sessionStorage.setItem("user", JSON.stringify(u)); setUser(u); route(); };
  const logout = () => { setToken(null); sessionStorage.removeItem("user"); setUser(null); setPage("login"); };
  const finished = useCallback(() => setPage("result"), []);

  return (
    <>
      <nav className="topbar">
        <span className="brand">FA Exam</span>
        <NetBadge />
        {user && <button className="link" onClick={logout}>Sign out</button>}
      </nav>
      {page === "loading" && <main className="page"><p>Loading…</p></main>}
      {page === "login" && <Login onLogin={login} />}
      {page === "start" && <Start user={user} onStarted={() => setPage("exam")} />}
      {page === "exam" && <Exam onFinished={finished} />}
      {page === "result" && <Result onLogout={logout} />}
    </>
  );
}
