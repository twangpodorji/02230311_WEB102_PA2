# Pokemon backend with CRUD Operations

This project is a simple CRUD API built with Hono and Prisma. The API allows you to manage User, Pokemon, and CaughtPokemon models, and includes authentication with JWT.

## Getting Started
### Prerequisites

- Node.js
- npm or yarn

## Installation
1. Clone the repository
```bash
git clone https://github.com/twangpodorji/02230311_WEB102_PA2.git
cd 02230311_WEB102_PA2
```

2. Install dependencies
```bash
npm install
```

3. Set up the database:

    Create a .env file in the root directory and add your database URL:
```env
DATABASE_URL="file:./dev.db"
```

4. Generate Prisma client:

```bash 
npx prisma generate
```

5. Migrate the database:

```bash
npx prisma migrate dev --name init
```
6. Start the server:

```
npm run dev
```

# API Endpoints

1. User Endpoints
- Sign Up: POST /signup
- Request body:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```
2. Sign In: POST /signin
- Request body:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```
- Get All Users: GET /users

- Get User by ID: GET /users/:id

- Update User: PUT /users/:id

- Request body:
``` json
{
  "email": "new-email@example.com",
  "hashedPassword": "newpassword"
}
```
- Delete User: DELETE /users/:id

## Pokémon Endpoints

- Get Pokémon by Name: GET /pokemon/:name

- Update Pokémon: PUT /pokemon/:name

- Request body:

``` 
{
  "name": "new-name"
}
```
- Delete Pokémon: DELETE /pokemon/:name

## Caught Pokémon Endpoints

- Get All Caught Pokémon for a User: GET /caught-pokemons/:userId

- Catch a Pokémon: POST /caught-pokemons

- Request body:

- Release a Caught Pokémon: DELETE /caught-pokemons/:id

- Get All Caught Pokémon: GET /caught-pokemons

- Get Caught Pokémon by ID: GET /caught-pokemons/:id

- Update Caught Pokémon: PUT /caught-pokemons/:id

- Request body:
```
{
  "userId": "new-user-id",
  "pokemonId": "new-pokemon-id"
}
```
- Delete Caught Pokémon: DELETE /caught-pokemons/:id

# Authentication

JWT authentication is used for protected routes. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```
Rate limiting is applied to all requests with a limit of 10 requests per minute for each IP.