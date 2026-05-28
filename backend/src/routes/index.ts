import { Hono } from "hono";
import { authRoutes } from "./auth";
import { projectRoutes } from "./projects";
import { taskRoutes } from "./tasks";
import { userRoutes } from "./users";

export const apiRoutes = new Hono()
  .route("/auth", authRoutes)
  .route("/users", userRoutes)
  .route("/tasks", taskRoutes)
  .route("/projects", projectRoutes);
