const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "https://ai-companion-chat-swart.vercel.app", // frontend origin
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // IMPORTANT: set true for HTTPS (like Render)
      sameSite: "None", // IMPORTANT: required for cross-origin cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);
//Load passport config
require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

// Example route
app.use("/api/auth", require("./routes/auth"));
app.use("/api/chats", require("./routes/chat"));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
