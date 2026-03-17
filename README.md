# Car Rental Backend

A lightweight Node.js/Express backend project for managing cars, customers, and rentals.

## Features

- ✅ Persistent storage via SQLite (default), PostgreSQL, or MongoDB
- ✅ Request validation (Zod)
- ✅ JWT authentication (register/login)
- ✅ Pagination + filtering for list endpoints
- ✅ Swagger/OpenAPI docs (`/docs`)

## Getting Started

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. Open the API docs:
   - `http://localhost:3000/docs`

### Changing the database

By default the app uses SQLite. To use PostgreSQL, set:

```bash
DB_TYPE=postgres
DATABASE_URL=postgres://user:pass@host:5432/dbname
```

To use MongoDB, set:

```bash
DB_TYPE=mongo
MONGO_URI=mongodb://localhost:27017/carrental
```

## API Overview

### Authentication

- `POST /auth/register` - register and receive a token
- `POST /auth/login` - login and receive a token

### Protected routes (require Authorization header)

- `GET /cars` - list cars (supports pagination and filters)
- `POST /cars` - create a car
- `GET /customers` - list customers
- `POST /customers` - create a customer (can also be used to register)
- `GET /rentals` - list rentals
- `POST /rentals` - create a rental
- `POST /rentals/:id/return` - return a rental

> Use `Authorization: Bearer <token>` for protected routes.
