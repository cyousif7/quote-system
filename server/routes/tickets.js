const { Router } = require("express");
const lookupVehicle = require("../services/vehicleLookup.js");
const pool = require("../config/db");

// Instantiate router construct
const router = Router();

router.post("/", async (req, res) => {
    try {
        // Declare variables that must match the name the frontend sent in req.body
        // These variable names are used as listed based on request's req.body attributes
        const { customer_name, customer_email, customer_phone, vin, problem_description } = req.body;

        // Get vehicle data from the vehicle lookup class
        const vehicleData = await lookupVehicle(vin);
        const { vehicle_year, vehicle_make, vehicle_model, vehicle_trim } = vehicleData || {};  // If returned vehicle data is null, destructure from an empty object instead

        // Insert values from the request into the tickets table and store the resulting tuples
        const result = await pool.query(`INSERT INTO tickets (customer_name, customer_email, customer_phone, vin, problem_description, vehicle_year, vehicle_make, vehicle_model, vehicle_trim) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [customer_name, customer_email, customer_phone, vin, problem_description, vehicle_year, vehicle_make, vehicle_model, vehicle_trim]);

        // Response to frontend request
        res.status(201).json({ 
            success: true, 
            tickets: result.rows[0], 
            message: "Database ticket insertion successful." });
    }

    catch(error) {
        console.log("ERROR: ", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server error."});
    }
});

router.get("/", async (req, res) => {
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
        console.log("ERROR: ", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server error."});
    }
});

router.patch("/:id", async (req, res) => {
    try {
        // destructure (pull "status" and "id" out so that we can just write "status" or "id" instead of req.body.status or req.params.id)
        const { status } = req.body;
        const { id } = req.params;

        // Query DB to update tickets by setting tickets to request status for the requested id.
        const update = await pool.query(`UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *`, [status, id])
        res.status(200).json({ 
            success: true, 
            tickets: update.rows[0], 
            message: "Database update successful."})
    }

    catch(error) {
        console.log("ERROR: ", error.message);
        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// Export router to any other files that may need it
module.exports = router;