const db = require("../config/db");
const bcrypt = require("bcryptjs");

// ========================
// GET ALL USERS
// ========================
const getAllUsers = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = "", sort = "terbaru", is_active } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

        const offset = (page - 1) * limit;
        const conditions = ["role = 'user'"];
        const params = [];

        if (search.trim() !== "") {
            conditions.push("(name LIKE ? OR email LIKE ? OR las_name LIKE ?)");
            const like = `%${search.trim()}%`;
            params.push(like, like, like);
        }

        if (is_active !== undefined && is_active !== "") {
            conditions.push("is_active = ?");
            params.push(parseInt(is_active));
        }

        const whereClause = "WHERE " + conditions.join(" AND ");

        let orderClause = "ORDER BY created_at DESC";
        if (sort === "terlama") orderClause = "ORDER BY created_at ASC";
        if (sort === "status")  orderClause = "ORDER BY is_active DESC, created_at DESC";

        const [countRows] = await db.query(
            `SELECT COUNT(*) AS total FROM users ${whereClause}`,
            params
        );
        const total = countRows[0].total;
        const totalPages = Math.ceil(total / limit);

        const [users] = await db.query(
            `SELECT id, email, name, las_name, nama_perusahaan, nama_app,
                    link_app, avatar_url, role, is_active, created_at
             FROM users ${whereClause} ${orderClause}
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        return res.status(200).json({
            success: true,
            message: "Berhasil mengambil data user",
            data: {
                users,
                pagination: {
                    current_page:  page,
                    rows_per_page: limit,
                    total_rows:    total,
                    total_pages:   totalPages,
                },
            },
        });
    } catch (error) {
        console.error("getAllUsers error:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
    }
};

// ========================
// GET USER BY ID
// ========================
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: "ID tidak valid" });
        }

        const [rows] = await db.query(
            `SELECT id, email, name, las_name, nama_perusahaan, nama_app,
                    link_app, avatar_url, role, is_active, created_at
             FROM users WHERE id = ? LIMIT 1`,
            [parseInt(id)]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        return res.status(200).json({ success: true, message: "Berhasil", data: rows[0] });
    } catch (error) {
        console.error("getUserById error:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
    }
};

// ========================
// BAN / UNBAN USER
// ========================
const toggleBanUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { ban } = req.body;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: "ID tidak valid" });
        }
        if (typeof ban !== "boolean") {
            return res.status(400).json({ success: false, message: "Field 'ban' harus boolean (true / false)" });
        }

        const [rows] = await db.query("SELECT id FROM users WHERE id = ? LIMIT 1", [parseInt(id)]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        const newStatus = ban ? 0 : 1;
        const action    = ban ? "ban" : "unban";

        await db.query(
            "UPDATE users SET is_active = ?, session_version = session_version + 1 WHERE id = ?",
            [newStatus, parseInt(id)]
        );

        return res.status(200).json({
            success: true,
            message: `Berhasil ${action} user`,
            data: { id: parseInt(id), is_active: newStatus, action },
        });
    } catch (error) {
        console.error("toggleBanUser error:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
    }
};

// ========================
// BAN / UNBAN ADMIN
// Proteksi: admin pertama (id terkecil dengan role='admin') tidak bisa di-ban
// ========================
const toggleBanAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { ban } = req.body;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: "ID tidak valid" });
        }
        if (typeof ban !== "boolean") {
            return res.status(400).json({ success: false, message: "Field 'ban' harus boolean (true / false)" });
        }

        // Cari admin pertama yang dibuat (id terkecil dengan role='admin')
        const [firstAdminRows] = await db.query(
            "SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1"
        );
        const firstAdminId = firstAdminRows[0]?.id;

        if (parseInt(id) === firstAdminId) {
            return res.status(403).json({
                success: false,
                message: "Akun admin pertama tidak dapat di-ban",
            });
        }

        // Pastikan target adalah admin dan ada
        const [rows] = await db.query(
            "SELECT id, role FROM users WHERE id = ? AND role = 'admin' LIMIT 1",
            [parseInt(id)]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Admin tidak ditemukan" });
        }

        const newStatus = ban ? 0 : 1;
        const action    = ban ? "ban" : "unban";

        await db.query(
            "UPDATE users SET is_active = ?, session_version = session_version + 1 WHERE id = ?",
            [newStatus, parseInt(id)]
        );

        return res.status(200).json({
            success: true,
            message: `Berhasil ${action} admin`,
            data: { id: parseInt(id), is_active: newStatus, action },
        });
    } catch (error) {
        console.error("toggleBanAdmin error:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
    }
};

// ========================
// DELETE USER
// ========================
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: "ID tidak valid" });
        }

        const [rows] = await db.query("SELECT id FROM users WHERE id = ? LIMIT 1", [parseInt(id)]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        await db.query("DELETE FROM users WHERE id = ?", [parseInt(id)]);

        return res.status(200).json({ success: true, message: "User berhasil dihapus" });
    } catch (error) {
        console.error("deleteUser error:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
    }
};

// ========================
// CREATE ADMIN
// ========================
const createAdmin = async (req, res) => {
    try {
        const { email, name, las_name, password } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: "Email, nama, dan password wajib diisi",
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Email sudah digunakan" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users (email, name, las_name, nama_perusahaan, password, role, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [email, name, las_name || "", "ChurnGuard BOZZZ", hashedPassword, "admin", 1]
        );

        return res.status(201).json({
            success: true,
            message: "Admin berhasil dibuat",
            data: { id: result.insertId, email, name, role: "admin" },
        });
    } catch (error) {
        console.error("createAdmin error:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
    }
};

// ========================
// GET ALL ADMINS
// ========================
const getAllAdmins = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = "" } = req.query;

        page  = parseInt(page);
        limit = parseInt(limit);
        if (isNaN(page)  || page  < 1) page  = 1;
        if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

        const offset     = (page - 1) * limit;
        const conditions = ["role = 'admin'"];
        const params     = [];

        if (search.trim() !== "") {
            conditions.push("(name LIKE ? OR email LIKE ? OR las_name LIKE ?)");
            const like = `%${search.trim()}%`;
            params.push(like, like, like);
        }

        const whereClause = "WHERE " + conditions.join(" AND ");

        const [countRows] = await db.query(
            `SELECT COUNT(*) AS total FROM users ${whereClause}`, params
        );
        const total      = countRows[0].total;
        const totalPages = Math.ceil(total / limit);

        // Ambil id admin pertama untuk dikirim ke frontend
        const [firstAdminRows] = await db.query(
            "SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1"
        );
        const firstAdminId = firstAdminRows[0]?.id || null;

        const [admins] = await db.query(
            `SELECT id, email, name, las_name, nama_perusahaan, nama_app,
                    avatar_url, role, is_active, created_at
             FROM users ${whereClause} ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        return res.status(200).json({
            success: true,
            message: "Berhasil mengambil data admin",
            data: {
                users: admins,
                firstAdminId,           // ← dikirim ke frontend untuk disable tombol ban
                pagination: {
                    current_page:  page,
                    rows_per_page: limit,
                    total_rows:    total,
                    total_pages:   totalPages,
                },
            },
        });
    } catch (error) {
        console.error("getAllAdmins error:", error);
        return res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getAllAdmins,
    getUserById,
    toggleBanUser,
    toggleBanAdmin,
    deleteUser,
    createAdmin,
};