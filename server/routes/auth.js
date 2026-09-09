const { Router } = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
    };
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "User email not found"
            });
        };

        const hash = result.rows[0].password_hash;
        const match = await bcrypt.compare(password, hash);

        if (match === false) {
            return res.status(401).json({
                success: false,
                message: "Password incorrect."
            });
        };

        // generate JWT
        const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.cookie('token', token, {
            httpOnly: true,    // JavaScript cannot access this cookie
            secure: process.env.NODE_ENV === 'production',     // set to true in production (requires HTTPS)
            maxAge: 8 * 60 * 60 * 1000  // 8 hours in milliseconds
        });

        return res.status(200).json({
            success: true,
            message: "Login successful."
        });

    }

    catch(error) {
        console.log("ERROR: ", error.message);
        res.status(500).json({
            success: false,
            message: "Server error."
        });
    };
});

router.post("/logout", (req, res) => {
    res.clearCookie('token');

    res.status(200).json({
        success: true,
        message: "Cookie cleared."
    })
})

module.exports = router;