import path from "node:path";
import { z } from "zod";

const envSchema = z.object({
  BASE_URL: z.string().url(),
  IS_HEADLESS: z
    .union([z.literal("true"), z.literal("false")])
    .transform((value) => value === "true")
    .default("true"),
  SLOWDOWN_MILLISECONDS: z.coerce.number().nonnegative().default(0),
  AUTH_USERNAME: z.string(),
  AUTH_PASSWORD: z.string(),
  DATA_DIR: z.string().default(path.join(process.cwd(), "data")),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  throw new Error(
    `Error loading environment variables:${env.error.errors
      .map(
        (validationError) =>
          `\n- [${validationError.path.join()}] ${validationError.message}`,
      )
      .join()}`,
  );
}

export const config = {
  baseUrl: env.data.BASE_URL,
  isHeadless: env.data.IS_HEADLESS,
  slowdownMilliseconds: env.data.SLOWDOWN_MILLISECONDS,
  auth: {
    username: env.data.AUTH_USERNAME,
    password: env.data.AUTH_PASSWORD,
  },
  storage: {
    imagesDir: path.join(env.data.DATA_DIR, "images"),
    gameboardsDir: path.join(env.data.DATA_DIR, "gameboards"),
  },
};
