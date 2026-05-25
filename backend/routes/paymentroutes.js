const express = require("express");
const midtransClient = require("midtrans-client");

const router = express.Router();

console.log("PAYMENT ROUTE FILE LOADED");

// ==========================
// DATABASE
// ==========================
const db = require("../config/db");
const churnguard_con = require("../config/db");

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
    const orderId =
      `ORDER-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

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

    const sql = `
  INSERT INTO payment
  (
    order_id,
    name,
    email,
    price,
    payment_method,
    plan,
    status
  )
  VALUES (?,?, ?, ?, ?, ?, ?)
`;

    const [result] = await db.query(
      sql,
      [
        orderId,
        name,
        email,
        Number(amount),
        payment || "e-wallet",
        plan || "Premium",
        "pending"
      ]
    );

    console.log("INSERT SUCCESS");
    console.log(result);

    return res.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId
    });

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
  console.log(JSON.stringify(req.body, null, 2));

  try {

    const statusResponse =
      await snap.transaction.notification(req.body);

    console.log("STATUS RESPONSE:");
    console.log(statusResponse);

    const orderId =
      statusResponse.order_id;

    const [email_buyer] = await churnguard_con.query('select * from payment where order_id = ?',[orderId])
    const email_member= email_buyer[0]?.email
    const member_plan = email_buyer[0]?.plan

    const transactionStatus =
      statusResponse.transaction_status;

    const fraudStatus =
      statusResponse.fraud_status;

    const paymentType =
      statusResponse.payment_type || "unknown";

    let paymentStatus = "pending";

    if (transactionStatus === "capture") {

      if (fraudStatus === "challenge") {

        paymentStatus = "cancel";

      } else if (fraudStatus === "accept") {

        paymentStatus = "success";
      }

    }

    else if (
      transactionStatus === "settlement"
    ) {

      paymentStatus = "success";
    }

    else if (
      transactionStatus === "pending"
    ) {

      paymentStatus = "cancel";
    }

    else if (
      transactionStatus === "expire"
    ) {

      paymentStatus = "expired";
    }

    else if (
      transactionStatus === "cancel"
    ) {

      paymentStatus = "cancel";
    }

    else if (
      transactionStatus === "deny" ||
      transactionStatus === "failure"
    ) {

      paymentStatus = "failed";
    }

    console.log("ORDER ID:", orderId);
    console.log("TRANSACTION STATUS:", transactionStatus);
    console.log("PAYMENT STATUS:", paymentStatus);


    const sql = `
      UPDATE payment
      SET
        status=?,
        payment_method=?
      WHERE order_id=?
    `;

    db.query(
      sql,
      [
        paymentStatus,
        paymentType,
        orderId
      ],
      (err, result) => {

        if (err) {

          console.log("UPDATE ERROR:");
          console.log(err);

        } else {

          console.log("UPDATE SUCCESS");
          console.log(result);
          console.log("AFFECTED ROWS:", result.affectedRows);
        }
      }
    );

if (paymentStatus === "success") {
  console.log("payment berhasil" + orderId)
  const now = new Date();

  now.setMonth(now.getMonth() + 1);

  const member_until = now;

  const [savemember] = await churnguard_con.query(
    `UPDATE users 
     SET member = "active", member_until = ?, member_plan = ?
     WHERE email = ?`,
    [member_until,member_plan,email_member]
  );

  console.log(member_plan,member_until,email_member)
    return res.status(200).send("OK");
    }
  } catch (error) {

    console.log("NOTIFICATION ERROR:");
    console.log(error);

    return res.status(500).send("Notification Error");
  }
});

router.post("/cancel-payment", async (req, res) => {

  try {

    const { order_id } = req.body;

    const sql = `
      UPDATE payment
      SET status = ?
      WHERE order_id = ?
    `;

    await db.query(
      sql,
      [
        "cancel",
        order_id
      ]
    );

    return res.json({
      success: true,
      message: "Payment cancelled"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false
    });
  }
});

module.exports = router;