require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db"); 
const passport = require("./config/passport.js");

const googlelogin = require("./routes/googleRoutes.js");
const auth_normal = require("./routes/authRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use("/csv", require("./routes/csvroutes"));
app.use("/auth", googlelogin);
app.use("/auth", auth_normal);
app.use("/prediction", require("./routes/predictRoutes.js"))
app.use("/email", require("./routes/emailRoutes.js"))
app.use("/feedback", require("./routes/feedback.js"))
app.use("/api/payment", require("./routes/paymentroutes.js"));

app.get("/", (req, res) => {
  res.send("Backend jalan");
});

app.get("/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/test", require("./routes/testRoutes.js"));

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});