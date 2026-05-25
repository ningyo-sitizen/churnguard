require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("OK BACKEND KIANKIANKIANAKIANAKIANA");
});

app.get("/ping", (req, res) => {
  res.json({
    status: "success",
    message: "pong"
  });
});

// ROUTES
app.use("/csv", require("./routes/csvroutes.js"));
app.use("/auth", require("./routes/googleRoutes.js"));
app.use("/auth", require("./routes/authRoutes.js"));
app.use("/prediction", require("./routes/predictRoutes.js"));
app.use("/email", require("./routes/emailRoutes.js"));
app.use("/feedback", require("./routes/feedback.js"));
app.use("/api/payment", require("./routes/paymentroutes.js"));
app.use("/test", require("./routes/testRoutes.js"));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});