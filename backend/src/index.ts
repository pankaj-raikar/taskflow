import { serve } from "bun";
import { app } from "./app";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port
});

console.log(`TaskFlow API listening on http://localhost:${port}`);
