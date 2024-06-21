// Import the necessary libraries
import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient, Prisma } from "@prisma/client";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import axios from "axios";
import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";
import { rateLimiter } from "hono-rate-limiter";

type Variables = JwtVariables; // Defining the type of the variables to be used in the app

const app = new Hono<{ Variables: Variables }>();
const prisma = new PrismaClient();

app.use("/*", cors());

app.use(
  "/protected/*",
  jwt({
    secret: "mySecretKey",
  })
);

// Rate limiting
// Enable CORS for all routes
app.use("/*", cors());

// Create a rate limiter middleware
const limiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // rate limiter for 1 minute
  limit: 10, // 10 requests per minute for each IP
  standardHeaders: "draft-6", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  keyGenerator: (c) => c.req.header("X-Forwarded-For") || "default",
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// Initializing the end points
// endpoint for the registration or an signup page to create the user 
app.post("/signup", async (c) => {
  const body = await c.req.json();
  const email = body.email;
  const password = body.password;

  const bcryptHash = await Bun.password.hash(password, {
    algorithm: "bcrypt", // The algorithm to use for hashing
    cost: 4, // The cost of the hash algorithm
  });

  try {
    // creating the user in the database using the email and password that is passed in the body
    const user = await prisma.user.create({
      data: {
        email: email,
        hashedPassword: bcryptHash,
      },
    });

    // returning the message that if the user is created successfully not and
    //if it is created earlier then it will return the message that email already exists
    return c.json({ message: `${user.email} is created successfully` });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return c.json({ message: " This Email already exists" });
      }
    }
    // if the user is not created successfully then it will return the message that internal server error
    throw new HTTPException(500, {
      message: "There Is A Internal Server Error",
    });
  }
});

// endpoint for the login/signin page to authenticate the user
app.post("/signin", async (c) => {
  try {
    // passing the email and password to the body for login
    const body = await c.req.json();
    const email = body.email;
    const password = body.password;

    // fetching the user information from the database using email
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
        exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
      };
      const secret = "mySecretKey";
      const token = await sign(payload, secret); // Await the sign function

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

// CRUD endpoints for User model  
app.get("/users", async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});

// endpoint to get the user by id 
app.get("/users/:id", async (c) => {
  const id = c.req.param("id");
  const user = await prisma.user.findUnique({ where: { id: id } });
  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }
  return c.json(user);
});

// endpoint to update an users form their id 
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

// endpoint to delete the user by id 
app.delete("/users/:id", async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.user.delete({ where: { id: id } });
    return c.json({ message: "User deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return c.json({ message: "User not found" }, 404);
    }
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// CRUD endpoints for Pokemon model
app.get("/pokemons", async (c) => {
  const pokemons = await prisma.pokemon.findMany();
  return c.json(pokemons);
});

app.get("/pokemons/:id", async (c) => {
  const id = c.req.param("id");
  const pokemon = await prisma.pokemon.findUnique({ where: { id: id } });
  if (!pokemon) {
    return c.json({ message: "Pokemon not found" }, 404);
  }
  return c.json(pokemon);
});

// endpoint to create a new pokemon 
app.post("/pokemons", async (c) => {
  const body = await c.req.json();
  try {
    const newPokemon = await prisma.pokemon.create({
      data: body,
    });
    return c.json(newPokemon);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return c.json({ message: "Pokemon already exists" }, 400);
    }
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// endpoint to update the pokemon by id 
app.put("/pokemons/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  try {
    const updatedPokemon = await prisma.pokemon.update({
      where: { id: id },
      data: body,
    });
    return c.json(updatedPokemon);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return c.json({ message: "Pokemon not found" }, 404);
    }
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// endpoint to delete the pokemon by id
app.delete("/pokemons/:id", async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.pokemon.delete({ where: { id: id } });
    return c.json({ message: "Pokemon deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return c.json({ message: "Pokemon not found" }, 404);
    }
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// CRUD endpoints for CaughtPokemon model
app.get("/caught-pokemons", async (c) => {
  const caughtPokemons = await prisma.caughtPokemon.findMany();
  return c.json(caughtPokemons);
});

// endpoint to get the caught pokemon by id
app.get("/caught-pokemons/:id", async (c) => {
  const id = c.req.param("id");
  const caughtPokemon = await prisma.caughtPokemon.findUnique({ where: { id: id } });
  if (!caughtPokemon) {
    return c.json({ message: "Caught Pokemon not found" }, 404);
  }
  return c.json(caughtPokemon);
});

// endpoint to create a new caught pokemon
app.post("/caught-pokemons", async (c) => {
  const body = await c.req.json();
  try {
    const newCaughtPokemon = await prisma.caughtPokemon.create({
      data: body,
    });
    return c.json(newCaughtPokemon);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return c.json({ message: "User or Pokemon not found" }, 400);
    }
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});
// endpoint to update the caught pokemon by id
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

// endpoint to delete the caught pokemon by id
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

