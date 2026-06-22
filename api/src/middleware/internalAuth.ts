import { Context, Next } from "hono";
import { Env } from "../env";

export const internalAuthMiddleware = async (c: Context<Env>, next: Next) => {
  const expectedSecret = c.env.INTERNAL_SERVICE_SECRET;
  if (!expectedSecret) {
    return c.json(
      { error: "Internal Server Error: Missing INTERNAL_SERVICE_SECRET" },
      500,
    );
  }

  const providedSecret = c.req.header("x-internal-service-secret");
  if (!providedSecret || providedSecret !== expectedSecret) {
    return c.json(
      { error: "Unauthorized: Invalid internal service secret" },
      401,
    );
  }

  await next();
};
