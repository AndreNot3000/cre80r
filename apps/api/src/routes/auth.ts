import { Hono } from "hono";
import { auth } from "@crea8or/auth";

export const authRoutes = new Hono();

// Better Auth handles all auth requests (both GET & POST for all sub-paths)
authRoutes.on(["GET", "POST"], "/*", (c) => auth.handler(c.req.raw));
