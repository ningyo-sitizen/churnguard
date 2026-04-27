const express = require("express");
const cors = require("cors");


const app = express();
const PYTHON_API = "http://localhost:8000";

app.use(cors());

app.get("/test-python", async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_API}/test`);
    const data = await response.json();

    res.json({
      fromNode: "Node OK ✅",
      fromPython: data
    });

  } catch (error) {
    res.status(500).json({
      error: "Gagal connect ke Python",
      detail: error.message
    });
  }
});


app.listen(5000, () => {
  console.log("Server jalan di port 500, http://localhost:5000/");
});