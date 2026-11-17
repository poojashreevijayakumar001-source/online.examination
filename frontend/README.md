# Online Examination System using Finite Automata

Subjects: **Finite Automata (TOC)** · **Computer Networks (CN)** · **Full Stack Web Development (FSWD)**

## Problem statement

Online exams are easy to cheat on and easy to break: students reload the page to restart the timer, switch tabs to search for answers, replay API calls, or keep submitting after time is up. Most systems guard against this with scattered `if` checks that are hard to prove correct.

This project models every exam attempt as a **Deterministic Finite Automaton (DFA)** that lives on the server. Each action (start, answer, tab switch, submit, timeout) is an input symbol. If the current state has no transition for that symbol, the server rejects the request. The result is an exam whose legal behaviour is fully defined by a transition table.

### Objectives
1. Model the exam lifecycle as a DFA and enforce it on the server (FA).
2. Validate login roll numbers with a second DFA (`21CSE001` = `[0-9]{2}[A-Z]{3}[0-9]{3}`) (FA).
3. Build a secure client-server system with REST over HTTP, JWT auth, CORS, status codes, rate limiting and a latency monitor (CN).
4. Deliver a responsive React front end and an Express API, deployed to the cloud (FSWD).

## Automata design

**Session DFA** M = (Q, Σ, δ, q0, F)

- Q = {IDLE, RUNNING_0, RUNNING_1, RUNNING_2, SUBMITTED, TIMED_OUT, TERMINATED}
- Σ = {START, ANSWER, VIOLATION, SUBMIT, TIMEOUT}
- q0 = IDLE, F = {SUBMITTED, TIMED_OUT, TERMINATED}

| State | START | ANSWER | VIOLATION | SUBMIT | TIMEOUT |
|---|---|---|---|---|---|
| IDLE | RUNNING_0 | – | – | – | – |
| RUNNING_0 | – | RUNNING_0 | RUNNING_1 | SUBMITTED | TIMED_OUT |
| RUNNING_1 | – | RUNNING_1 | RUNNING_2 | SUBMITTED | TIMED_OUT |
| RUNNING_2 | – | RUNNING_2 | TERMINATED | SUBMITTED | TIMED_OUT |
| final states | – | – | – | – | – |

A DFA cannot count, so the number of tab-switch warnings is stored in the states `RUNNING_0/1/2`.
"–" means no transition: the request is rejected with HTTP 409.

**Roll number DFA**: q0 –digit→ q1 –digit→ q2 –letter→ q3 –letter→ q4 –letter→ q5 –digit→ q6 –digit→ q7 –digit→ q8 (accepting).

## Computer Networks concepts used
- Client-server model over HTTP/1.1, REST resources under `/api`
- Status codes: 200, 400, 401, 403, 404, 409, 429
- JWT bearer tokens in the `Authorization` header
- CORS allow-list (`CLIENT_ORIGIN`)
- Rate limiting with `X-RateLimit-*` headers
- `/api/ping` for round-trip-time measurement (shown in the navbar)
- HTTPS in production (Vercel and Render provide TLS)

## Tech stack
React 18 + Vite · Node.js + Express · JSON Web Tokens · Vercel (front end) · Render (back end)

## Run locally

```bash
# terminal 1 - backend
cd backend
npm install
npm start            # http://localhost:5000

# terminal 2 - frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Demo login: `21CSE001` / `pass123`

Backend checks (server must be running):
```bash
npm run test:api       # walks through the whole DFA
npm run verify:login   # roll-number DFA + login endpoint
```

## Deploy and create the demo link

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Online exam system using finite automata"
git branch -M main
git remote add origin https://github.com/<your-username>/exam-fa.git
git push -u origin main
```
Put `frontend/` and `backend/` as two folders in one repo. `.env` files are listed in `.gitignore` of the front end; keep secrets out of GitHub and add them in the hosting dashboards instead.

### 2. Backend on Render
- New → Web Service → pick the repo, **Root Directory** = `backend`
- Build command `npm install`, start command `npm start`
- Environment variables: `JWT_SECRET`, `CLIENT_ORIGIN` (your Vercel URL), `EXAM_DURATION_SECONDS=300`

### 3. Frontend on Vercel
- Add New → Project → pick the repo, **Root Directory** = `frontend`
- Framework preset: Vite
- Environment variable: `VITE_API_URL` = your Render URL (no trailing slash)
- Deploy. The Vercel URL is your **demo link**; paste it in the repository "About → Website" field.

## Folder structure
```
frontend/  public, src (api, App, pages, components), index.html, vite.config.js, vercel.json, .oxlintrc.json
backend/   src (fsm.js, store.js, middleware.js, routes, data), testapi.js, verifylogin.js
```

## Limitations and future work
In-memory storage (use MongoDB/PostgreSQL), plain demo passwords (use bcrypt), WebSocket push for live proctoring, admin dashboard.
