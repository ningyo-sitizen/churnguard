const churnguard_con = require("../config/db");

// ─────────────────────────────────────────────
// GET /api/dashboard/summary
// 4 InfoCards: Total MRR, Total ARR, Churn Rate, Total Subs
// Sumber: payment + prediction_detail
// ─────────────────────────────────────────────
const getDashboardSummary = async (req, res) => {
    try {
        // ── Total MRR (revenue bulan ini, status success) ──
        const [[mrrRow]] = await churnguard_con.query(`
            SELECT IFNULL(SUM(price), 0) AS mrr
            FROM payment
            WHERE status = 'success'
              AND MONTH(created_at) = MONTH(NOW())
              AND YEAR(created_at)  = YEAR(NOW())
        `);

        // ── MRR bulan lalu (untuk % change) ──
        const [[mrrLastRow]] = await churnguard_con.query(`
            SELECT IFNULL(SUM(price), 0) AS mrr_last
            FROM payment
            WHERE status = 'success'
              AND MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
              AND YEAR(created_at)  = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
        `);

        // ── Total ARR (revenue tahun ini) ──
        const [[arrRow]] = await churnguard_con.query(`
            SELECT IFNULL(SUM(price), 0) AS arr
            FROM payment
            WHERE status = 'success'
              AND YEAR(created_at) = YEAR(NOW())
        `);

        // ── ARR tahun lalu ──
        const [[arrLastRow]] = await churnguard_con.query(`
            SELECT IFNULL(SUM(price), 0) AS arr_last
            FROM payment
            WHERE status = 'success'
              AND YEAR(created_at) = YEAR(NOW()) - 1
        `);

        // ── Churn Rate dari prediction_detail ──
        const [[churnRow]] = await churnguard_con.query(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN Prediction = 1 THEN 1 ELSE 0 END) AS churn_count
            FROM prediction_detail
        `);

        // ── Churn Rate bulan lalu (pakai email_sent_at sebagai proxy waktu) ──
        const [[churnLastRow]] = await churnguard_con.query(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN Prediction = 1 THEN 1 ELSE 0 END) AS churn_count
            FROM prediction_detail
            WHERE email_sent_at IS NOT NULL
              AND MONTH(email_sent_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
              AND YEAR(email_sent_at)  = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
        `);

        // ── Total Subs aktif (payment success, distinct order_id) ──
        const [[subsRow]] = await churnguard_con.query(`
            SELECT COUNT(DISTINCT order_id) AS total_subs
            FROM payment
            WHERE status = 'success'
        `);

        // ── Subs bulan lalu ──
        const [[subsLastRow]] = await churnguard_con.query(`
            SELECT COUNT(DISTINCT order_id) AS total_subs_last
            FROM payment
            WHERE status = 'success'
              AND MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
              AND YEAR(created_at)  = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
        `);

        // ── Hitung % change helper ──
        const pctChange = (curr, prev) => {
            if (!prev || prev === 0) return 0;
            return parseFloat(((curr - prev) / prev * 100).toFixed(1));
        };

        const churnRate = churnRow.total > 0
            ? parseFloat((churnRow.churn_count / churnRow.total * 100).toFixed(1))
            : 0;

        const churnRateLast = churnLastRow.total > 0
            ? parseFloat((churnLastRow.churn_count / churnLastRow.total * 100).toFixed(1))
            : 0;

        return res.json({
            success: true,
            data: {
                mrr: {
                    value: mrrRow.mrr,
                    change: pctChange(mrrRow.mrr, mrrLastRow.mrr_last),
                },
                arr: {
                    value: arrRow.arr,
                    change: pctChange(arrRow.arr, arrLastRow.arr_last),
                },
                churnRate: {
                    value: churnRate,
                    change: pctChange(churnRate, churnRateLast),
                },
                totalSubs: {
                    value: subsRow.total_subs,
                    change: pctChange(subsRow.total_subs, subsLastRow.total_subs_last),
                },
            },
        });
    } catch (error) {
        console.error("getDashboardSummary error:", error);
        return res.status(500).json({ success: false, message: "Gagal mengambil summary dashboard" });
    }
};

// ─────────────────────────────────────────────
// GET /api/dashboard/charts
// Revenue line, Email line, Subscription bar
// Query param: ?year=2025
// ─────────────────────────────────────────────
const getDashboardCharts = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();

        // ── Revenue per bulan (dari payment) ──
        const [revenueRows] = await churnguard_con.query(`
            SELECT
                DATE_FORMAT(created_at, '%b')  AS month,
                DATE_FORMAT(created_at, '%m')  AS month_num,
                IFNULL(SUM(price), 0)          AS total_revenue
            FROM payment
            WHERE status = 'success'
              AND YEAR(created_at) = ?
            GROUP BY month_num, month
            ORDER BY month_num ASC
        `, [year]);

        // ── Email sent per bulan (dari prediction_detail.email_sent_at) ──
        const [emailRows] = await churnguard_con.query(`
            SELECT
                DATE_FORMAT(email_sent_at, '%b') AS month,
                DATE_FORMAT(email_sent_at, '%m') AS month_num,
                COUNT(*)                         AS total_sent
            FROM prediction_detail
            WHERE email_sent_at IS NOT NULL
              AND YEAR(email_sent_at) = ?
            GROUP BY month_num, month
            ORDER BY month_num ASC
        `, [year]);

        // ── Subscription per bulan berdasarkan SubscriptionType ──
        // Ambil 3 tipe teratas
        const [subTypeRows] = await churnguard_con.query(`
            SELECT DISTINCT SubscriptionType
            FROM prediction_detail
            WHERE SubscriptionType IS NOT NULL
            LIMIT 3
        `);

        const subTypes = subTypeRows.map(r => r.SubscriptionType);

        // Query subscription count per bulan per type
        // Pakai email_sent_at sebagai referensi waktu
        const subDatasets = await Promise.all(
            subTypes.map(async (type) => {
                const [rows] = await churnguard_con.query(`
                    SELECT
                        DATE_FORMAT(email_sent_at, '%b') AS month,
                        DATE_FORMAT(email_sent_at, '%m') AS month_num,
                        COUNT(*) AS total
                    FROM prediction_detail
                    WHERE SubscriptionType = ?
                      AND email_sent_at IS NOT NULL
                      AND YEAR(email_sent_at) = ?
                    GROUP BY month_num, month
                    ORDER BY month_num ASC
                `, [type, year]);
                return { type, rows };
            })
        );

        // Warna per subscription type
        const getSubscriptionColor = (type) => {
            switch (type?.toLowerCase().trim()) {
                case "trial":
                    return "#D6B485";

                case "insight enthusiast":
                    return "#B81B52";

                case "intelligence master":
                    return "rgba(245, 158, 11, 0.8)";

                default:
                    return "#94A3B8";
            }
        };

        return res.json({
            success: true,
            data: {
                revenue: revenueRows.map(r => ({
                    month: r.month,
                    value: r.total_revenue,
                })),
                email: emailRows.map(r => ({
                    month: r.month,
                    value: r.total_sent,
                })),
                subscription: subDatasets.map((s) => ({
                    type: s.type,
                    color: getSubscriptionColor(s.type),
                    months: s.rows.map(r => ({
                        month: r.month,
                        value: r.total
                    })),
                })),
            },
        });
    } catch (error) {
        console.error("getDashboardCharts error:", error);
        return res.status(500).json({ success: false, message: "Gagal mengambil data chart dashboard" });
    }
};

const getDashboardUserInfo = async (req, res) => {
    try {
        return res.json({
            success: true,
            data: {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error("getDashboardUserInfo error:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil user info"
        });
    }
};

module.exports = {
    getDashboardSummary,
    getDashboardCharts,
    getDashboardUserInfo,
};
