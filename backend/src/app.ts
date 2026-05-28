import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { onError } from "./middleware/error";
import { apiRoutes } from "./routes";

export const app = new Hono();

app.use(logger());
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
  })
);

app.get("/health", (c) => c.json({ data: { status: "ok" } }));
app.route("/api", apiRoutes);
app.onError(onError);
