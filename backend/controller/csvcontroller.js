const csv = require("csv-parser");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");
const iconv = require("iconv-lite");

exports.validateCSV = async (req, res) => {
  let filePath;

  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "File tidak ditemukan"
    });
  }

  filePath = req.file.path;

  const expected = [
    "AccountAge",
    "email",
    "MonthlyCharges",
    "TotalCharges",
    "SubscriptionType",
    "PaymentMethod",
    "PaperlessBilling",
    "ContentType",
    "MultiDeviceAccess",
    "DeviceRegistered",
    "ViewingHoursPerWeek",
    "AverageViewingDuration",
    "ContentDownloadsPerMonth",
    "GenrePreference",
    "UserRating",
    "SupportTicketsPerMonth",
    "Gender",
    "WatchlistSize",
    "ParentalControl",
    "SubtitlesEnabled",
    "CustomerID"
  ];

  let rowNumber = 0;
  let errors = [];
  let headerError = null;

  let columnStats = {};
  let actualHeaders = [];
  let missingColumns = [];
  let orderMismatch = false;

  try {
    // =========================
    // AUTH
    // =========================
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      fs.unlink(filePath, () => { });
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // =========================
    // GET USER
    // =========================
    const [member] = await churnguard_con.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const member_status = member?.[0]?.member || "free";

    // =========================
    // CHECK ACTIVE PREDICTION
    // =========================
    const [rows] = await churnguard_con.query(
      `
      SELECT *
      FROM prediction_list
      WHERE user_email = ?
      AND status = ?
      `,
      [email, "active"]
    );

    if (rows.length > 0) {
      fs.unlink(filePath, () => { });
      return res.status(409).json({
        message: "anda masih memiliki prediction aktif"
      });
    }

    // =========================
    // READ FILE
    // =========================
    const raw = fs.readFileSync(filePath);
    let text;

    if (raw[0] === 0xff && raw[1] === 0xfe) {
      text = iconv.decode(raw, "utf16le");
    } else {
      text = raw.toString("utf8");
    }

    const lines = text.split(/\r?\n/).filter((line) => line.trim());

    if (lines.length === 0) {
      fs.unlink(filePath, () => { });
      return res.status(400).json({
        message: "CSV kosong"
      });
    }
    const firstLine = lines[0];

    const delimiter = firstLine.includes(";")
      ? ";"
      : firstLine.includes("|")
        ? "|"
        : ",";

    console.log("DETECTED DELIMITER:", delimiter);
    console.log("RAW HEADER:", lines[0]);
    console.log("AFTER SPLIT:", lines[0].split(","));

    // =========================
    // HEADER VALIDATION
    // =========================
    actualHeaders = lines[0]
      .replace(/"/g, "")
      .split(",")
      .map(h => h.trim());

    missingColumns = expected.filter(
      (col) => !actualHeaders.includes(col)
    );

    orderMismatch =
      JSON.stringify(actualHeaders) !== JSON.stringify(expected);

    if (missingColumns.length > 0) {
      headerError = {
        type: "missing_columns",
        missing: missingColumns,
        expected,
        got: actualHeaders
      };
    } else if (orderMismatch) {
      headerError = {
        type: "order_mismatch",
        expected,
        got: actualHeaders
      };
    }

    // =========================
    // INIT COLUMN STATS
    // =========================
    actualHeaders.forEach((col) => {
      columnStats[col] = {
        values: [],
        unique: new Set(),
        type: "unknown"
      };
    });

    let acceptedRows = 0;

    const LIMITS = {
      free: 50,
      active: 500
    };

    const rowLimit = LIMITS[member_status] || 100;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      rowNumber++;

      if (rowNumber > rowLimit) {
        fs.unlink(filePath, () => { });
        return res.status(400).json({
          message: `Maksimal ${rowLimit} rows untuk akun ${member_status}`
        });
      }

      const values = line
        .replace(/"/g, "")
        .split(",")
        .map(v => v.trim());

      let rowHasError = false;

      actualHeaders.forEach((key, index) => {
        const value = values[index]?.trim();

        if (!value) {
          rowHasError = true;
          errors.push({
            row: i + 1,
            column: key,
            message: `${key} kosong`
          });
        }

        if (columnStats[key]) {
          if (columnStats[key].values.length < 3) {
            columnStats[key].values.push(value);
          }

          columnStats[key].unique.add(value);

          if (!isNaN(value) && value !== "") {
            columnStats[key].type = "number";
          } else if (value === "true" || value === "false") {
            columnStats[key].type = "boolean";
          } else {
            columnStats[key].type = "string";
          }
        }
      });

      if (!rowHasError) {
        acceptedRows++;
      }
    }

    // =========================
    // SUMMARY
    // =========================
    const columnSummary = expected.map((col) => {
      const data = columnStats[col] || {
        values: [],
        unique: new Set(),
        type: "-"
      };

      let status = "✅ data valid";

      if (missingColumns.includes(col)) {
        status = "❌ column missing";
      } else if (
        orderMismatch &&
        actualHeaders.indexOf(col) !== expected.indexOf(col)
      ) {
        status = "⚠ order mismatch";
      } else if (errors.some((e) => e.column === col)) {
        status = "❌ missing value";
      }

      return {
        column: col,
        type: data.type,
        uniqueCount: data.unique.size,
        sample: data.values,
        status
      };
    });

    fs.unlink(filePath, () => { });

    return res.json({
      status: "success",
      totalRows: rowNumber,
      acceptedRows,
      totalError: errors.length,
      headerError,
      missingData: errors,
      columnSummary
    });

  } catch (err) {
    console.error("ERROR:", err.message);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, () => { });
    }

    return res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};


exports.sendToPython = async (req, res) => {
  let filePath;

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token" });
    }


    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const [rows] = await churnguard_con.query("SELECT * FROM prediction_list where user_email = ? AND status = ?", [email, "active"])

    if (rows.length > 0) {
      return res.status(409).json({ message: "anda masih memiliki prediction mohon save atau tidak untuk membuat prediction baru" })
    }

    filePath = req.file.path;
    const originalName = req.file.originalname;

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("email", email);
    form.append("filename", originalName);
;

    const pyRes = await axios.post(
      `${process.env.CHURN_API}/churn/test-upload`,
      form,
      { headers: form.getHeaders() }
    );

    fs.unlink(filePath, () => { });

    const [logger] = await churnguard_con.query(
      `INSERT INTO logger(user_email, event_name, action, value) 
       VALUES (?, ?, ?, ?)`,
      [email, "prediction", "user membuat prediction", 1]
    );

    return res.json({
      message: "Kirim ke Python berhasil",
      python: pyRes.data
    });


  } catch (err) {
    console.error("ERROR:", err.message);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, () => { });
    }

    return res.status(500).json({
      message: "Gagal kirim ke Python",
      error: err.message
    });
  }
};