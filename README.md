# Quote System

## Overview

A full-stack web application that allows mechanic shops to receive and manage customer quote requests online. Customers submit their vehicle information and describe their issue — the shop processes the request and sends a quote via email with an optional PDF attachment. Includes two-way communication for follow-up questions, a full audit trail, and ticket archiving. Reduces phone traffic and creates a recorded paper trail for both the shop and the customer.

## Tech Stack

- **Frontend:** React, Vite, Axios, dnd-kit, Cloudflare Turnstile
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Email:** Resend (with domain verification for production deliverability)
- **Auth:** JWT, bcrypt, account lockout after repeated failed logins
- **Security:** Helmet, express-rate-limit, express-validator, Content Security Policy, Cloudflare Turnstile bot protection
- **Deployment:** AWS EC2 + RDS (backend), Netlify (frontend), Nginx reverse proxy, Let's Encrypt SSL

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- A Resend account and API key (resend.com)
- A Cloudflare account with a Turnstile widget (dash.cloudflare.com)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/cyousif7/quote-system.git
cd quote-system
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder with the following variables (see Environment Variables section below).

### 3. Database Setup

Create a PostgreSQL database called `quote_system`.

Open pgAdmin or your preferred PostgreSQL client and run the following SQL:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    vin TEXT,
    vehicle_year INTEGER,
    vehicle_make TEXT,
    vehicle_model TEXT,
    vehicle_trim TEXT,
    problem_description TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'needs_info', 'sent', 'archived')),
    quote_amount DECIMAL,
    pdf_path TEXT,
    token UUID DEFAULT uuid_generate_v4(),
    worker_message TEXT,
    customer_response TEXT,
    quote_sent_at TIMESTAMP,
    info_request_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tickets_status ON tickets(status);

CREATE VIEW public_ticket_status AS
SELECT token, customer_name, vehicle_year, vehicle_make,
       vehicle_model, vehicle_trim, problem_description,
       status, quote_amount, worker_message, customer_response,
       quote_sent_at, info_request_sent_at,
       created_at, updated_at
FROM tickets;
```

Note: VIN is optional. Customers provide Year, Make, and Model directly; if a VIN is also given, it's decoded via the free NHTSA API and used to fill in or refine those fields.

### 4. Frontend Setup

```bash
cd client
npm install
```

### 5. Running the App

In one terminal start the backend:

```bash
cd server
npm run dev
```

In a second terminal start the frontend:

```bash
cd client
npm run dev
```

Visit `http://localhost:5173` to see the customer quote form.
Visit `http://localhost:5173/setup` to create your admin account on first run.
Visit `http://localhost:5173/dashboard` to access the shop dashboard.

## Environment Variables

### Backend (`server/.env`)

PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=quote_system
DB_PORT=5432
DB_SSL=false

JWT_SECRET=yourlongrandomsecretkey

RESEND_API_KEY=your_resend_api_key
SHOP_EMAIL=quotes@yourshopdomain.com
SHOP_NAME=Your Shop Name
SHOP_NOTIFICATION_EMAIL=owner@yourshopdomain.com

CLIENT_URL=http://localhost:5173

TURNSTILE_SECRET_KEY=your_turnstile_secret_key

`DB_SSL` should be `true` when connecting to a managed database like AWS RDS, and `false` for a local PostgreSQL install.

### Frontend (`client/.env`)

VITE_API_URL=http://localhost:3000
VITE_SHOP_NAME=Your Shop Name
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key

## First Run

1. Start both servers
2. Visit `http://localhost:5173/setup`
3. Create your admin account — password must be at least 8 characters, contain one uppercase letter and one number
4. Log in at `http://localhost:5173/login`
5. The dashboard is ready to receive quotes

## Feature Overview

- **Public quote form** with Cloudflare Turnstile bot protection, optional VIN decoding via NHTSA
- **Customer status page** — a unique link lets customers check their quote status anytime without an account
- **Two-way communication** — the shop can request more information from a customer; the customer responds on their status page, and the shop is notified by email
- **Kanban dashboard** with drag-and-drop status management, protected by JWT auth with account lockout after repeated failed logins
- **Audit trail** — every ticket shows when it was received, when a quote was sent, and when an info request was sent, independent of its current column
- **Archiving** — completed or abandoned tickets can be archived and later restored, keeping the active dashboard clean without losing history
- **Branded email** — quotes and notifications send from the shop's own verified domain with the shop's name and an optional PDF attachment

## Future Features

- Multiple worker accounts per shop with invite system
- PDF parser to automatically extract quote totals from Mitchell 1 exports
- SMS notifications via Twilio
- Customer quote approval flow
