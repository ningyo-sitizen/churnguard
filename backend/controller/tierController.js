const churnguard_con = require('../config/db');

// GET semua tier
const getAllTiers = async (req, res) => {
    try {
        const [results] = await churnguard_con.query("SELECT * FROM tier ORDER BY id ASC");

        const parsed = results.map(item => ({
            ...item,
            descriptions: (() => {
                try {
                    return typeof item.descriptions === "string"
                        ? JSON.parse(item.descriptions)
                        : item.descriptions ?? [];
                } catch {
                    return [];
                }
            })()
        }));

        return res.status(200).json(parsed);

    } catch (err) {
        console.error("Error getAllTiers:", err);
        return res.status(500).json({ message: "Gagal mengambil data tier", error: err.message });
    }
};

// GET tier by ID
const getTierById = async (req, res) => {
    try {
        const { id } = req.params;
        const [results] = await churnguard_con.query("SELECT * FROM tier WHERE id = ?", [id]);

        if (results.length === 0) {
            return res.status(404).json({ message: "Tier tidak ditemukan" });
        }

        const item = results[0];
        item.descriptions = (() => {
            try {
                return typeof item.descriptions === "string"
                    ? JSON.parse(item.descriptions)
                    : item.descriptions ?? [];
            } catch {
                return [];
            }
        })();

        return res.status(200).json(item);

    } catch (err) {
        console.error("Error getTierById:", err);
        return res.status(500).json({ message: "Gagal mengambil data tier", error: err.message });
    }
};

// POST tambah tier baru
const createTier = async (req, res) => {
    try {
        const { title, price, descriptions } = req.body;

        if (!title || price === undefined || isNaN(price)) {
            return res.status(400).json({ message: "title dan price wajib diisi" });
        }

        const descriptionsJSON = JSON.stringify(
            Array.isArray(descriptions) ? descriptions : []
        );

        const [result] = await churnguard_con.query(
            "INSERT INTO tier (title, price, descriptions) VALUES (?, ?, ?)",
            [title, price, descriptionsJSON]
        );

        return res.status(201).json({
            message: "Tier berhasil ditambahkan",
            data: {
                id: result.insertId,
                title,
                price,
                descriptions: Array.isArray(descriptions) ? descriptions : []
            }
        });

    } catch (err) {
        console.error("Error createTier:", err);
        return res.status(500).json({ message: "Gagal menambahkan tier", error: err.message });
    }
};

// PUT update tier by ID
const updateTier = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, price, descriptions } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({ message: "title dan price wajib diisi" });
        }

        const descriptionsJSON = JSON.stringify(
            Array.isArray(descriptions) ? descriptions : []
        );

        const [result] = await churnguard_con.query(
            "UPDATE tier SET title = ?, price = ?, descriptions = ? WHERE id = ?",
            [title, price, descriptionsJSON, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Tier tidak ditemukan" });
        }

        return res.status(200).json({
            message: "Tier berhasil diupdate",
            data: {
                id: parseInt(id),
                title,
                price,
                descriptions: Array.isArray(descriptions) ? descriptions : []
            }
        });

    } catch (err) {
        console.error("Error updateTier:", err);
        return res.status(500).json({ message: "Gagal mengupdate tier", error: err.message });
    }
};

// DELETE tier by ID
const deleteTier = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await churnguard_con.query(
            "DELETE FROM tier WHERE id = ?", [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Tier tidak ditemukan" });
        }

        return res.status(200).json({ message: "Tier berhasil dihapus", id: parseInt(id) });

    } catch (err) {
        console.error("Error deleteTier:", err);
        return res.status(500).json({ message: "Gagal menghapus tier", error: err.message });
    }
};

// DELETE banyak tier sekaligus (bulk delete)
const deleteManyTiers = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "ids harus berupa array dan tidak boleh kosong" });
        }

        const placeholders = ids.map(() => "?").join(", ");
        const [result] = await churnguard_con.query(
            `DELETE FROM tier WHERE id IN (${placeholders})`, ids
        );

        return res.status(200).json({
            message: `${result.affectedRows} tier berhasil dihapus`,
            deletedIds: ids
        });

    } catch (err) {
        console.error("Error deleteManyTiers:", err);
        return res.status(500).json({ message: "Gagal menghapus tier", error: err.message });
    }
};

module.exports = {
    getAllTiers,
    getTierById,
    createTier,
    updateTier,
    deleteTier,
    deleteManyTiers
};