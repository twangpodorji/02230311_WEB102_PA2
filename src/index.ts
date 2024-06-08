import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient } from "@prisma/client";

const app = new Hono();

const prisma = new PrismaClient();

app.use("/*", cors());

app.get("/:userId/account/balance", async (c) => {
  // get user account balance from url params
  const { userId } = c.req.param();

  // create a new user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { Account: { select: { balance: true, id: true } } },
  });
  return c.json({ data: user });
});

export default app;
