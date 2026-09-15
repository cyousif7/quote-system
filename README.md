# Quote System

## Overview

A full-stack web application that allows mechanic shops to receive and manage customer quote requests online. Customers submit their vehicle information and describe their issue — the shop processes the request and sends a quote via email with an optional PDF attachment. Reduces phone traffic and creates a recorded paper trail for both the shop and the customer.

## Tech Stack

- **Frontend:** React, Vite, Axios, dnd-kit
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Email:** Resend
- **Auth:** JWT, bcrypt
- **Security:** Helmet, express-rate-limit, express-validator

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- A Resend account and API key (resend.com)

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

Create a PostgreSQL database called `quote-system`.

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
    vin TEXT NOT NULL,
    vehicle_year INTEGER,
    vehicle_make TEXT,
    vehicle_model TEXT,
    vehicle_trim TEXT,
    problem_description TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'sent')),
    quote_amount DECIMAL,
    pdf_path TEXT,
    token UUID DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE VIEW public_ticket_status AS
SELECT token, customer_name, vehicle_year, vehicle_make,
       vehicle_model, vehicle_trim, problem_description,
       status, quote_amount, created_at, updated_at
FROM tickets;
```

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

Create a `.env` file in the `server` folder with these values:

```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=quote-system
DB_PORT=5432

JWT_SECRET=yourlongrandomsecretkey

RESEND_API_KEY=your_resend_api_key
CLIENT_URL=http://localhost:5173
```

## First Run

1. Start both servers
2. Visit `http://localhost:5173/setup`
3. Create your admin account — password must be at least 8 characters, contain one uppercase letter and one number
4. Log in at `http://localhost:5173/login`
5. The dashboard is ready to receive quotes

## Future Features

- Multiple worker accounts per shop with invite system
- License plate lookup (in addition to VIN)
- PDF parser to automatically extract quote totals from Mitchell 1 exports
- SMS notifications via Twilio
- Customer approval flow
