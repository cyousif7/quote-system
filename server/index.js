const dotenv = require('dotenv');

// Load .env file variables into process.env
// Must be called before anything that needs environment variables
dotenv.config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const tickets = require('./routes/tickets');
const authRouter = require('./routes/auth.js');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const logger = require('./config/logger');

// Call the express method on app to give access to various methods within
const app = express();

// Middleware

// Use helmet to prevent security vulnerabilities
app.use(helmet())

// Parse incoming JSON bodies so req.body can work in routes
// Only allow a size limit of 10kb to be imported in json body
app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

// Controls which domains can call the API
// In production, this will be locked to the frontend's domain only
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

// Rate limiter on all routes starting with /api/tickets
// Limits each IP to 20 requests per 15 minutes
const ticketLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 20,
    message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 10,
    message: { error: 'Too many requests, please try again later.' }
})

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});

app.use(globalLimiter);

app.use('/api/tickets', ticketLimiter);

app.use('/api/auth', authLimiter);

app.use('/api/tickets', tickets);

app.use('/api/auth', authRouter);

// Server

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}.`);
});