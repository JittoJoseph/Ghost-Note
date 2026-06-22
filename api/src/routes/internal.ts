import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { users, links } from "../db/schema";
import { hashPassword } from "../utils/password";
import { internalAuthMiddleware } from "../middleware/internalAuth";
import { Env } from "../env";

const internalRouter = new Hono<Env>();

// Apply the internal auth middleware to all routes in this router
internalRouter.use("*", internalAuthMiddleware);

const createTelegramLinkSchema = z.object({
  telegramChatId: z.string(),
  telegramUsername: z.string().optional(),
  password: z.string(),
});

internalRouter.post(
  "/telegram/link",
  zValidator("json", createTelegramLinkSchema),
  async (c) => {
    const { telegramChatId, telegramUsername, password } = c.req.valid("json");
    const db = drizzle(c.env.DB);

    try {
      // 1. Find or create the user cleanly avoiding race conditions
      await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          provider: "telegram",
          telegramChatId,
          telegramUsername,
          createdAt: new Date(),
        })
        .onConflictDoNothing({ target: users.telegramChatId });

      const user = await db
        .select()
        .from(users)
        .where(eq(users.telegramChatId, telegramChatId))
        .get();

      if (!user) {
        throw new Error("Failed to resolve user");
      }

      // 2. Generate link and password hash
      const hashedPassword = await hashPassword(password);
      const linkId = crypto.randomUUID();

      // Create an 8-character URL-safe random hex slug
      const slug = Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      await db.insert(links).values({
        id: linkId,
        userId: user.id,
        slug,
        passwordHash: hashedPassword,
        createdAt: new Date(),
      });

      const url = c.env.FRONTEND_URL
        ? `${c.env.FRONTEND_URL}/l/${slug}`
        : `/l/${slug}`;

      return c.json({ id: linkId, slug, url, createdAt: new Date() }, 201);
    } catch (error) {
      console.error("Error creating telegram link:", error);
      return c.json({ error: "Failed to create telegram link" }, 500);
    }
  },
);

export default internalRouter;
