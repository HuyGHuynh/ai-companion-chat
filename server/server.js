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
    origin: true, // frontend origin
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
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
