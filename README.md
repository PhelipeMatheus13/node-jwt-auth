# JWT Authentication API

A simple and secure authentication API built with Node.js, Express, and PostgreSQL. It implements JWT-based authentication with access and refresh tokens, input validation, and a clean MVC architecture with a repository layer. The project includes comprehensive unit and integration tests using ephemeral PostgreSQL containers.

## Features

- User registration with password hashing (bcrypt)
- User login returning access and refresh tokens (JWT)
- Protected routes using middleware
- Refresh token rotation stored in PostgreSQL
- Logout with token revocation
- Input validation with express-validator
- Repository pattern for data access
- SQL migrations with Knex.js
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

## Database Setup (Development)

Start the PostgreSQL container
```bash
docker-compose up -d
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
docker-compose down
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
