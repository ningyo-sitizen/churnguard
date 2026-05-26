const churnguard_con = require("../config/db");

// ─────────────────────────────────────────────
// GET /api/reports/feedback
// Data dari tabel: feedback (feedback_id, email, topik, subjek, isi_feed, rating, time)
// ─────────────────────────────────────────────
const getFeedbackStats = async (req, res) => {
    try {
        // Hitung jumlah feedback per topik
        const [topikRows] = await churnguard_con.query(`
            SELECT
                topik,
                COUNT(*) AS total,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM feedback), 1) AS percentage
            FROM feedback
            GROUP BY topik
            ORDER BY total DESC
        `);

        // Hitung rata-rata rating
        const [[ratingRow]] = await churnguard_con.query(`
            SELECT
                ROUND(AVG(rating), 2) AS avg_rating,
                COUNT(*) AS total_feedback
            FROM feedback
        `);

        // Hitung feedback per bulan (6 bulan terakhir)
        const [monthlyRows] = await churnguard_con.query(`
            SELECT
                DATE_FORMAT(time, '%b') AS month,
                DATE_FORMAT(time, '%Y-%m') AS month_key,
                COUNT(*) AS total
            FROM feedback
            WHERE time >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month_key, month
            ORDER BY month_key ASC
        `);

        return res.json({
            success: true,
            data: {
                byTopik: topikRows,
                summary: ratingRow,
                monthly: monthlyRows,
            },
        });
    } catch (error) {
        console.error("getFeedbackStats error:", error);
        return res.status(500).json({ success: false, message: "Gagal mengambil data feedback" });
    }
};

// ─────────────────────────────────────────────
// GET /api/reports/revenue
// Data dari tabel: payment (id, order_id, name, price, payment_method, plan, status, created_at)
// ─────────────────────────────────────────────
const getRevenueStats = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();

        // Revenue per bulan
        const [monthlyRevenue] = await churnguard_con.query(`
            SELECT
                DATE_FORMAT(created_at, '%b') AS month,
                DATE_FORMAT(created_at, '%Y-%m') AS month_key,
                SUM(price) AS total_revenue,
                COUNT(*) AS total_transaksi
            FROM payment
            WHERE YEAR(created_at) = ?
              AND status = 'success'
            GROUP BY month_key, month
            ORDER BY month_key ASC
        `, [year]);

        // Total revenue keseluruhan
        const [[totalRow]] = await churnguard_con.query(`
            SELECT
                SUM(price) AS total_revenue,
                COUNT(*) AS total_transaksi
            FROM payment
            WHERE status = 'success'
        `);

        // Revenue per plan/tier
        const [byPlan] = await churnguard_con.query(`
            SELECT
                plan,
                COUNT(*) AS total_user,
                SUM(price) AS total_revenue
            FROM payment
            WHERE status = 'success'
            GROUP BY plan
            ORDER BY total_revenue DESC
        `);

        // Payment method distribution
        const [byMethod] = await churnguard_con.query(`
            SELECT
                payment_method,
                COUNT(*) AS total,
                ROUND(COUNT(*) * 100.0 / (
                    SELECT COUNT(*) FROM payment WHERE status = 'success'
                ), 1) AS percentage
            FROM payment
            WHERE status = 'success'
            GROUP BY payment_method
            ORDER BY total DESC
        `);

        return res.json({
            success: true,
            data: {
                monthlyRevenue,
                summary: totalRow,
                byPlan,
                byMethod,
            },
        });
    } catch (error) {
        console.error("getRevenueStats error:", error);
        return res.status(500).json({ success: false, message: "Gagal mengambil data revenue" });
    }
};

// ─────────────────────────────────────────────
// GET /api/reports/prediction
// Data dari tabel: prediction_detail
// (AccountAge, MonthlyCharges, TotalCharges, ViewingHoursPerWeek,
//  AverageViewingDuration, SubscriptionType, ContentType, GenrePreference,
//  Probability, Risk, Prediction, Cluster, Segment, email_sent, email_sent_at)
// ─────────────────────────────────────────────
const getPredictionStats = async (req, res) => {
    try {
        // Distribusi risk level
        const [riskRows] = await churnguard_con.query(`
            SELECT
                Risk,
                COUNT(*) AS total,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM prediction_detail), 1) AS percentage
            FROM prediction_detail
            WHERE Risk IS NOT NULL
            GROUP BY Risk
            ORDER BY FIELD(Risk, 'High', 'Medium', 'Low')
        `);

        // Churn rate per genre
        const [genreRows] = await churnguard_con.query(`
            SELECT
                GenrePreference AS genre,
                COUNT(*) AS total,
                SUM(CASE WHEN Prediction = 1 THEN 1 ELSE 0 END) AS predicted_churn,
                ROUND(
                    SUM(CASE WHEN Prediction = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
                    1
                ) AS churn_percentage
            FROM prediction_detail
            WHERE GenrePreference IS NOT NULL
            GROUP BY GenrePreference
            ORDER BY churn_percentage DESC
        `);

        // Rata-rata perilaku pengguna
        const [[behaviorRow]] = await churnguard_con.query(`
            SELECT
                ROUND(AVG(AccountAge), 1)               AS avg_account_age,
                ROUND(AVG(ViewingHoursPerWeek), 1)      AS avg_viewing_hours,
                ROUND(AVG(AverageViewingDuration), 1)   AS avg_viewing_duration,
                ROUND(AVG(MonthlyCharges), 2)           AS avg_monthly_charges,
                ROUND(AVG(Probability), 3)              AS avg_churn_probability
            FROM prediction_detail
        `);

        // Email stats (dari kolom email_sent & email_sent_at)
        const [emailMonthly] = await churnguard_con.query(`
            SELECT
                DATE_FORMAT(email_sent_at, '%b') AS month,
                DATE_FORMAT(email_sent_at, '%Y-%m') AS month_key,
                COUNT(*) AS total_sent
            FROM prediction_detail
            WHERE email_sent_at IS NOT NULL
              AND email_sent_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month_key, month
            ORDER BY month_key ASC
        `);

        // Distribusi subscription type vs churn
        const [subscriptionRows] = await churnguard_con.query(`
            SELECT
                SubscriptionType,
                COUNT(*) AS total,
                SUM(CASE WHEN Prediction = 1 THEN 1 ELSE 0 END) AS churn_count,
                ROUND(
                    SUM(CASE WHEN Prediction = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
                    1
                ) AS churn_rate
            FROM prediction_detail
            WHERE SubscriptionType IS NOT NULL
            GROUP BY SubscriptionType
        `);

        return res.json({
            success: true,
            data: {
                riskDistribution: riskRows,
                genreChurn: genreRows,
                userBehavior: behaviorRow,
                emailMonthly,
                subscriptionChurn: subscriptionRows,
            },
        });
    } catch (error) {
        console.error("getPredictionStats error:", error);
        return res.status(500).json({ success: false, message: "Gagal mengambil data prediksi" });
    }
};

// ─────────────────────────────────────────────
// GET /api/reports/summary
// Ringkasan semua data untuk InfoCards
// ─────────────────────────────────────────────
const getSummaryCards = async (req, res) => {
    try {
        // Total revenue bulan ini
        const [[revenueRow]] = await churnguard_con.query(`
            SELECT IFNULL(SUM(price), 0) AS total
            FROM payment
            WHERE status = 'success'
              AND MONTH(created_at) = MONTH(NOW())
              AND YEAR(created_at) = YEAR(NOW())
        `);

        // Total user aktif (dari payment yang sukses, distinct name/order)
        const [[userRow]] = await churnguard_con.query(`
            SELECT COUNT(DISTINCT order_id) AS total
            FROM payment
            WHERE status = 'success'
        `);

        // Total churn prediction
        const [[churnRow]] = await churnguard_con.query(`
            SELECT
                COUNT(*) AS total_predicted,
                SUM(CASE WHEN Prediction = 1 THEN 1 ELSE 0 END) AS total_churn,
                ROUND(
                    SUM(CASE WHEN Prediction = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
                    1
                ) AS churn_rate
            FROM prediction_detail
        `);

        // Total feedback bulan ini
        const [[feedbackRow]] = await churnguard_con.query(`
            SELECT COUNT(*) AS total
            FROM feedback
            WHERE MONTH(time) = MONTH(NOW())
              AND YEAR(time) = YEAR(NOW())
        `);

        return res.json({
            success: true,
            data: {
                revenue: revenueRow.total,
                activeUsers: userRow.total,
                churnRate: churnRow.churn_rate,
                totalChurn: churnRow.total_churn,
                feedbackThisMonth: feedbackRow.total,
            },
        });
    } catch (error) {
        console.error("getSummaryCards error:", error);
        return res.status(500).json({ success: false, message: "Gagal mengambil summary" });
    }
};

module.exports = {
    getFeedbackStats,
    getRevenueStats,
    getPredictionStats,
    getSummaryCards,
};