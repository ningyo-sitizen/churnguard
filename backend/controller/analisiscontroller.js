const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");

exports.getDashboardStats = async (req, res) => {

    try {

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

        const [active] = await churnguard_con.query(
            `
            SELECT *
            FROM prediction_list
            WHERE user_email = ?
            AND status = "active"
            `,
            [email]
        );

        if (active.length === 0) {

            return res.status(404).json({
                message: "Prediction tidak ditemukan"
            });

        }

        const prediction_id = active[0].prediction_id;

        // TOTAL CUSTOMER
        const [totalCustomer] = await churnguard_con.query(
            `
            SELECT COUNT(*) as total
            FROM prediction_detail
            WHERE prediction_id = ?
            `,
            [prediction_id]
        );

        // TOTAL CHURN
        const [totalChurn] = await churnguard_con.query(
            `
            SELECT COUNT(*) as total
            FROM prediction_detail
            WHERE prediction_id = ?
            AND Prediction = 1
            `,
            [prediction_id]
        );

        // CHURN RATE
        const [churnRate] = await churnguard_con.query(
            `
            SELECT 
            (
                SUM(CASE WHEN Prediction = 1 THEN 1 ELSE 0 END)
                / COUNT(*)
            ) * 100 as churn_rate
            FROM prediction_detail
            WHERE prediction_id = ?
            `,
            [prediction_id]
        );

        // RISK DISTRIBUTION
        const [riskDistribution] = await churnguard_con.query(
            `
            SELECT Risk, COUNT(*) as total
            FROM prediction_detail
            WHERE prediction_id = ?
            GROUP BY Risk
            `,
            [prediction_id]
        );

        // SEGMENT DISTRIBUTION
        const [segmentDistribution] = await churnguard_con.query(
            `
            SELECT Segment, COUNT(*) as total
            FROM prediction_detail
            WHERE prediction_id = ?
            GROUP BY Segment
            `,
            [prediction_id]
        );

        // SUBSCRIPTION VS CHURN
        const [subscriptionStats] = await churnguard_con.query(
            `
            SELECT 
                SubscriptionType,
                COUNT(*) as total_customer,
                SUM(CASE WHEN Prediction = 1 THEN 1 ELSE 0 END) as churn_customer
            FROM prediction_detail
            WHERE prediction_id = ?
            GROUP BY SubscriptionType
            `,
            [prediction_id]
        );

        // AVG VIEWING HOURS
        const [avgViewing] = await churnguard_con.query(
            `
            SELECT AVG(ViewingHoursPerWeek) as avg_viewing
            FROM prediction_detail
            WHERE prediction_id = ?
            `,
            [prediction_id]
        );

        // AVG MONTHLY CHARGES
        const [avgMonthly] = await churnguard_con.query(
            `
            SELECT AVG(MonthlyCharges) as avg_monthly
            FROM prediction_detail
            WHERE prediction_id = ?
            `,
            [prediction_id]
        );

        // TOP GENRE
        const [topGenre] = await churnguard_con.query(
            `
            SELECT 
                GenrePreference,
                COUNT(*) as total
            FROM prediction_detail
            WHERE prediction_id = ?
            GROUP BY GenrePreference
            ORDER BY total DESC
            LIMIT 5
            `,
            [prediction_id]
        );

        return res.status(200).json({

            message: "Berhasil mengambil dashboard stats",

            data: {

                total_customer:
                    totalCustomer[0].total,

                churn_customer:
                    totalChurn[0].total,

                churn_rate:
                    Number(
                        churnRate[0].churn_rate
                    ).toFixed(2),

                avg_viewing_hours:
                    Number(
                        avgViewing[0].avg_viewing
                    ).toFixed(2),

                avg_monthly_charges:
                    Number(
                        avgMonthly[0].avg_monthly
                    ).toFixed(2),

                risk_distribution:
                    riskDistribution,

                segment_distribution:
                    segmentDistribution,

                subscription_stats:
                    subscriptionStats,

                top_genre:
                    topGenre

            }

        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            message: "Internal server error"
        });

    }

};