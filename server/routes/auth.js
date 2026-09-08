const { Router } = require("express");
const bcrypt = require('bcrypt');
const pool = require("../config/db");


// Instantiate router construct
const router = Router();

router.post("/setup", async (req, res) => {
    try {
        const { email, password } = req.body;
        const countResult = await pool.query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(countResult.rows[0].count);

        if (userCount > 0) {
        return res.status(403).json({ success: false, message: 'Setup already complete.' });
        }

        const hash = await bcrypt.hash(password, 10);
        const passwordInsertion = await pool.query(`INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *`, [email, hash]);

        res.status(201).json({
            success: true,
            message: "Password hashing successful"
        });
    }

    catch(error) {
        console.log("ERROR: ", error.message);
        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
})

module.exports = router;