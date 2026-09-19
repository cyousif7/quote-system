const { Router } = require("express");
const lookupVehicle = require("../services/vehicleLookup.js");
const pool = require("../config/db");
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const { sendQuoteEmail, notifyShopOfResponse, sendInfoRequestEmail } = require('../services/emailService');
const logger = require('../config/logger');

// Instantiate router construct
const router = Router();

router.post("/", [
    body('customer_name').notEmpty(),
    body('customer_email').isEmail(),
    body('customer_phone').optional(),
    body('vehicle_year').notEmpty().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body('vehicle_make').notEmpty(),
    body('vehicle_model').notEmpty(),
    body('vin').optional().isLength({ min: 17, max: 17 }),
    body('problem_description').notEmpty()
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        // Declare variables that must match the name the frontend sent in req.body
        // These variable names are used as listed based on request's req.body attributes
        const { customer_name, customer_email, customer_phone, vin, problem_description } = req.body;
        let { vehicle_year, vehicle_make, vehicle_model } = req.body;
        let vehicle_trim = null;

        // If VIN provided, try to decode it and prefer that data
        if (vin) {
            const vehicleData = await lookupVehicle(vin);
            if (vehicleData) {
                vehicle_year = vehicleData.vehicle_year || vehicle_year;
                vehicle_make = vehicleData.vehicle_make || vehicle_make;
                vehicle_model = vehicleData.vehicle_model || vehicle_model;
                vehicle_trim = vehicleData.vehicle_trim;
            }
        }

        // Insert values from the request into the tickets table and store the resulting tuples
        const result = await pool.query(`INSERT INTO tickets (customer_name, customer_email, customer_phone, vin, problem_description, vehicle_year, vehicle_make, vehicle_model, vehicle_trim) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [customer_name, customer_email, customer_phone, vin, problem_description, vehicle_year, vehicle_make, vehicle_model, vehicle_trim]);

        // Response to frontend request
        res.status(201).json({ 
            success: true, 
            tickets: result.rows[0], 
            message: "Database ticket insertion successful." });
    }

    catch(error) {
        logger.error(error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server error."});
    }
});

router.post('/:id/request-info', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { worker_message } = req.body;

        const update = await pool.query(
            `UPDATE tickets SET status = 'needs_info', worker_message = $1, info_request_sent_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *`,
            [worker_message, id]
        );

        if (update.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Ticket not found." });
        }

        const { customer_name, customer_email, token } = update.rows[0];
        await sendInfoRequestEmail(customer_name, customer_email, worker_message, token);

        res.status(200).json({
            success: true,
            tickets: update.rows[0],
            message: "Info request sent to customer."
        });
    }
    catch(error) {
        logger.error(error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        // Query database (Read) for all current tickets
        // This will show up on the shop's browser as the current tickets to work on
        const result = await pool.query(`SELECT * FROM tickets ORDER BY created_at DESC`);

        // Respond to frontend. Send the successful result to the frontend
        res.status(200).json({ 
            success: true, 
            tickets: result.rows, 
            message: "Database retrieval successful." })
    }

    catch(error) {
        logger.error(error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server error."});
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM tickets WHERE status != 'archived' ORDER BY created_at DESC`);

        res.status(200).json({ 
            success: true, 
            tickets: result.rows, 
            message: "Database retrieval successful." })
    }

    catch(error) {
        logger.error(error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server error."});
    }
});

router.get("/archived", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM tickets WHERE status = 'archived' ORDER BY updated_at DESC`);

        res.status(200).json({ 
            success: true, 
            tickets: result.rows, 
            message: "Archived tickets retrieved successfully." })
    }

    catch(error) {
        logger.error(error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server error."});
    }
});

router.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const update = await pool.query(`UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [status, id])

        res.status(200).json({ 
            success: true, 
            tickets: update.rows[0], 
            message: "Database update successful."})
    }

    catch(error) {
        logger.error(error.message);
        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

router.patch('/:id/quote', authMiddleware, async (req, res) =>{
    try {
        const { quote_amount } = req.body;
        const { id } = req.params;

        const update = await pool.query(`UPDATE tickets SET quote_amount = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [quote_amount, id]);

        res.status(200).json({
            success: true,
            tickets: update.rows[0],
            message: "Quote amount set."
        });
    }

    catch(error) {
        logger.error(error.message);
        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

router.patch('/:id/message', authMiddleware, async (req, res) => {
    try {
        const { worker_message } = req.body;
        const { id } = req.params;

        const update = await pool.query(
            `UPDATE tickets SET worker_message = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [worker_message, id]
        );

        res.status(200).json({
            success: true,
            tickets: update.rows[0],
            message: "Message saved."
        });
    }
    catch(error) {
        logger.error(error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

const storageConfig = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storageConfig,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

router.post('/:id/upload', authMiddleware, upload.single('pdf'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const { id } = req.params;
        const update = await pool.query(`UPDATE tickets SET pdf_path = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [filePath, id]);

        res.status(200).json({
            success: true,
            tickets: update.rows[0],
            message: "PDF uploaded successfully."
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

router.post('/:id/send', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const custInfo = await pool.query(`SELECT * FROM tickets WHERE id = $1`, [id]);

        if (custInfo.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Error, ticket not found."
            });
        };

        const { customer_name, customer_email, quote_amount, pdf_path, token, worker_message } = custInfo.rows[0];

        await sendQuoteEmail(customer_name, customer_email, quote_amount, pdf_path, token, worker_message);

        const update = await pool.query(`UPDATE tickets SET status = 'sent', quote_sent_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`, [id]);

        res.status(200).json({
            success: true,
            tickets: update.rows[0],
            message: "Ticket sent."
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

router.get('/:token/status', async (req, res) => {
    try {
        const { token } = req.params;

        const result = await pool.query(`SELECT * FROM public_ticket_status WHERE token = $1`, [token]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Error, token not found."
            });
        };

        res.status(200).json({
            success: true,
            tickets: result.rows[0],
            message: "Ticket retrieved successfully."
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

router.patch('/:token/respond', [
    body('customer_response').notEmpty().isLength({ max: 2000 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { customer_response } = req.body;
        const { token } = req.params;

        const update = await pool.query(
            `UPDATE tickets SET customer_response = $1, status = 'in_progress', updated_at = NOW() WHERE token = $2 RETURNING *`,
            [customer_response, token]
        );

        if (update.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found."
            });
        }

        const { customer_name, id } = update.rows[0];
        await notifyShopOfResponse(customer_name, customer_response, id);

        res.status(200).json({
            success: true,
            message: "Response submitted."
        });
    }
    catch(error) {
        logger.error(error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// Export router to any other files that may need it
module.exports = router;