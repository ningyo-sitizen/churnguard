const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");

exports.getUserDetail = async (req, res) => {
  try {
    const customer_id = req.query.customerid;
    const prediction_id = req.query.predictionid;

    const [rows] = await churnguard_con.query(
      'SELECT * FROM prediction_detail WHERE prediction_id = ? AND CustomerID = ?',
      [prediction_id, customer_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Data tidak ditemukan"
      });
    }

    res.status(200).json({
      message: "Berhasil mengambil detail customer",
      data: rows[0]
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};

exports.getPrediction = async (req, res) => {

    try {

        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const email = decoded.email;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const offset = (page - 1) * limit;

        const [active] = await churnguard_con.query(
            `
            SELECT * 
            FROM prediction_list 
            WHERE user_email = ? 
            AND status = ?
            `,
            [email, "active"]
        );

        if (active.length === 0) {

            return res.status(404).json({
                status: "error",
                message: "Tidak ada prediction aktif"
            });

        }

        const prediction_id = active[0].prediction_id;

        const [countResult] = await churnguard_con.query(
            `
            SELECT COUNT(*) as total
            FROM prediction_detail
            WHERE prediction_id = ?
            `,
            [prediction_id]
        );

        const totalData = countResult[0].total;

        const [pred_data] = await churnguard_con.query(
            `
            SELECT *
            FROM prediction_detail
            WHERE prediction_id = ?
            LIMIT ? OFFSET ?
            `,
            [prediction_id, limit, offset]
        );

        return res.json({
            status: "success",
            prediction_id,
            page,
            limit,
            totalData,
            totalPages: Math.ceil(totalData / limit),
            data: pred_data
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });

    }
};