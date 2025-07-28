const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const pool = require("../db/db");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send("Error registering user");
  }
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "Logged in", user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.status(500).send("Error logging out");
    res.send("Logged out");
  });
});

router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).send("Not logged in");
  }
});

module.exports = router;
