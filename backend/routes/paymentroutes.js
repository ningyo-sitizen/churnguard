const express = require("express");
const midtransClient = require("midtrans-client");

const router = express.Router();

console.log("PAYMENT ROUTE FILE LOADED");

// ==========================
// DATABASE
// ==========================
const db = require("../config/db");

// ==========================
// TEST ROUTE
// ==========================
router.get("/test", (req, res) => {
  return res.send("PAYMENT ROUTE OK");
});

// ==========================
// MIDTRANS CONFIG
// ==========================
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// ==========================
// CREATE TRANSACTION
// ==========================
router.post("/create-transaction", async (req, res) => {

  console.log("CREATE TRANSACTION HIT");

  try {

    console.log("REQUEST BODY:");
    console.log(req.body);

    const {
      name,
      email,
      amount,
      plan,
      payment
    } = req.body;

    // ==========================
    // VALIDATION
    // ==========================
    if (!name || !email || !amount) {

      return res.status(400).json({
        success: false,
        message: "Incomplete data"
      });
    }

    // ==========================
    // ORDER ID
    // ==========================
    const orderId =
      "ORDER-" + Date.now();

    // ==========================
    // MIDTRANS PARAMETER
    // ==========================
    const parameter = {

      transaction_details: {
        order_id: orderId,
        gross_amount: Number(amount)
      },

      enabled_payments: [
        "gopay",
        "qris",
        "shopeepay"
      ],

      customer_details: {
        first_name: name,
        email: email
      },

      item_details: [
        {
          id: "PLAN-001",
          price: Number(amount),
          quantity: 1,
          name: plan || "Premium Plan"
        }
      ],

      callbacks: {
        finish: "http://localhost:3000/payment-success"
      },

      notification_url:
        "https://cringe-stunt-ongoing.ngrok-free.dev/api/payment/notification"
    };

    // ==========================
    // CREATE MIDTRANS
    // ==========================
    const transaction =
      await snap.createTransaction(parameter);

    console.log("MIDTRANS TRANSACTION:");
    console.log(transaction);

    // ==========================
    // INSERT DATABASE
    // ==========================
    const sql = `
      INSERT INTO payment
      (
        order_id,
        name,
        price,
        payment_method,
        plan,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        orderId,
        name,
        Number(amount),
        payment || "e-wallet",
        plan || "Premium",
        "pending"
      ],
      (err, result) => {

        if (err) {

          console.log("MYSQL INSERT ERROR:");
          console.log(err);

          return res.status(500).json({
            success: false,
            message: "Database insert failed",
            mysql_error: err.message
          });
        }

        console.log("INSERT SUCCESS");
        console.log(result);

        return res.json({
          success: true,
          token: transaction.token,
          redirect_url: transaction.redirect_url,
          order_id: orderId
        });
      }
    );

  } catch (error) {

    console.log("MIDTRANS ERROR:");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Midtrans transaction failed",
      error: error.message
    });
  }
});


router.post("/notification", async (req, res) => {
    console.log("kiana")
});

module.exports = router;