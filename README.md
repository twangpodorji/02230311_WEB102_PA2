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

## User Endpoints

1. Get all users
- Method: GET
- URL: /users
- Description: Fetches all users.

2. Get a user by ID
- Method: GET
- URL: /users
- Description: Fetches all users.

3. Create a user (Signup)
- Method: POST
- URL: /signup
- Description: Creates a new user.
- Body:
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

4. Update a user by ID

- Method: PUT
- URL: /users/:id
- Description: Updates a user by their ID.
- Parameters: Replace :id with the actual user ID.
- Body: Use the JSON format for the fields you want to update:
json
```json
{
  "email": "newemail@exampl.com",
  "hashedPassword": "newhashedpassword"
}
```

5. Delete a user by ID

- Method: DELETE
- URL: /users/:id
- Description: Deletes a user by their ID.
- Parameters: Replace :id with the actual user ID.

## Pokemon Endpoints

1. Get all pokemons

- Method: GET
- URL: /pokemons
- Description: Fetches all pokemons.

Get a pokemon by ID

2. Method: GET
- URL: /pokemons/:id
- Description: Fetches a pokemon by their ID.
- Parameters: Replace :id with the actual pokemon ID.

3. Create a pokemon

- Method: POST
- URL: /pokemons
- Description: Creates a new pokemon.
- Body

```json
{
  "name": "Pikachu"
}
```

4. Update a pokemon by ID

- Method: PUT
- URL: /pokemons/:id
- Description: Updates a pokemon by their ID.
- Parameters: Replace :id with the actual pokemon ID.
- Body: Use the JSON format for the fields you want to update:
```json
{
  "name": "Ditto"
}
```

5. Delete a pokemon by ID

- Method: DELETE
- URL: /pokemons/:id
- Description: Deletes a pokemon by their ID.
- Parameters: Replace :id with the actual pokemon ID.

## CaughtPokemon Endpoints

1. Get all caught pokemons

- Method: GET
- URL: /caught-pokemons
- Description: Fetches all caught pokemons.

2. Get a caught pokemon by ID

- Method: GET
- URL: /caught-pokemons/:id
- Description: Fetches a caught pokemon by their ID.
- Parameters: Replace :id with the actual caught pokemon ID.

3. Create a caught pokemon

- Method: POST
- URL: /caught-pokemons
- Description: Creates a new caught pokemon.
Body:
```json
{
  "userId": "user-id-here",
  "pokemonId": "pokemon-id-here"
}
```

4. Update a caught pokemon by ID

- Method: PUT
- URL: /caught-pokemons/:id
- Description: Updates a caught pokemon by their ID.
- Parameters: Replace :id with the actual caught pokemon ID.
- Body: Use the JSON format for the fields you want to update:
```json
{
  "userId": "new-user-id",
  "pokemonId": "new-pokemon-id"
}
```

5. Delete a caught pokemon by ID

- Method: DELETE
- URL: /caught-pokemons/:id
- Description: Deletes a caught pokemon by their ID.
- Parameters: Replace :id with the actual caught pokemon ID.

### Authentication

For endpoints that require authentication (like those under /protected/*), you need to include the JWT token in the headers of your requests:

- Header Key: Authorization
- Header Value: Bearer <your-jwt-token>

To get the JWT token, you need to log in using the /signin endpoint.

#### Example Login Request
- Method: POST
- URL: /signin
- Body:
```
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
After successfully logging in, you will receive a JWT token. Use this token for any authenticated requests.


