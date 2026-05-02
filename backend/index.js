const csv = require("csv-parser");
const fs = require("fs");
let rowNumber = 0
const expected = [
  "AccountAge",
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

fs.createReadStream("test(2).csv")
  .pipe(csv())
  .on("headers", (headers) => {
    const clean = headers.map(h => h.trim());
    const missing = expected.filter(col => !clean.includes(col))
    const match = JSON.stringify(headers) === JSON.stringify(expected);

  if (!headers) {
    console.log("❌ headers tidak ditemukan");
    return;
  if (headers.length === 0) {
    console.log("❌ headers kosong");
    return;
  }
  if (!Array.isArray(headers)) {
    console.log("❌ headers bukan array");
    return;
  }

  }
  if(missing.length > 0){
    console.log("❌ Missing columns:", missing);
  }else{
    console.log("✅ Semua header lengkap");
  }
  if (!match) {
    console.log("❌ header mismatch");
    console.log("expected:", expected);
    console.log("got:", headers);
  } else {
    console.log("✅ header valid");
  }
  })
  .on("data", (row) => {
    rowNumber++;
     for (const key in row) {
      if (row[key] === '' || row[key] === null || row[key] === undefined) {
        console.warn(`Missing data in column: ${key} in row:`, rowNumber);
      }
    }
  })
  .on("end", () => {
    console.log("file selesai dibaca");
  });