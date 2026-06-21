import { Hono } from "hono";
import { Env } from "./env";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";

const app = new Hono<Env>();

app.get("/", (c) => {
  return c.text("GhostNote API");
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.route("/auth", authRouter);
app.route("/user", userRouter);

export default app;
