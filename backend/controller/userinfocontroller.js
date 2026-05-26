const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const churnguard_con = require('../config/db');

exports.updateUserInfo = async (req, res) => {
    const { id, name, username, newPassword } = req.body;

    try {
        let sql = `UPDATE users SET `;
        const params = [];
        const updates = [];

        if (username && username !== "") {
            const checkSql = "SELECT id FROM users WHERE username = ? AND id != ?";
            const [exist] = await churnguard_con.query(checkSql, [username, id]);

            if (exist.length > 0) {
                return res.status(400).json({ message: "Username already taken" });
            }

            updates.push("username = ?");
            params.push(username);
        }

        if (name && name !== "") {
            updates.push("name = ?");
            params.push(name);
        }

        if (newPassword && newPassword !== "") {
            const hashed = await bcrypt.hash(newPassword, 10);
            updates.push("password = ?");
            params.push(hashed);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        sql += updates.join(", ") + " WHERE id = ?";
        params.push(id);

        await churnguard_con.query(sql, params);

        res.json({ message: "User updated successfully" });

    } catch (err) {
        console.log("UPDATE ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getUserInfo = async (req, res) => {
    try {
        // ✅ Support ?id=30 (dari DashboardSA) dan ?id=30 (legacy)
        const id = req.query.id || req.query.id;
        console.log("calling sql, id:", id);

        if (!id) {
            return res.status(400).json({ message: "id is required" });
        }

        const sql = "SELECT id, email, name, las_name, role FROM users WHERE id = ?";
        const [rows] = await churnguard_con.query(sql, [id]);

        console.log("HASIL:", rows);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.log("SQL ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const sql = "SELECT id, username, name, role FROM users ORDER BY name ASC";
        const [rows] = await churnguard_con.query(sql);
        
        console.log("Total users found:", rows.length);
        
        res.json(rows);
    } catch (err) {
        console.log("SQL ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteUser = async (req, res) => {
    const id = req.query.id;
    
    if (!id) {
        return res.status(400).json({ message: 'id required' });
    }
    
    try {
        const deleteSql = 'DELETE FROM users WHERE id = ?';
        await churnguard_con.query(deleteSql, [id]);
        
        res.status(201).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.register = async (req, res) => {
    const { name, username, password, role } = req.body;
    
    if (!name || !username || !password || !role) {
        return res.status(400).json({ message: 'All fields required' });
    }
    
    try {
        const checkSql = 'SELECT username FROM users WHERE username = ?';
        const [existing] = await churnguard_con.query(checkSql, [username]);
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        const hashed = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO users (name, username, PASSWORD, role) VALUES (?, ?, ?, ?)';
        const [result] = await churnguard_con.query(sql, [name, username, hashed, role]);
        
        const insertedId = result.insertId;
        
        res.status(201).json({ 
            message: 'User registered successfully',
            user: { 
                id: insertedId, 
                name, 
                username, 
                role 
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Database error' });
    }
};