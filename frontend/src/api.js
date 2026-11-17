const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getToken = () => sessionStorage.getItem("token");
export const setToken = (t) => (t ? sessionStorage.setItem("token", t) : sessionStorage.removeItem("token"));

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  login: (rollNo, password) => request("POST", "/api/auth/login", { rollNo, password }),
  validateRoll: (rollNo) => request("GET", `/api/auth/validate-roll/${encodeURIComponent(rollNo || "_")}`),
  status: () => request("GET", "/api/exam/status"),
  start: () => request("POST", "/api/exam/start"),
  questions: () => request("GET", "/api/exam/questions"),
  answer: (questionId, option) => request("POST", "/api/exam/answer", { questionId, option }),
  violation: () => request("POST", "/api/exam/violation"),
  submit: () => request("POST", "/api/exam/submit"),
  result: () => request("GET", "/api/exam/result"),
  // CN: measure round-trip time in ms
  ping: async () => {
    const t0 = performance.now();
    await request("GET", "/api/ping");
    return Math.round(performance.now() - t0);
  },
};
