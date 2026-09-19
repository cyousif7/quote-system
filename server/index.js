const dotenv = require('dotenv');

// Load .env file variables into process.env
// Must be called before anything that needs environment variables
dotenv.config();

// Must come before using logger.error() in required
const logger = require('./config/logger');

const required = ['JWT_SECRET', 'DB_PASSWORD', 'DB_NAME', 'RESEND_API_KEY'];
required.forEach(key => {
    if (!process.env[key]) {
        logger.error(`Missing required environment variable: ${key}`);
        process.exit(1);
    }
});

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const tickets = require('./routes/tickets');
const authRouter = require('./routes/auth.js');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const pool = require('./config/db');

// Call the express method on app to give access to various methods within
const app = express();

// Middleware

// One reverse proxy
app.set('trust proxy', 1);

// Use helmet to prevent security vulnerabilities
// helmet CSP must whitelist frontend domain, fonts, and any CDN resources
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"]
        }
    }
}))

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return res.redirect(`https://${req.header('host')}${req.url}`);
        }
        next();
    });
}

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

// Global rate limiter - broad 500 count limit
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 500 : 1000,
    message: { error: 'Too many requests, please try again later.' }
});

app.use(globalLimiter);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/tickets', tickets);

app.use('/api/auth', authRouter);

// Server

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}.`);
});

process.on('SIGTERM', async () => {
    logger.info('Server shutting down gracefully');
    await pool.end();
    process.exit(0);
});