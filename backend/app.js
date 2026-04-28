const express = require("express");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();

const app = express();
const PYTHON_API = "http://localhost:8000";

const googlelogin = require("./routes/googleRoutes.js");


require("../backend/config.js");

app.use(cors());

app.use(passport.initialize());

app.use("/auth", googlelogin);

app.get("/test-python", async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_API}/test`);
    const data = await response.json();

    return res.json({
      fromNode: "Node OKEH bisa dibaca",
      fromPython: data
    });

  } catch (error) {
    return res.status(500).json({
      error: "Gagal connect ke Python",
      detail: error.message
    });
  }
});



app.listen(5000, () => {
  console.log("Server jalan di port 5000, http://localhost:5000/");
});