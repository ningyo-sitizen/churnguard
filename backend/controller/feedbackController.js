const churnguard_con = require('../config/db');

// Helper supaya mysql callback bisa dipakai dengan async/await
const queryAsync = async (sql, params = []) => {
    const [rows] = await churnguard_con.query(sql, params);
    return rows;
};

// =========================
// GET ALL FEEDBACK
// =========================
const getAllFeedback = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            sortBy = "time",
            sortOrder = "DESC",
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // whitelist anti SQL injection
        const allowedSortBy = ["feedback_id", "email", "topik", "subjek", "rating", "time"];
        const allowedOrder = ["ASC", "DESC"];

        const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : "time";
        const safeSortOrder = allowedOrder.includes(sortOrder.toUpperCase())
            ? sortOrder.toUpperCase()
            : "DESC";

        const searchQuery = search
            ? `WHERE email LIKE ? OR topik LIKE ? OR subjek LIKE ? OR isi_feed LIKE ?`
            : "";

        const searchParams = search
            ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
            : [];

        // hitung total data
        const countResult = await queryAsync(
            `SELECT COUNT(*) AS total FROM feedback ${searchQuery}`,
            searchParams
        );

        const total = countResult[0].total;

        // ambil data
        const rows = await queryAsync(
            `SELECT
                feedback_id,
                email,
                topik,
                subjek,
                isi_feed,
                rating,
                time
             FROM feedback
             ${searchQuery}
             ORDER BY ${safeSortBy} ${safeSortOrder}
             LIMIT ? OFFSET ?`,
            [...searchParams, parseInt(limit), offset]
        );

        const totalPages = Math.max(1, Math.ceil(total / parseInt(limit)));

        return res.status(200).json({
            success: true,
            message: "Data feedback berhasil diambil",
            data: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalRecords: total,
                limit: parseInt(limit),
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1,
            },
        });

    } catch (error) {
        console.error("Error getAllFeedback:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
            error: error.message,
        });
    }
};

// =========================
// GET FEEDBACK BY ID
// =========================
const getFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;

        const rows = await queryAsync(
            `SELECT * FROM feedback WHERE feedback_id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Feedback tidak ditemukan",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Data feedback berhasil diambil",
            data: rows[0],
        });

    } catch (error) {
        console.error("Error getFeedbackById:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
            error: error.message,
        });
    }
};

// =========================
// CREATE FEEDBACK
// =========================
const createFeedback = async (req, res) => {
    try {
        const { email, topik, subjek, isi_feed, rating } = req.body;

        if (!email || !topik || !subjek || !isi_feed || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "Semua field wajib diisi",
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating harus antara 1 sampai 5",
            });
        }

        const result = await queryAsync(
            `INSERT INTO feedback (email, topik, subjek, isi_feed, rating)
             VALUES (?, ?, ?, ?, ?)`,
            [email, topik, subjek, isi_feed, rating]
        );

        return res.status(201).json({
            success: true,
            message: "Feedback berhasil dikirim",
            data: {
                feedback_id: result.insertId,
                email,
                topik,
                subjek,
                isi_feed,
                rating,
            },
        });

    } catch (error) {
        console.error("Error createFeedback:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
            error: error.message,
        });
    }
};

// =========================
// DELETE FEEDBACK
// =========================
const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        const check = await queryAsync(
            `SELECT feedback_id FROM feedback WHERE feedback_id = ?`,
            [id]
        );

        if (check.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Feedback tidak ditemukan",
            });
        }

        await queryAsync(
            `DELETE FROM feedback WHERE feedback_id = ?`,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Feedback berhasil dihapus",
        });

    } catch (error) {
        console.error("Error deleteFeedback:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
            error: error.message,
        });
    }
};

// =========================
// GET SUMMARY / STATISTIK
// =========================
const getFeedbackSummary = async (req, res) => {
    try {
        const result = await queryAsync(`
            SELECT
                COUNT(*) AS total_feedback,
                ROUND(AVG(rating), 1) AS avg_rating,
                SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS total_positif,
                SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) AS total_negatif,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS total_netral
            FROM feedback
        `);

        return res.status(200).json({
            success: true,
            message: "Statistik feedback berhasil diambil",
            data: result[0],
        });

    } catch (error) {
        console.error("Error getFeedbackSummary:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
            error: error.message,
        });
    }
};

module.exports = {
    getAllFeedback,
    getFeedbackById,
    createFeedback,
    deleteFeedback,
    getFeedbackSummary,
};