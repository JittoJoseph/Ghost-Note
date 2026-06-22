import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { users, links, submissions } from "../db/schema";
import { hashPassword, verifyPassword } from "../utils/password";
import { authMiddleware } from "../middleware/auth";
import { Env } from "../env";

const linksRouter = new Hono<Env>();

// Create anonymous link (Authenticated)
const createLinkSchema = z.object({
  password: z.string(),
});

linksRouter.post(
  "/",
  authMiddleware,
  zValidator("json", createLinkSchema),
  async (c) => {
    const { password } = c.req.valid("json");
    const user = c.get("user");
    const db = drizzle(c.env.DB);

    const hashedPassword = await hashPassword(password);
    const linkId = crypto.randomUUID();

    // Create an 8-character URL-safe random hex slug
    const slug = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    try {
      await db.insert(links).values({
        id: linkId,
        userId: user.sub,
        slug,
        passwordHash: hashedPassword,
        createdAt: new Date(),
      });

      const url = c.env.FRONTEND_URL
        ? `${c.env.FRONTEND_URL}/l/${slug}`
        : `/l/${slug}`;

      return c.json({ id: linkId, slug, url, createdAt: new Date() }, 201);
    } catch (error) {
      return c.json({ error: "Failed to create link" }, 500);
    }
  },
);

// Validate link (Public)
linksRouter.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const db = drizzle(c.env.DB);

  const link = await db.select().from(links).where(eq(links.slug, slug)).get();

  if (!link || link.isUsed) {
    return c.json({ error: "Link is invalid or has already been used" }, 404);
  }

  try {
    // Register the visit
    await db
      .update(links)
      .set({
        visitCount: link.visitCount + 1,
        openedAt: link.openedAt || new Date(),
      })
      .where(eq(links.id, link.id));

    // Notify if owner is a telegram user
    c.executionCtx.waitUntil(
      (async () => {
        try {
          const owner = await db
            .select()
            .from(users)
            .where(eq(users.id, link.userId))
            .get();
          if (owner && owner.provider === "telegram" && owner.telegramChatId) {
            await c.env.BOT.fetch(`https://internal/internal/notify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-internal-service-secret": c.env.INTERNAL_SERVICE_SECRET,
              },
              body: JSON.stringify({
                chatId: owner.telegramChatId,
                text: "Someone opened your anonymous message link.",
              }),
            });
          }
        } catch (err) {
          console.error("Failed to send open notification:", err);
        }
      })(),
    );

    return c.json({ valid: true });
  } catch (error) {
    return c.json({ error: "Failed to process visit" }, 500);
  }
});

// Submit message (Public)
const submitSchema = z.object({
  password: z.string(),
  message: z.string().min(1).max(2000),
});

linksRouter.post(
  "/:slug/submit",
  zValidator("json", submitSchema),
  async (c) => {
    const slug = c.req.param("slug");
    const { password, message } = c.req.valid("json");
    const db = drizzle(c.env.DB);

    const link = await db
      .select()
      .from(links)
      .where(eq(links.slug, slug))
      .get();

    if (!link || link.isUsed) {
      return c.json({ error: "Link is invalid or has already been used" }, 404);
    }

    const isValidPassword = await verifyPassword(password, link.passwordHash);
    if (!isValidPassword) {
      return c.json({ error: "Invalid password" }, 401);
    }

    try {
      // 1. Claim the link first
      const result = await db
        .update(links)
        .set({ isUsed: true })
        .where(and(eq(links.id, link.id), eq(links.isUsed, false)))
        .returning({ id: links.id });

      if (result.length === 0) {
        return c.json(
          { error: "Link is invalid or has already been used" },
          403,
        );
      }

      // 2. Only then create the submission
      const submissionId = crypto.randomUUID();
      try {
        await db.insert(submissions).values({
          id: submissionId,
          linkId: link.id,
          message,
          createdAt: new Date(),
        });
      } catch (insertError) {
        // Revert the link claim if the submission fails to ensure consistency
        await db
          .update(links)
          .set({ isUsed: false })
          .where(eq(links.id, link.id));

        throw insertError;
      }

      // Notify if owner is a telegram user
      c.executionCtx.waitUntil(
        (async () => {
          try {
            const owner = await db
              .select()
              .from(users)
              .where(eq(users.id, link.userId))
              .get();
            if (
              owner &&
              owner.provider === "telegram" &&
              owner.telegramChatId
            ) {
              await c.env.BOT.fetch(`https://internal/internal/notify`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-internal-service-secret": c.env.INTERNAL_SERVICE_SECRET,
                },
                body: JSON.stringify({
                  chatId: owner.telegramChatId,
                  text: `New message received:\n\n${message}`,
                }),
              });
            }
          } catch (err) {
            console.error("Failed to send submission notification:", err);
          }
        })(),
      );

      return c.json({ message: "Submission successful" }, 201);
    } catch (error) {
      return c.json({ error: "Failed to submit message" }, 500);
    }
  },
);

export default linksRouter;
