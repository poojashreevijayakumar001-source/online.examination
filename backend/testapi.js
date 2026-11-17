// Usage: start the server (npm start) then run: npm run test:api
const BASE = process.env.API_URL || "http://localhost:5000";
let token = "";
let passed = 0, failed = 0;

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}
function check(name, cond) {
  cond ? passed++ : failed++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
}

const r1 = await call("GET", "/api/ping");
check("ping returns 200", r1.status === 200);

const r2 = await call("POST", "/api/auth/login", { rollNo: "21CSE002", password: "pass123" });
check("login ok", r2.status === 200 && !!r2.data.token);
token = r2.data.token;

check("questions blocked before START (403)", (await call("GET", "/api/exam/questions")).status === 403);
check("START -> RUNNING_0", (await call("POST", "/api/exam/start")).data.state === "RUNNING_0");
check("second START rejected (409)", (await call("POST", "/api/exam/start")).status === 409);

const q = await call("GET", "/api/exam/questions");
check("questions returned without answers", q.status === 200 && q.data.length > 0 && q.data[0].answer === undefined);

check("ANSWER accepted", (await call("POST", "/api/exam/answer", { questionId: 1, option: 1 })).status === 200);
check("violation 1 -> RUNNING_1", (await call("POST", "/api/exam/violation")).data.state === "RUNNING_1");
check("violation 2 -> RUNNING_2", (await call("POST", "/api/exam/violation")).data.state === "RUNNING_2");
check("violation 3 -> TERMINATED", (await call("POST", "/api/exam/violation")).data.state === "TERMINATED");
check("ANSWER after TERMINATED rejected", (await call("POST", "/api/exam/answer", { questionId: 2, option: 1 })).status === 409);
check("result available", (await call("GET", "/api/exam/result")).status === 200);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
