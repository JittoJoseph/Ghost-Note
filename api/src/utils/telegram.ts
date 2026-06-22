import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { Context } from "hono";
import { Env } from "../env";
import { DrizzleD1Database } from "drizzle-orm/d1";

export async function notifyTelegramOwner(
  c: Context<Env>,
  db: DrizzleD1Database<any>,
  userId: string,
  text: string,
): Promise<void> {
  try {
    const owner = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
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
          text,
        }),
      });
    }
  } catch (err) {
    console.error("Failed to send telegram notification:", err);
  }
}
