require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db"); 
const passport = require("./config/passport.js");

const googlelogin = require("./routes/googleRoutes.js");
const auth_normal = require("./routes/authRoutes.js");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userManagementRoutes = require("./routes/userManagementRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const paymentRoutesSA = require('./routes/paymentRoutesSA');
const tierRoutes = require('./routes/tierRoutes');
const loggerRoutes = require('./routes/loggerRoutes');


const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://inspiring-madeleine-55c663.netlify.app",
    "https://prismatic-salamander-767dac.netlify.app",
    "https://churnguard.online"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

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


app.use("/api/dashboard",  dashboardRoutes);
app.use("/api/user-management", userManagementRoutes);
app.use("/api/feedbackSA", feedbackRoutes);
app.use("/api/reports",    reportsRoutes);
app.use("/api/paymentSA",  paymentRoutesSA);
app.use("/api/tier",       tierRoutes);
app.use("/api/logger",     loggerRoutes);
app.use("/api/profile",require("./routes/UserInfoRoutes.js"))

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