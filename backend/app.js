const express = require("express");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();
const user_middle = require("./middleware/checktokenuser.js")

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PYTHON_API = "http://localhost:8000";

const googlelogin = require("./routes/googleRoutes.js");


require("../backend/config.js");

app.use(cors());

app.use(passport.initialize());

app.use("/auth", googlelogin);

app.use("/otp", require("./routes/otpRoutes"));

app.use("/test",require("./routes/testRoutes.js"))


app.listen(5000, () => {
  console.log("Server jalan di port 5000, http://localhost:5000/");
});