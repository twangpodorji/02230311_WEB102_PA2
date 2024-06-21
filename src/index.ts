import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient, Prisma } from "@prisma/client";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import axios from "axios";
import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";
import { rateLimiter } from "hono-rate-limiter";

type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables }>();
const prisma = new PrismaClient();

app.use("/*", cors());

app.use(
  "/protected/*",
  jwt({
    secret: "mySecretKey",
  })
);

const limiter = rateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header("X-Forwarded-For") || "default",
});

app.use(limiter);

// Signup Endpoint
app.post("/signup", async (c) => {
  const body = await c.req.json();
  const email = body.email;
  const password = body.password;

  const bcryptHash = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 4,
  });

  try {
    const user = await prisma.user.create({
      data: {
        email: email,
        hashedPassword: bcryptHash,
      },
    });

    return c.json({ message: `${user.email} is created successfully` });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return c.json({ message: "This Email already exists" });
      }
    }
    throw new HTTPException(500, {
      message: "There Is A Internal Server Error",
    });
  }
});

// Signin Endpoint
app.post("/signin", async (c) => {
  try {
    const body = await c.req.json();
    const email = body.email;
    const password = body.password;

    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true, hashedPassword: true },
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    const match = await Bun.password.verify(
      password,
      user.hashedPassword,
      "bcrypt"
    );

    if (match) {
      const payload = {
        sub: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 5,
      };
      const secret = "mySecretKey";
      const token = await sign(payload, secret);

      if (typeof token !== "string") {
        console.error("Token signing failed", token);
        throw new HTTPException(500, { message: "Token signing failed" });
      }

      return c.json({ message: "Login successful", token: token });
    } else {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof HTTPException) {
      throw error;
    } else {
      throw new HTTPException(500, {
        message: "There Is A Internal Server Error",
      });
    }
  }
});

// Fetch a Pokemon from PokeAPI or database
app.get("/pokemon/:name", async (c) => {
  const { name } = c.req.param();

  try {
    let pokemon = await prisma.pokemon.findUnique({
      where: { name: name },
    });

    if (!pokemon) {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const pokemonData = response.data;

      pokemon = await prisma.pokemon.create({
        data: {
          name: pokemonData.name,
        },
      });
    }

    return c.json({ data: pokemon });
  } catch (error) {
    return c.json({ message: "Pokemon not found" }, 404);
  }
});

// Update a Pokemon in the database
app.put("/pokemon/:name", async (c) => {
  const { name } = c.req.param();
  const body = await c.req.json();

  try {
    let pokemon = await prisma.pokemon.findUnique({
      where: { name: name },
    });

    if (!pokemon) {
      return c.json({ message: "Pokemon not found" }, 404);
    }

    pokemon = await prisma.pokemon.update({
      where: { name: name },
      data: body,
    });

    return c.json({ data: pokemon });
  } catch (error) {
    return c.json({ message: "Failed to update Pokemon" }, 500);
  }
});

// Delete a Pokemon from the database
app.delete("/pokemon/:name", async (c) => {
  const { name } = c.req.param();

  try {
    const pokemon = await prisma.pokemon.findUnique({
      where: { name: name },
    });

    if (!pokemon) {
      return c.json({ message: "Pokemon not found" }, 404);
    }

    await prisma.pokemon.delete({
      where: { name: name },
    });

    return c.json({ message: "Pokemon deleted successfully" });
  } catch (error) {
    return c.json({ message: "Failed to delete Pokemon" }, 500);
  }
});

// Fetch all caught Pokemon for a user
app.get("/caught-pokemons/:userId", async (c) => {
  const { userId } = c.req.param();

  try {
    const caughtPokemons = await prisma.caughtPokemon.findMany({
      where: { userId: userId },
      include: { pokemon: true },
    });

    return c.json({ data: caughtPokemons });
  } catch (error) {
    return c.json({ message: "Failed to fetch caught Pokemon" }, 500);
  }
});

// Catch a Pokemon for a user
app.post("/caught-pokemons", async (c) => {
  const body = await c.req.json();
  const { userId, pokemonName } = body;

  try {
    let pokemon = await prisma.pokemon.findUnique({
      where: { name: pokemonName },
    });

    if (!pokemon) {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      const pokemonData = response.data;

      pokemon = await prisma.pokemon.create({
        data: {
          name: pokemonData.name,
        },
      });
    }

    const caughtPokemon = await prisma.caughtPokemon.create({
      data: {
        userId: userId,
        pokemonId: pokemon.id,
      },
    });

    return c.json({ data: caughtPokemon });
  } catch (error) {
    return c.json({ message: "Failed to catch Pokemon" }, 500);
  }
});

// Release a caught Pokemon
app.delete("/caught-pokemons/:id", async (c) => {
  const { id } = c.req.param();

  try {
    const caughtPokemon = await prisma.caughtPokemon.findUnique({
      where: { id: id },
    });

    if (!caughtPokemon) {
      return c.json({ message: "Caught Pokemon not found" }, 404);
    }

    await prisma.caughtPokemon.delete({
      where: { id: id },
    });

    return c.json({ message: "Caught Pokemon released successfully" });
  } catch (error) {
    return c.json({ message: "Failed to release Pokemon" }, 500);
  }
});

// User CRUD Endpoints
app.get("/users", async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});

app.get("/users/:id", async (c) => {
  const id = c.req.param("id");
  const user = await prisma.user.findUnique({ where: { id: id } });
  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }
  return c.json(user);
});

app.put("/users/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  try {
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: body,
    });
    return c.json(updatedUser);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return c.json({ message: "User not found" }, 404);
    }
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

app.delete("/users/:id", async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.user.delete({ where: { id: id } });
    return c.json({ message: "User deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return c.json({ message: "User not found" },
        404);
    }
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// CaughtPokemon CRUD Endpoints
app.get("/caught-pokemons", async (c) => {
  const caughtPokemons = await prisma.caughtPokemon.findMany({
    include: { pokemon: true, user: true },
  });
  return c.json(caughtPokemons);
});

app.get("/caught-pokemons/:id", async (c) => {
  const id = c.req.param("id");
  const caughtPokemon = await prisma.caughtPokemon.findUnique({
    where: { id: id },
    include: { pokemon: true, user: true },
  });
  if (!caughtPokemon) {
    return c.json({ message: "Caught Pokemon not found" }, 404);
  }
  return c.json(caughtPokemon);
});

app.put("/caught-pokemons/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  try {
    const updatedCaughtPokemon = await prisma.caughtPokemon.update({
      where: { id: id },
      data: body,
    });
    return c.json(updatedCaughtPokemon);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return c.json({ message: "Caught Pokemon not found" }, 404);
    }
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

app.delete("/caught-pokemons/:id", async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.caughtPokemon.delete({ where: { id: id } });
    return c.json({ message: "Caught Pokemon deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return c.json({ message: "Caught Pokemon not found" }, 404);
    }
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

export default app;
