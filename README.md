# JWT Authentication API

A simple and secure authentication API built with Node.js, Express, and PostgreSQL. It implements JWT-based authentication with access and refresh tokens, role-based authorization, input validation, DTOs, and a clean modular architecture. The project includes comprehensive unit and integration tests using ephemeral PostgreSQL containers.

## Features

- User registration with password hashing (bcrypt)
- User login returning access and refresh tokens (JWT)
- Role-based access control (admin / user)
- Admin-only routes (delete any user) and ownership protection
- Refresh token rotation with sliding expiration and atomic database transactions
- JWT ID (JTI) for per-token identification and reuse detection
- Automatic revocation of all user tokens on suspicious reuse
- Logout and global logout (all devices)
- Centralized error handling with custom `AppError` and `asyncHandler` wrapper
- Input validation with express-validator
- DTO layer for consistent input/output formatting and JSDoc type annotations
- Repository pattern for data access
- SQL migrations with Knex.js
- Scheduled job for cleaning expired and revoked tokens (background worker)
- Structured logging with Pino and request context propagation (AsyncLocalStorage)
- Automatic redaction of sensitive data in logs
- Unit and integration tests with Jest, Supertest, and testcontainers
- Dockerized development environment

## Technologies

- Node.js
- Express
- PostgreSQL
- Knex.js (query builder & migrations)
- JSON Web Tokens (jsonwebtoken)
- bcrypt
- express-validator
- Jest
- Supertest
- testcontainers
- Pino (logger)
- pino-http (HTTP request logger)

## Database Setup (Development)

Start the PostgreSQL container
```bash
docker compose up -d
```
Run migrations 
```bash
npx knex migrate:latest
```
Running the Application
```bash
npm start
```
Stop the database when done
```bash
docker compose down
```

## Installation

```bash
# Clone the repository
git clone https://github.com/PhelipeMatheus13/node-jwt-auth
cd node-jwt-auth

# Install dependencies
npm install
```

## Notes

> ⚠️ You must have Docker installed and properly configured, and be running in a Linux-based environment (or WSL on Windows) for the project to work correctly.

> The logger.js and httpLogger.js modules do not have unit tests because they are essentially configurations for Pino/Pino HTTP. Their behavior is validated manually in the development environment, while the business logic related to logger usage is covered by tests in the consuming modules.