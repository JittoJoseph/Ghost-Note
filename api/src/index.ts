import { Hono } from "hono";
import { cors } from "hono/cors";
import { Env } from "./env";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import linksRouter from "./routes/links";
import dashboardRouter from "./routes/dashboard";

const app = new Hono<Env>();

app.use("/*", async (c, next) => {
  const allowedOrigin =
    c.env.FRONTEND_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  const corsMiddleware = cors({
    origin: allowedOrigin,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  return corsMiddleware(c, next);
});

app.get("/", (c) => {
  return c.text("GhostNote API");
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.route("/auth", authRouter);
app.route("/user", userRouter);
app.route("/links", linksRouter);
app.route("/dashboard", dashboardRouter);

export default app;
