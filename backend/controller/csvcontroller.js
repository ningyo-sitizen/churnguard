const csv = require("csv-parser");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

exports.validateCSV = (req, res) => {
  const filePath = req.file.path;

  const expected = [
    "AccountAge", "email", "MonthlyCharges", "TotalCharges", "SubscriptionType",
    "PaymentMethod", "PaperlessBilling", "ContentType", "MultiDeviceAccess",
    "DeviceRegistered", "ViewingHoursPerWeek", "AverageViewingDuration",
    "ContentDownloadsPerMonth", "GenrePreference", "UserRating",
    "SupportTicketsPerMonth", "Gender", "WatchlistSize",
    "ParentalControl", "SubtitlesEnabled", "CustomerID"
  ];

  let rowNumber = 0;
  let errors = [];
  let headerError = null;

  let columnStats = {};
  let actualHeaders = [];
  let missingColumns = [];
  let orderMismatch = false;

  fs.createReadStream(filePath)
    .pipe(csv())

    .on("headers", (headers) => {
      const clean = headers.map(h => h.trim());

      actualHeaders = clean;

      missingColumns = expected.filter(col => !clean.includes(col));
      orderMismatch = JSON.stringify(clean) !== JSON.stringify(expected);

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
          got: clean
        };
      }

      clean.forEach(col => {
        columnStats[col] = {
          values: [],
          unique: new Set(),
          type: "unknown"
        };
      });
    })

    .on("data", (row) => {
      rowNumber++;

      for (const key in row) {
        const value = row[key]?.trim();

        if (!value) {
          errors.push({
            row: rowNumber + 1,
            column: key
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
      }
    })

    .on("end", () => {
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
        } else if (errors.some(e => e.column === col)) {
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

      fs.unlink(filePath, (err) => {
        if (err) console.error("Gagal hapus file validate:", err);
      });

      return res.json({
        headerError,
        missingData: errors,
        totalError: errors.length,
        columnSummary
      });
    })

    .on("error", (err) => {
      return res.status(500).json({
        message: "Error parsing CSV",
        error: err.message
      });
    });
};


exports.sendToPython = async (req, res) => {
  let filePath;

  try {
    filePath = req.file.path;
        

    const form = new FormData();
    const fileStream = fs.createReadStream(filePath);

    form.append("file", fileStream);

    const pyRes = await axios.post(
      "http://localhost:8000/test-upload",
      form,
      { headers: form.getHeaders() }
    );

    await new Promise((resolve) => setTimeout(resolve, 200));

    fs.unlink(filePath, (err) => {
      if (err) console.error("Delete error:", err);
    });

    return res.json({
      message: "Kirim ke Python berhasil",
      python: pyRes.data
    });

  } catch (err) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, () => { });
    }

    return res.status(500).json({
      message: "Gagal kirim ke Python"
    });
  }
};