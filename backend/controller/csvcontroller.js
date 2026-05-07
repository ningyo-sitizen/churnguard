const csv = require("csv-parser");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");
const iconv = require("iconv-lite");

exports.validateCSV = async (req, res) => {

  const filePath = req.file.path;

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

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token"
    });
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  const email = decoded.email;

  try {

    const [rows] =
      await churnguard_con.query(
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
        message:
          "anda masih memiliki prediction aktif"
      });

    }

    const raw =
      fs.readFileSync(filePath);

    let text;
    if (
      raw[0] === 0xFF &&
      raw[1] === 0xFE
    ) {

      text = iconv.decode(
        raw,
        "utf16le"
      );

    }

    else {

      text = raw.toString("utf8");

    }

    const lines = text
      .split(/\r?\n/)
      .filter(line => line.trim());

    if (lines.length === 0) {

      fs.unlink(filePath, () => { });

      return res.status(400).json({
        message: "CSV kosong"
      });

    }

    actualHeaders = lines[0]
      .split(",")
      .map(h =>
        h.trim()
          .replace(/^\uFEFF/, "")
      );

    missingColumns =
      expected.filter(
        col =>
          !actualHeaders.includes(col)
      );

    orderMismatch =
      JSON.stringify(actualHeaders)
      !== JSON.stringify(expected);

    if (missingColumns.length > 0) {

      headerError = {
        type: "missing_columns",
        missing: missingColumns
      };

    }
    if (orderMismatch) {

      headerError = {
        type: "order_mismatch",
        expected,
        got: actualHeaders
      };

    }
    actualHeaders.forEach(col => {

      columnStats[col] = {
        values: [],
        unique: new Set(),
        type: "unknown"
      };

    });
    for (
      let i = 1;
      i < lines.length;
      i++
    ) {

      const line = lines[i];

      if (!line.trim()) continue;

      rowNumber++;

      if (rowNumber > 10000) {

        fs.unlink(filePath, () => { });

        return res.status(400).json({
          message:
            "Maksimal 10.000 rows"
        });

      }

      const values = line.split(",");

      actualHeaders.forEach(
        (key, index) => {

          const value =
            values[index]?.trim();
          if (
            value === undefined ||
            value === null ||
            value === ""
          ) {

            errors.push({
              row: i + 1,
              column: key,
              message: `${key} kosong`
            });

          }

          if (columnStats[key]) {

            if (
              columnStats[key]
                .values.length < 3
            ) {

              columnStats[key]
                .values.push(value);

            }

            columnStats[key]
              .unique.add(value);

            if (
              !isNaN(value) &&
              value !== ""
            ) {

              columnStats[key]
                .type = "number";

            } else if (
              value === "true" ||
              value === "false"
            ) {

              columnStats[key]
                .type = "boolean";

            } else {

              columnStats[key]
                .type = "string";

            }
          }

        }
      );

    }

    // =========================
    // SUMMARY
    // =========================

    const columnSummary =
      expected.map((col) => {

        const data =
          columnStats[col] || {
            values: [],
            unique: new Set(),
            type: "-"
          };

        let status =
          "✅ data valid";

        if (
          missingColumns.includes(col)
        ) {

          status =
            "❌ column missing";

        }

        else if (
          orderMismatch &&
          actualHeaders.indexOf(col)
          !== expected.indexOf(col)
        ) {

          status =
            "⚠ order mismatch";

        }

        else if (
          errors.some(
            e => e.column === col
          )
        ) {

          status =
            "❌ missing value";

        }

        return {
          column: col,
          type: data.type,
          uniqueCount:
            data.unique.size,
          sample: data.values,
          status
        };

      });

    fs.unlink(filePath, () => { });

    return res.json({
      status: "success",
      totalRows: rowNumber,
      totalError: errors.length,
      headerError,
      missingData: errors,
      columnSummary
    });

  }

  catch (err) {

    console.error(
      "ERROR:",
      err.message
    );

    if (
      filePath &&
      fs.existsSync(filePath)
    ) {

      fs.unlink(
        filePath,
        () => { }
      );

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

    const [rows] = await churnguard_con.query("SELECT * FROM prediction_list where user_email = ? AND status = ?", [email, "active"])

    if (rows.length > 0) {
      return res.status(409).json({ message: "anda masih memiliki prediction mohon save atau tidak untuk membuat prediction baru" })
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    filePath = req.file.path;
    const originalName = req.file.originalname;

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));
    form.append("email", email);
    form.append("filename", originalName);

    const pyRes = await axios.post(
      "http://localhost:8000/test-upload",
      form,
      { headers: form.getHeaders() }
    );

    fs.unlink(filePath, () => { });

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