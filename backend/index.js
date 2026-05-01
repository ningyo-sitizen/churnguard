const csv = require("csv-parser");
const fs = require("fs");

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
    const match =
    JSON.stringify(headers) === JSON.stringify(expected);

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
  if (!match) {
    console.log("❌ header mismatch");
    console.log("expected:", expected);
    console.log("got:", headers);
  } else {
    console.log("✅ header valid");
  }
  })
  .on("data", () => {

  })
  .on("end", () => {
    console.log("file selesai dibaca");
  });