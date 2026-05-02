require("dotenv").config();

const express = require("express");
const cors = require("cors");

const passport = require("./config/passport.js");

const googlelogin = require("./routes/googleRoutes.js");
const auth_normal = require("./routes/authRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use("/csv", require("./routes/csvRoutes"));
app.use("/auth", googlelogin);
app.use("/auth", auth_normal);

app.use("/test", require("./routes/testRoutes.js"));

app.listen(5000, () => {
  console.log("Server jalan di port 5000, http://localhost:5000/");
});