const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    max: 10,     // max 10 connections in the db pool
    idleTimeoutMillis: 30000,        // close idle connections after 30 seconds
    connectionTimeoutMillis: 2000       // fail fast if connection takes over 2 seconds
});

module.exports = pool;