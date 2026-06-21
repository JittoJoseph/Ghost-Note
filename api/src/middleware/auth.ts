import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { Env } from "../env";

export const authMiddleware = async (c: Context<Env>, next: Next) => {
  const secret = c.env.JWT_SECRET;

  if (!secret) {
    return c.json({ error: "Internal Server Error: Missing JWT_SECRET" }, 500);
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized: Missing or invalid token" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, secret, "HS256");

    if (!payload || typeof payload.sub !== "string" || typeof payload.provider !== "string") {
      return c.json({ error: "Unauthorized: Invalid token payload" }, 401);
    }

    c.set("user", {
      sub: payload.sub,
      provider: payload.provider,
    });

    await next();
  } catch (error) {
    return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
  }
};
