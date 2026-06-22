import { Hono } from "hono";
import { Env } from "./env";

const app = new Hono<Env>();

// Helper to escape HTML specifically for Telegram's HTML parse_mode
const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

// Helper to send telegram messages
const sendTelegramMessage = async (
  token: string,
  chatId: string | number,
  text: string,
  options?: { parseMode?: "HTML" | "MarkdownV2"; replyMarkup?: any },
) => {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: options?.parseMode,
      reply_markup: options?.replyMarkup,
    }),
  });
  if (!response.ok) {
    console.error("Failed to send telegram message:", await response.text());
  }
};

app.get("/", (c) => {
  return c.text("GhostNote Telegram Bot Service");
});

// Internal endpoint to handle notifications from API
app.post("/internal/notify", async (c) => {
  const expectedSecret = c.env.INTERNAL_SERVICE_SECRET;
  const providedSecret = c.req.header("x-internal-service-secret");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { chatId, text } = (await c.req.json()) as {
      chatId: string | number;
      text: string;
    };
    if (!chatId || !text) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Fire off telegram API call asynchronously without blocking
    c.executionCtx.waitUntil(
      sendTelegramMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, text, {
        parseMode: "HTML",
      }),
    );

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Invalid payload" }, 400);
  }
});

// Telegram Webhook
app.post("/webhook", async (c) => {
  try {
    const update = (await c.req.json()) as {
      message?: {
        chat: { id: number | string };
        text?: string;
        from?: { username?: string };
      };
      callback_query?: {
        message?: { chat: { id: number | string } };
        data?: string;
        from?: { username?: string };
      };
    };

    let chatId: number | string | undefined;
    let text: string | undefined;

    if (update.message?.text) {
      chatId = update.message.chat.id;
      text = update.message.text;
    } else if (update.callback_query?.data) {
      chatId = update.callback_query.message?.chat.id;
      text = update.callback_query.data;
    }

    if (!chatId || !text) {
      return c.json({ ok: true }); // Acknowledge to Telegram
    }

    const stateKey = `telegram_state:${chatId}`;

    // Handle /start command
    if (text === "/start") {
      await c.env.BOT_STATE_KV.delete(stateKey);
      await sendTelegramMessage(
        c.env.TELEGRAM_BOT_TOKEN,
        chatId,
        "Welcome to <b>GhostNote</b>.\n\nGenerate one-time, anonymous message links directly from Telegram. No account required.",
        {
          parseMode: "HTML",
          replyMarkup: {
            inline_keyboard: [
              [{ text: "Create Link", callback_data: "/link" }],
            ],
          },
        },
      );
      return c.json({ ok: true });
    }

    // Handle /link command (or callback)
    if (text === "/link") {
      // Set KV state
      await c.env.BOT_STATE_KV.put(stateKey, "WAITING_FOR_PASSWORD", {
        expirationTtl: 300,
      }); // 5 mins
      await sendTelegramMessage(
        c.env.TELEGRAM_BOT_TOKEN,
        chatId,
        "<b>Secure your link</b>\n\nPlease reply with a password for your new anonymous link.",
        { parseMode: "HTML" },
      );
      return c.json({ ok: true });
    }

    // Check if we are waiting for a password
    const state = await c.env.BOT_STATE_KV.get(stateKey);
    if (state === "WAITING_FOR_PASSWORD") {
      // Clear state immediately
      await c.env.BOT_STATE_KV.delete(stateKey);

      const password = text;

      // Call internal API via Service Binding
      const apiUrl = `https://internal/internal/telegram/link`;
      const response = await c.env.API.fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-service-secret": c.env.INTERNAL_SERVICE_SECRET,
        },
        body: JSON.stringify({
          telegramChatId: chatId.toString(),
          password: password,
        }),
      });

      if (!response.ok) {
        console.error("API error:", await response.text());
        await sendTelegramMessage(
          c.env.TELEGRAM_BOT_TOKEN,
          chatId,
          "<b>An error occurred.</b> Please try again.",
          { parseMode: "HTML" },
        );
        return c.json({ ok: true });
      }

      const data = (await response.json()) as { url: string };

      await sendTelegramMessage(
        c.env.TELEGRAM_BOT_TOKEN,
        chatId,
        `<b>Link generated successfully!</b>\n\n<b>URL:</b>\n<code>${escapeHtml(data.url)}</code>\n\n<b>Password:</b>\n<code>${escapeHtml(password)}</code>`,
        {
          parseMode: "HTML",
          replyMarkup: {
            inline_keyboard: [
              [
                {
                  text: "Share Link",
                  url: `https://t.me/share/url?url=${encodeURIComponent(data.url)}`,
                },
              ],
            ],
          },
        },
      );
      return c.json({ ok: true });
    }

    // If no matching state or command, just acknowledge (or resend help)
    await sendTelegramMessage(
      c.env.TELEGRAM_BOT_TOKEN,
      chatId,
      "Command not recognized.\n\nUse /link to generate a new anonymous link.",
    );
    return c.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return c.json({ ok: true }); // Always return 200 to Telegram to prevent retries on unhandled errors
  }
});

export default app;
