import { z } from "zod";

const envSchema = z.object({
  SCRAPER_BASE_URL: z.string().url(),
  SCRAPER_IS_HEADLESS: z
    .union([z.literal("true"), z.literal("false")])
    .transform((value) => value === "true")
    .default("true"),
  SCRAPER_SLOWDOWN_MILLISECONDS: z.coerce.number().nonnegative().default(0),
  SCRAPER_AUTH_USERNAME: z.string(),
  SCRAPER_AUTH_PASSWORD: z.string(),
  MONGODB_URL: z.string().url(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  throw new Error(
    `Error loading environment variables:${env.error.errors
      .map(
        (validationError) =>
          `\n- [${validationError.path.join(",")}] ${validationError.message}`,
      )
      .join(",")}`,
  );
}

export const config = {
  scraper: {
    baseUrl: env.data.SCRAPER_BASE_URL,
    isHeadless: env.data.SCRAPER_IS_HEADLESS,
    slowdownMilliseconds: env.data.SCRAPER_SLOWDOWN_MILLISECONDS,
    auth: {
      username: env.data.SCRAPER_AUTH_USERNAME,
      password: env.data.SCRAPER_AUTH_PASSWORD,
    },
  },
  mongoDb: {
    url: env.data.MONGODB_URL,
  },
};
