import { Hono } from "hono";
import { authRoutes } from "./auth";

export const apiRoutes = new Hono().route("/auth", authRoutes);
