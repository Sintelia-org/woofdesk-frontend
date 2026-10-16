// @ts-check
import { clientEnv, clientSchema } from "./schema.mjs";

const parsed = clientSchema.safeParse(clientEnv);

if (!parsed.success) {
  console.error(
    "Variables públicas inválidas",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid public environment variables");
}

export const env = parsed.data;
