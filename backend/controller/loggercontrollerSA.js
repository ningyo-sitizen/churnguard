const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");
const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────
// Struktur tabel `logger`:
//   log_id       INT AUTO_INCREMENT PRIMARY KEY
//   user_email   VARCHAR(255)
//   event_name   VARCHAR(255)
//   action       VARCHAR(255)
//   value        INT
//   created      DATETIME DEFAULT CURRENT_TIMESTAMP
// ─────────────────────────────────────────────


// ─────────────────────────────────────────────
// HELPER: build WHERE clause + params array
// ─────────────────────────────────────────────
const buildWhereClause = ({ search, startDate, endDate }) => {
    const conditions = [];
    const params     = [];

    // Filter rentang tanggal berdasarkan kolom `created`
    if (startDate && endDate) {
        conditions.push("created BETWEEN ? AND ?");
        params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
    } else if (startDate) {
        conditions.push("created >= ?");
        params.push(`${startDate} 00:00:00`);
    } else if (endDate) {
        conditions.push("created <= ?");
        params.push(`${endDate} 23:59:59`);
    }

    // Filter pencarian: user_email, event_name, action
    if (search) {
        conditions.push("(user_email LIKE ? OR event_name LIKE ? OR action LIKE ?)");
        const like = `%${search}%`;
        params.push(like, like, like);
    }

    const whereSQL = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    return { whereSQL, params };
};


// ─────────────────────────────────────────────
// GET /api/logger/logging
// Query params:
//   page       : number  (default 1)
//   limit      : number  (default 8)
//   search     : string  (cari user_email / event_name / action)
//   sortBy     : "created" | "user_email"  (default "created")
//   sortOrder  : "ASC" | "DESC"            (default "DESC")
//   startDate  : YYYY-MM-DD
//   endDate    : YYYY-MM-DD
// ─────────────────────────────────────────────
const getLogs = async (req, res) => {
    try {
        // ── Parse & validasi query params ────
        const page      = Math.max(1, parseInt(req.query.page)  || 1);
        const limit     = Math.max(1, parseInt(req.query.limit) || 8);
        const offset    = (page - 1) * limit;
        const search    = req.query.search    ? req.query.search.trim() : null;
        const startDate = req.query.startDate || null;
        const endDate   = req.query.endDate   || null;

        // Whitelist sortBy & sortOrder agar aman dari SQL injection
        const allowedSortBy    = ["created", "user_email"];
        const allowedSortOrder = ["ASC", "DESC"];

        // Map nilai dari frontend ke kolom tabel yang sebenarnya
        // Frontend kirim sortBy: "time" | "user" → kita map ke kolom tabel
        const sortByMap = {
            time: "created",
            user: "user_email",
        };
        const rawSortBy = req.query.sortBy || "time";
        const sortBy    = allowedSortBy.includes(sortByMap[rawSortBy])
            ? sortByMap[rawSortBy]
            : "created";

        const sortOrder = allowedSortOrder.includes((req.query.sortOrder || "").toUpperCase())
            ? req.query.sortOrder.toUpperCase()
            : "DESC";

        // ── Build WHERE ──────────────────────
        const { whereSQL, params } = buildWhereClause({ search, startDate, endDate });

        // ── Query: hitung total records ──────
        const countSQL = `SELECT COUNT(*) AS total FROM logger ${whereSQL}`;
        const [countRows] = await churnguard_con.query(countSQL, params);
        const totalRecords = countRows[0]?.total || 0;
        const totalPages   = Math.ceil(totalRecords / limit) || 1;

        // ── Query: ambil data ────────────────
        const dataSQL = `
            SELECT
                log_id,
                user_email,
                event_name,
                action,
                value,
                created
            FROM logger
            ${whereSQL}
            ORDER BY ${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;
        const dataParams = [...params, limit, offset];
        const [rows] = await churnguard_con.query(dataSQL, dataParams);

        // ── Format response
        // Mapping ke shape yang dipakai frontend (name, role, timestamp, activity)
        const data = rows.map((log) => ({
            id:          log.log_id,
            user:        log.user_email  || "-",      // → item.name  di frontend
            role:        log.event_name  || "sistem", // → item.role  di frontend
            timestamp:   log.created,                 // → item.timestamp di frontend
            activity:    log.action      || "",        // → item.activity di frontend
            value:       log.value,
        }));

        return res.status(200).json({
            success: true,
            message: "Data aktivitas berhasil diambil",
            data,
            pagination: {
                currentPage:  page,
                totalPages,
                totalRecords,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });

    } catch (error) {
        console.error("[getLogs] Error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server saat mengambil data log",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};


// ─────────────────────────────────────────────
// POST /api/logger/logging
// Body: { user_email, event_name, action, value? }
// Mencatat aktivitas baru ke tabel logger
// ─────────────────────────────────────────────
const createLog = async (req, res) => {
    try {
        const { user_email, event_name, action, value } = req.body;

        if (!user_email || !event_name || !action) {
            return res.status(400).json({
                success: false,
                message: "Field 'user_email', 'event_name', dan 'action' wajib diisi",
            });
        }

        const insertSQL = `
            INSERT INTO logger (user_email, event_name, action, value)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await churnguard_con.query(insertSQL, [
            user_email,
            event_name,
            action,
            value ?? 0,
        ]);

        return res.status(201).json({
            success: true,
            message: "Aktivitas berhasil dicatat",
            data: {
                id: result.insertId,
                user_email,
                event_name,
                action,
                value: value ?? 0,
            },
        });

    } catch (error) {
        console.error("[createLog] Error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server saat mencatat aktivitas",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};


// ─────────────────────────────────────────────
// DELETE /api/logger/logging/:id
// Hapus satu entri log berdasarkan log_id
// ─────────────────────────────────────────────
const deleteLog = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID tidak valid",
            });
        }

        // Cek dulu apakah log ada
        const [checkRows] = await churnguard_con.query(
            "SELECT log_id FROM logger WHERE log_id = ?",
            [id]
        );

        if (checkRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Log dengan id ${id} tidak ditemukan`,
            });
        }

        await churnguard_con.query("DELETE FROM logger WHERE log_id = ?", [id]);

        return res.status(200).json({
            success: true,
            message: "Log berhasil dihapus",
        });

    } catch (error) {
        console.error("[deleteLog] Error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server saat menghapus log",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};


module.exports = { getLogs, createLog, deleteLog };