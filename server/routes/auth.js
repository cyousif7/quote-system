const { Router } = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require("../config/db");
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Define auth limiter (for going between pages on employee side)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many requests, please try again later.' }
});

// Instantiate router construct
const router = Router();

router.post("/setup", authLimiter, [
    body('email').isEmail(),
    body('password')
        .isLength({ min: 8 })
        .matches(/[A-Z]/)
        .matches(/[0-9]/)
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
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
        logger.error(error.message);
        res.status(500).json({
            success: false,
            message: "Server error."
        });
    };
});

router.post("/login", authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        };

        // Limit login attempts after too many failed attempts
        const user = result.rows[0];

        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            return res.status(429).json({
                success: false,
                message: "Account temporarily locked. Try again in 15 minutes."
            });
        };        

        const hash = result.rows[0].password_hash;
        const match = await bcrypt.compare(password, hash);

        if (!match) {
            await pool.query(`
                UPDATE users SET 
                failed_attempts = failed_attempts + 1,
                locked_until = CASE WHEN failed_attempts + 1 >= 7 
                THEN NOW() + INTERVAL '15 minutes' 
                ELSE NULL END
                WHERE email = $1`, [email]);

            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password." 
            });
        };

        await pool.query(`UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE email = $1`, [email]);

        // generate JWT
        const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.cookie('token', token, {
            httpOnly: true,    // JavaScript cannot access this cookie
            secure: process.env.NODE_ENV === 'production',     // set to true in production (requires HTTPS)
            maxAge: 8 * 60 * 60 * 1000,  // 8 hours in milliseconds
            sameSite: 'strict'
        });

        return res.status(200).json({
            success: true,
            message: "Login successful."
        });

    }

    catch(error) {
        logger.error(error.message);
        res.status(500).json({
            success: false,
            message: "Server error."
        });
    };
});

router.get('/me', authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

router.post("/logout", (req, res) => {
    res.clearCookie('token');

    res.status(200).json({
        success: true,
        message: "Cookie cleared."
    })
})

module.exports = router;