// Verifies the Roll-number DFA offline and the login endpoint online.
// Usage: node verifylogin.js
import { validateRollNo } from "./src/fsm.js";

const BASE = process.env.API_URL || "http://localhost:5000";

console.log("== Roll number DFA ==");
const cases = [["21CSE001", true], ["21cse001", false], ["2CSE001", false], ["21CSE0011", false], ["", false]];
let ok = true;
for (const [input, expected] of cases) {
  const { accepted, trace } = validateRollNo(input);
  const pass = accepted === expected;
  ok &&= pass;
  console.log(`${pass ? "PASS" : "FAIL"}  "${input}" -> ${accepted ? "ACCEPT" : "REJECT"}  [${trace.join(" > ")}]`);
}

console.log("\n== Login endpoint ==");
try {
  const post = (body) => fetch(`${BASE}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const good = await post({ rollNo: "21CSE001", password: "pass123" });
  const bad = await post({ rollNo: "21CSE001", password: "wrong" });
  console.log(`${good.status === 200 ? "PASS" : "FAIL"}  valid login -> ${good.status}`);
  console.log(`${bad.status === 401 ? "PASS" : "FAIL"}  wrong password -> ${bad.status}`);
  ok &&= good.status === 200 && bad.status === 401;
} catch {
  console.log("Server not reachable. Run `npm start` first.");
  ok = false;
}
process.exit(ok ? 0 : 1);
