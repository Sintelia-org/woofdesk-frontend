// @ts-check
import "server-only";

import { serverSchema } from "./schema.mjs";

const parsed = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  console.error(
    "Variables de servidor inválidas",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid server environment variables");
}

export const env = parsed.data;
