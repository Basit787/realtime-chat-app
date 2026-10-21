import { createFactory } from "hono/factory";
import type { AppEnv } from "../types/app-env.js";

// Builds typed controller handlers (middleware + handler chains)
export const factory = createFactory<AppEnv>();
