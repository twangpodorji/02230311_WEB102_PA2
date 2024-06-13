# Pokémon Catcher API

This is a simple API built with Hono, Prisma, and Bun to manage Pokémon catching and user authentication using JWT.

## Some of the features in this API include:
- User Registration and user Login with JWT authentication.
- Catchching Pokémon by their name.
- Retrieve details of caught Pokémon.
- Fetching Pokémon data.


## Installation

1. **Clone the repository:**

   git clone <https://github.com/KeldenPDorji/02230311_WEB102_PA2.git>

2. **To install dependencies:**
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000


## Pokémon Endpoints.
### Fetch Pokémon Data from PokeAPI

    URL: /pokemon/:name
    Method: GET
    Response:

    {
      "data": {  "PokeAPI response data"  }
    }

### Catch Pokémon (Protected)

    URL: /protected/catch
    Method: POST
    Headers:
    Authorization: Bearer <JWT_TOKEN>

Body:

    {
    "name": "ditto"
    }

Response:

    {
    "message": "Pokemon caught",
    "data": {
        "id": "add4fc0e-f8d1-4c57-b659-67249831cc6c",
        "userId": "e51d9b7f-4afb-46a5-80ad-b860e4f27b56",
        "pokemonId": "07506617-32da-402a-abcd-2ea9b81ad57a",
        "caughtAt": "2024-06-13T15:27:05.869Z"
    }
}

### Release Pokémon (Protected)

    URL: /protected/release/:id
    Method: DELETE
    Headers:
    Authorization: Bearer <JWT_TOKEN>

Response:

    {
    "message": "Pokemon released"
    }

Get Caught Pokémon (Protected)

    URL: /protected/caught
    Method: GET
    Headers:
    Authorization: Bearer <JWT_TOKEN>

Response:

    {
    "data": [
        {
        "id": "b23f7255-50f2-479b-8304-d650243d917d",
        "userId": "2a5eb751-c1fb-4cfc-a846-9991e721428a",
        "pokemonId": "f4e0b859-1a46-4fab-874b-f8aecc0ca0f3",
        "caughtAt": "2024-06-13T10:25:25.474Z",
        "pokemon": {
            "id": "f4e0b859-1a46-4fab-874b-f8aecc0ca0f3",
            "name": "mew",
        }
        }
    ]
    }

