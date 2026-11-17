import { Router } from "express";
import jwt from "jsonwebtoken";
import { users } from "../data/users.js";
import { validateRollNo } from "../fsm.js";

const router = Router();

// Live DFA check used by the login form while typing
router.get("/validate-roll/:rollNo", (req, res) => {
  res.json(validateRollNo(req.params.rollNo));
});

router.post("/login", (req, res) => {
  const { rollNo, password } = req.body || {};
  const check = validateRollNo(rollNo);
  if (!check.accepted) {
    return res.status(400).json({ error: "Roll number must look like 21CSE001", trace: check.trace });
  }
  const user = users.find((u) => u.rollNo === rollNo && u.password === password);
  if (!user) return res.status(401).json({ error: "Wrong roll number or password" });
  const token = jwt.sign({ rollNo: user.rollNo, name: user.name }, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.json({ token, user: { rollNo: user.rollNo, name: user.name } });
});

export default router;
