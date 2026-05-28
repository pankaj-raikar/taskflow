import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const onError: ErrorHandler = (error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }

  console.error(error);
  return c.json({ error: "Internal server error" }, 500);
};

export function validationError(message = "Invalid request body", status: ContentfulStatusCode = 400) {
  return { error: message, status };
}
