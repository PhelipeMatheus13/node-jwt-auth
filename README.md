# JWT Authentication API

A simple and secure authentication API built with Node.js, Express, and MongoDB. It implements JWT-based authentication with access and refresh tokens, input validation, and a clean MVC architecture. The project includes comprehensive unit and integration tests.

## Features

- User registration with password hashing (bcrypt)
- User login returning access and refresh tokens (JWT)
- Protected routes using middleware
- Refresh token rotation stored in MongoDB
- Logout with token revocation
- Input validation with express-validator
- MVC architecture (Models, Controllers, Services, Routes)
- Unit and integration tests with Jest and Supertest
- In-memory database for testing (mongodb-memory-server)

## Technologies

- Node.js
- Express
- MongoDB (Mongoose)
- JSON Web Tokens (jsonwebtoken)
- bcrypt
- express-validator
- Jest
- Supertest
- mongodb-memory-server

## Installation

```bash
# Clone the repository
git clone https://github.com/PhelipeMatheus13/node-jwt-auth
cd node-jwt-auth

# Install dependencies
npm install
