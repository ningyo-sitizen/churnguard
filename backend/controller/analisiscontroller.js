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

        // GENRE DISTRIBUTION
        const [genreDistribution] = await churnguard_con.query(
            `
    SELECT 
        GenrePreference,
        COUNT(*) as total
    FROM prediction_detail
    WHERE prediction_id = ?
    GROUP BY GenrePreference
    ORDER BY total DESC
    `,
            [prediction_id]
        );

        // CONTENT TYPE DISTRIBUTION
        const [contentTypeDistribution] = await churnguard_con.query(
            `
    SELECT 
        ContentType,
        COUNT(*) as total
    FROM prediction_detail
    WHERE prediction_id = ?
    GROUP BY ContentType
    ORDER BY total DESC
    `,
            [prediction_id]
        );

        // GENDER DISTRIBUTION
        const [genderDistribution] = await churnguard_con.query(
            `
    SELECT 
        Gender,
        COUNT(*) as total
    FROM prediction_detail
    WHERE prediction_id = ?
    GROUP BY Gender
    `,
            [prediction_id]
        );

        const [accountAgeDistribution] = await churnguard_con.query(
            `
    SELECT 
        CASE
            WHEN AccountAge <= 12 THEN '0-12 Months'
            WHEN AccountAge <= 24 THEN '12-24 Months'
            WHEN AccountAge <= 32 THEN 24-32 Months'
            ELSE '24+ Months'
        END as age_group,
        COUNT(*) as total
    FROM prediction_detail
    WHERE prediction_id = ?
    GROUP BY age_group
    ORDER BY total DESC
    `,
            [prediction_id]
        );

        const [clusterDistribution] = await churnguard_con.query(
            `
    SELECT 
        Cluster,
        COUNT(*) as total
    FROM prediction_detail
    WHERE prediction_id = ?
    GROUP BY Cluster
    `,
            [prediction_id]
        );

        const [churnByGenre] = await churnguard_con.query(
            `
    SELECT 
        GenrePreference,
        SUM(CASE WHEN Prediction = 1 THEN 1 ELSE 0 END) as churn_total,
        COUNT(*) as total_customer
    FROM prediction_detail
    WHERE prediction_id = ?
    GROUP BY GenrePreference
    ORDER BY churn_total DESC
    LIMIT 5
    `,
            [prediction_id]
        );

        const [churnByAccountAge] = await churnguard_con.query(
            `
    SELECT 
        CASE
            WHEN AccountAge <= 12 THEN '0-12 Months'
            WHEN AccountAge <= 24 THEN '12-24 Months'
            WHEN AccountAge <= 32 THEN '24-32 Months'
            ELSE '24+ Months'
        END as age_group,

        SUM(CASE WHEN Prediction = 1 THEN 1 ELSE 0 END) as churn_total,
        COUNT(*) as total_customer

    FROM prediction_detail
    WHERE prediction_id = ?
    GROUP BY age_group
    `,
            [prediction_id]
        );

        const [viewingBySegment] = await churnguard_con.query(
            `
    SELECT 
        Segment,
        AVG(ViewingHoursPerWeek) as avg_viewing
    FROM prediction_detail
    WHERE prediction_id = ?
    GROUP BY Segment
    `,
            [prediction_id]
        );

        const [chargesBySegment] = await churnguard_con.query(
            `
    SELECT 
        Segment,
        AVG(MonthlyCharges) as avg_monthly
    FROM prediction_detail
    WHERE prediction_id = ?
    GROUP BY Segment
    `,
            [prediction_id]
        );


        return res.status(200).json({

            message: "Berhasil mengambil dashboard stats",

            data: {

                overview: {
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
                },

                distribution: {

                    risk:
                        riskDistribution,

                    segment:
                        segmentDistribution,

                    genre:
                        genreDistribution,

                    content_type:
                        contentTypeDistribution,

                    gender:
                        genderDistribution,

                    account_age:
                        accountAgeDistribution,

                    cluster:
                        clusterDistribution,
                },

                churn_analysis: {

                    subscription:
                        subscriptionStats,

                    genre:
                        churnByGenre,

                    account_age:
                        churnByAccountAge,
                },

                segment_analysis: {

                    viewing:
                        viewingBySegment,

                    charges:
                        chargesBySegment,
                },

                top_insight: {

                    genre:
                        topGenre
                }

            }

        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            message: "Internal server error"
        });

    }

};

