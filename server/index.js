const dotenv = require('dotenv');

// Load .env file variables into process.env
// Must be called before anything that needs environment variables
dotenv.config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const tickets = require('./routes/tickets');

// Call the express method on app to give access to various methods within
const app = express();

// Middleware

// Parse incoming JSON bodies so req.body can work in routes
app.use(express.json());

// Controls which domains can call the API
// In production, this will be locked to the frontend's domain only
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

// Rate limiter on all routes starting with /api/tickets
// Limits each IP to 20 requests per 15 minutes
const ticketLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 20,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/tickets', ticketLimiter);

app.use('/api/tickets', tickets);

// Server

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
});