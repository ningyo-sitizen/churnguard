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

    const [detail_exsist] = await churnguard_con.query(`
      select detail_id from prediction_detail where prediction_id = ? LIMIT 1
    `,[prediction_id])

    if(detail_exsist.length === 0){
      const [delete_active] = await churnguard_con.query(`
        DELETE FROM prediction_list WHERE prediction_id = ?
        `,[prediction_id])
    }

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

exports.nosave = async (req, res) => {

  try {

    const authHeader = req.headers.authorization;

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const email = decoded.email;

    const [active] = await churnguard_con.query(
      'SELECT * FROM prediction_list WHERE user_email = ? AND status = ?',
      [email, "active"]
    );

    if (active.length === 0) {

      return res.status(404).json({
        status: "error",
        message: "Prediction tidak ditemukan"
      });

    }

    const data = active[0];

    const id = data.prediction_id;

    await churnguard_con.query(
      'DELETE FROM prediction_detail WHERE prediction_id = ?',
      [id]
    );

    await churnguard_con.query(
      'DELETE FROM prediction_list WHERE prediction_id = ?',
      [id]
    );

    return res.status(200).json({
      status: "success",
      message: "Prediction berhasil dihapus"
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });

  }
};

exports.yessave = async (req, res) => {

  try {

    const authHeader = req.headers.authorization;

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const email = decoded.email;

    const [active] = await churnguard_con.query(
      'SELECT * FROM prediction_list WHERE user_email = ? AND status = ?',
      [email, "active"]
    );

    if (active.length === 0) {

      return res.status(404).json({
        status: "error",
        message: "Prediction tidak ditemukan"
      });

    }

    const data = active[0];

    const id = data.prediction_id;

    await churnguard_con.query(
      'UPDATE prediction_list SET status = "saved" WHERE prediction_id = ?',
      [id]
    );

    return res.status(200).json({
      status: "success",
      message: "Prediction berhasil disave"
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });

  }
};

exports.analytics = async (req, res) => {

  try {

    const authHeader = req.headers.authorization;

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const email = decoded.email;

    const [active] = await churnguard_con.query(
      `
            SELECT *
            FROM prediction_list
            WHERE user_email = ?
            AND status = 'active'
            `,
      [email]
    );

    if (active.length === 0) {

      return res.status(404).json({
        status: "error",
        message: "Prediction tidak ditemukan"
      });

    }

    const prediction_id = active[0].prediction_id;

    // STATS
    const [stats] = await churnguard_con.query(
      `
            SELECT
                COUNT(*) as totalCustomer,

                SUM(
                    CASE
                        WHEN Risk = 'High'
                        THEN 1
                        ELSE 0
                    END
                ) as highRisk,

                SUM(
                    CASE
                        WHEN Prediction = 1
                        THEN 1
                        ELSE 0
                    END
                ) as churnCustomer,

                ROUND(
                    SUM(MonthlyCharges),
                    2
                ) as totalRevenue

            FROM prediction_detail
            WHERE prediction_id = ?
            `,
      [prediction_id]
    );

    // PIE CHART
    const [risk] = await churnguard_con.query(
      `
            SELECT
                Risk as name,
                COUNT(*) as value
            FROM prediction_detail
            WHERE prediction_id = ?
            GROUP BY Risk
            `,
      [prediction_id]
    );

    // BAR CHART
    const [subscription] = await churnguard_con.query(
      `
            SELECT
                SubscriptionType as name,

                SUM(
                    CASE
                        WHEN Prediction = 1
                        THEN 1
                        ELSE 0
                    END
                ) as churn,

                SUM(
                    CASE
                        WHEN Prediction = 0
                        THEN 1
                        ELSE 0
                    END
                ) as nonChurn

            FROM prediction_detail
            WHERE prediction_id = ?
            GROUP BY SubscriptionType
            `,
      [prediction_id]
    );

    // SEGMENT INSIGHT
    const [segment] = await churnguard_con.query(
      `
            SELECT
                Segment as segment,
                COUNT(*) as total,

                ROUND(
                    AVG(MonthlyCharges),
                    2
                ) as avgMonthly,

                ROUND(
                    AVG(ViewingHoursPerWeek),
                    2
                ) as avgView

            FROM prediction_detail
            WHERE prediction_id = ?
            GROUP BY Segment
            `,
      [prediction_id]
    );

    return res.status(200).json({

      status: "success",

      stats: stats[0],

      riskDistribution: risk,

      subscriptionVsChurn: subscription,

      segmentInsight: segment

    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });

  }

};





exports.getPredictionHistory = async (req, res) => {
  const authHeader = req.headers.authorization;

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  try {
    const email = decoded.email;

    const [rows] = await churnguard_con.query(`
    SELECT 
        prediction_list.prediction_id,
        prediction_list.filename,
        prediction_list.created_at,

        COUNT(prediction_detail.detail_id) AS total_customer,

        SUM(
            CASE 
                WHEN prediction_detail.Prediction = 1 
                THEN 1 
                ELSE 0 
            END
        ) AS total_churn,

        SUM(
            CASE 
                WHEN prediction_detail.Risk = 'High'
                THEN 1
                ELSE 0
            END
        ) AS total_high_risk,

        ROUND(
            (
                SUM(
                    CASE 
                        WHEN prediction_detail.Risk = 'High'
                        THEN 1
                        ELSE 0
                    END
                ) / COUNT(prediction_detail.detail_id)
            ) * 100,
            2
        ) AS high_risk_percentage

    FROM prediction_list

    LEFT JOIN prediction_detail
        ON prediction_list.prediction_id = prediction_detail.prediction_id

    WHERE 
        prediction_list.user_email = ?
        AND prediction_list.status = 'saved'

    GROUP BY prediction_list.prediction_id

    ORDER BY prediction_list.created_at DESC
`, [email]);

    return res.status(200).json({
      success: true,
      data: rows
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
};


exports.getPredictionDashboardHistory = async (req, res) => {

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
    const prediction_id = req.query.prediction_id;

    const offset = (page - 1) * limit;

    const [active] = await churnguard_con.query(
      `
            SELECT * 
            FROM prediction_list 
            WHERE user_email = ? 
            AND status = ?
            `,
      [email, "saved"]
    );

    if (active.length === 0) {

      return res.status(404).json({
        status: "error",
        message: "Tidak ada prediction aktif"
      });

    }
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

exports.deletePrediction = async (req, res) => {

    try {

        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "ID wajib diisi"
            });
        }

        const [checkData] = await churnguard_con.query(
            `SELECT * FROM prediction_list
             WHERE prediction_id = ?`,
            [id]
        );

        if (checkData.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Data tidak ditemukan"
            });
        }

        await churnguard_con.query(
            `DELETE FROM prediction_list
             WHERE prediction_id = ?`,
            [id]
        );

        await churnguard_con.query(
          `DELETE FROM prediction_detail
          WHERE prediction_id = ?`,[id]
        )

        return res.status(200).json({
            status: "success",
            message: "History berhasil dihapus"
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
};

