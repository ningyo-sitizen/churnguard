const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");

exports.getPrediction = async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const email = decoded.email;

    const [active] = await churnguard_con.query(
        "SELECT * FROM prediction_list WHERE user_email = ? AND status = ?",
        [email, "active"]
    );

    if (active.length === 0) {
        return res.status(404).json({
            status: "error",
            message: "Tidak ada prediction aktif"
        });
    }

    const prediction_id = active[0].prediction_id;

    const [pred_data] = await churnguard_con.query(
        "SELECT * FROM prediction_detail WHERE prediction_id = ? LIMIT 10",
        [prediction_id]
    );

    return res.json({
        status: "success",
        prediction_id,
        data: pred_data
    });

}