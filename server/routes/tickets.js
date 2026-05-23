const { Router } = require("express");
const pool = require("../config/db");

// Instantiate router construct
const router = Router();

router.post("/", async (req, res) => {
    try {
        // Declare variables that must match the name the frontend sent in req.body
        // These variable names are used as listed based on request's req.body attributes
        const { customer_name, customer_email, customer_phone, vin, problem_description } = req.body;

        // Insert values from the request into the tickets table and store the resulting tuples
        const result = await pool.query(`INSERT INTO tickets (customer_name, customer_email, customer_phone, vin, problem_description) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [customer_name, customer_email, customer_phone, vin, problem_description]);

        // Response to frontend request
        res.status(201).json({ 
            success: true, 
            tickets: result.rows[0], 
            message: "Database ticket insertion successful." });
    }

    catch(error) {
        res.status(500).json({ 
            success: false, 
            message: "Server error."});
    }
});

// Export router to any other files that may need it
module.exports = router;