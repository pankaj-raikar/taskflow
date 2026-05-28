import { Hono } from "hono";
import { authRoutes } from "./auth";
import { taskRoutes } from "./tasks";

export const apiRoutes = new Hono()
  .route("/auth", authRoutes)
  .route("/tasks", taskRoutes);
