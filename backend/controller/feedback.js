const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");
const bcrypt = require("bcryptjs");


exports.sendFeedback = async (req, res) => {

  const email = req.user.email;

  const {
    topik,
    subjek,
    isi_feed,
    rating
  } = req.body;

  try {

    if (
      !topik ||
      !subjek ||
      !isi_feed ||
      !rating
    ) {
      return res.status(400).json({
        message: "semua field wajib diisi"
      });
    }

    await churnguard_con.query(
      `
      INSERT INTO feedback
      (
        email,
        topik,
        subjek,
        isi_feed,
        rating
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        email,
        topik,
        subjek,
        isi_feed,
        rating
      ]
    );

    return res.status(200).json({
      message: "feedback berhasil dikirim"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "server error"
    });

  }

};