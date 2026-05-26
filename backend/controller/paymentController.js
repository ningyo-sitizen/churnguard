const churnguard_con = require("../config/db");
const midtransClient = require("midtrans-client");


exports.getAllPayment = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = "", sort = "latest" } = req.query;

        page  = parseInt(page);
        limit = parseInt(limit);
        if (isNaN(page)  || page  < 1) page  = 1;
        if (isNaN(limit) || limit < 1) limit = 10;

        const offset     = (page - 1) * limit;
        const conditions = [];
        const params     = [];

        if (search.trim()) {
            conditions.push("(name LIKE ? OR plan LIKE ? OR payment_method LIKE ?)");
            const like = `%${search.trim()}%`;
            params.push(like, like, like);
        }

        const whereClause = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

        let orderClause = "ORDER BY created_at DESC";
        if (sort === "oldest") orderClause = "ORDER BY created_at ASC";
        if (sort === "status") orderClause = "ORDER BY status ASC, created_at DESC";

        const [countRows] = await churnguard_con.query(
            `SELECT COUNT(*) AS total FROM payment ${whereClause}`, params
        );
        const total      = countRows[0].total;
        const totalPages = Math.ceil(total / limit);

        const [result] = await churnguard_con.query(
            `SELECT id, order_id, name, price, payment_method, plan, status, created_at
             FROM payment ${whereClause} ${orderClause}
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.status(200).json({
            success:    true,
            total,
            totalPages,
            data:       result,
        });

    } catch (error) {
        console.error("DATABASE ERROR:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil data payment", error: error.message });
    }
};

// CREATE TRANSACTION (Midtrans)
exports.createTransaction = async (req, res) => {
    try {
        const { name, email, amount, plan, payment } = req.body;

        if (!name || !email || !amount || !plan) {
            return res.status(400).json({ success: false, message: "name, email, amount, dan plan wajib diisi" });
        }

        const snap = new midtransClient.Snap({
            isProduction: false, // ganti true jika production
            serverKey: process.env.MIDTRANS_SERVER_KEY,
        });

        const order_id = `CG-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const parameter = {
            transaction_details: {
                order_id,
                gross_amount: Number(amount),
            },
            customer_details: {
                first_name: name,
                email,
            },
        };

        const transaction = await snap.createTransaction(parameter);

        // Simpan ke DB dengan status pending
        await churnguard_con.query(
            `INSERT INTO payment (order_id, name, email, price, payment_method, plan, status)
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [order_id, name, email, Number(amount), payment ?? "midtrans", plan]
        );

        return res.status(200).json({
            success: true,
            token: transaction.token,
            redirect_url: transaction.redirect_url,
            order_id,
        });

    } catch (error) {
        console.error("CREATE TRANSACTION ERROR:", error);
        return res.status(500).json({ success: false, message: "Gagal membuat transaksi", error: error.message });
    }
};

// CANCEL PAYMENT
exports.cancelPayment = async (req, res) => {
    try {
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({ success: false, message: "order_id wajib diisi" });
        }

        await churnguard_con.query(
            `UPDATE payment SET status = 'cancelled' WHERE order_id = ?`,
            [order_id]
        );

        return res.status(200).json({ success: true, message: "Pembayaran dibatalkan" });

    } catch (error) {
        console.error("CANCEL PAYMENT ERROR:", error);
        return res.status(500).json({ success: false, message: "Gagal membatalkan pembayaran", error: error.message });
    }
};