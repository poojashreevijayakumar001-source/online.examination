/**
 * FINITE AUTOMATA MODULE  (Theory of Computation)
 * ------------------------------------------------
 * 1) SESSION_DFA  : lifecycle of one student's exam attempt.
 *      Q  = {IDLE, RUNNING_0, RUNNING_1, RUNNING_2, SUBMITTED, TIMED_OUT, TERMINATED}
 *      Σ  = {START, ANSWER, VIOLATION, SUBMIT, TIMEOUT}
 *      q0 = IDLE
 *      F  = {SUBMITTED, TIMED_OUT, TERMINATED}
 *      RUNNING_k means "running with k tab-switch violations".
 *      The 3rd violation moves the machine to TERMINATED (a DFA cannot count, so the count is encoded in states).
 *
 * 2) ROLL_DFA : validates roll numbers like 21CSE001  =>  regex [0-9]{2}[A-Z]{3}[0-9]{3}
 */

export const SESSION_DFA = {
  start: "IDLE",
  accepting: ["SUBMITTED", "TIMED_OUT", "TERMINATED"],
  transitions: {
    IDLE: { START: "RUNNING_0" },
    RUNNING_0: { ANSWER: "RUNNING_0", VIOLATION: "RUNNING_1", SUBMIT: "SUBMITTED", TIMEOUT: "TIMED_OUT" },
    RUNNING_1: { ANSWER: "RUNNING_1", VIOLATION: "RUNNING_2", SUBMIT: "SUBMITTED", TIMEOUT: "TIMED_OUT" },
    RUNNING_2: { ANSWER: "RUNNING_2", VIOLATION: "TERMINATED", SUBMIT: "SUBMITTED", TIMEOUT: "TIMED_OUT" },
    SUBMITTED: {},
    TIMED_OUT: {},
    TERMINATED: {},
  },
};

/** δ(state, event) -> next state, or null when the transition is undefined (rejected). */
export function step(state, event) {
  const row = SESSION_DFA.transitions[state];
  return row && row[event] ? row[event] : null;
}

export const isRunning = (s) => s.startsWith("RUNNING");
export const isFinal = (s) => SESSION_DFA.accepting.includes(s);

/* ---------- Roll-number DFA (character-class based) ---------- */
const charClass = (c) => {
  if (c >= "0" && c <= "9") return "D";
  if (c >= "A" && c <= "Z") return "U";
  return "X";
};

export const ROLL_DFA = {
  start: "q0",
  accepting: ["q8"],
  transitions: {
    q0: { D: "q1" },
    q1: { D: "q2" },
    q2: { U: "q3" },
    q3: { U: "q4" },
    q4: { U: "q5" },
    q5: { D: "q6" },
    q6: { D: "q7" },
    q7: { D: "q8" },
    q8: {},
  },
};

export function runDFA(dfa, input) {
  let state = dfa.start;
  const trace = [state];
  for (const ch of input) {
    const next = dfa.transitions[state]?.[charClass(ch)];
    if (!next) return { accepted: false, trace: [...trace, "DEAD"] };
    state = next;
    trace.push(state);
  }
  return { accepted: dfa.accepting.includes(state), trace };
}

export const validateRollNo = (rollNo) => runDFA(ROLL_DFA, String(rollNo || ""));
