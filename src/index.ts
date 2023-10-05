import fs from "node:fs/promises";
import path from "node:path";
import { inspect } from "node:util";
import { chromium } from "playwright";
import axios from "axios";
import { z } from "zod";

// Config
const envSchema = z.object({
  BASE_URL: z.string().url(),
  IS_HEADLESS: z
    .union([z.literal("true"), z.literal("false")])
    .transform((value) => value === "true")
    .default("true"),
  SLOWDOWN_MILLISECONDS: z.coerce.number().nonnegative().default(0),
  AUTH_USERNAME: z.string(),
  AUTH_PASSWORD: z.string(),
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

const config = {
  baseUrl: env.data.BASE_URL,
  isHeadless: env.data.IS_HEADLESS,
  slowdownMilliseconds: env.data.SLOWDOWN_MILLISECONDS,
  auth: {
    username: env.data.AUTH_USERNAME,
    password: env.data.AUTH_PASSWORD,
  },
  storage: {
    imagesDir: path.join(process.cwd(), "data", "images"),
    gameboardsDir: path.join(process.cwd(), "data", "gameboards"),
  },
  maxCollectionPages: 100,
};

// Types
interface Description {
  long: string;
  short: string;
}

interface Image {
  name: string;
}

interface Rating {
  avg: number;
  count: number;
}

interface Players {
  min: number;
  max: number;
  community: {
    min: number;
    max: number;
  };
  best: {
    min: number;
    max: number;
  };
}

interface Duration {
  min: number;
  max: number;
}

interface Type {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Mechanism {
  id: number;
  name: string;
}

interface Gameboard {
  id: number;
  name: string;
  names: string[];
  url: string;
  rank: number;
  year: number;
  description: Description;
  img: Image;
  rating: Rating;
  players: Players;
  duration: Duration;
  complexity: number;
  types: Type[];
  categories: Category[];
  mechanisms: Mechanism[];
}

// Helpers
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const coerceNumber = (value: unknown) => z.coerce.number().safeParse(value);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const coerceIntNumber = (value: unknown) =>
  z.coerce.number().int().safeParse(value);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const parseIdFromUrl = (url: string | null | undefined) => {
  const urlParts = url?.split("/");
  return coerceIntNumber(urlParts?.[urlParts.length - 2]);
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const parseRange = (value: string | null | undefined) => {
  const split = value?.split("–", 2);

  const tupleResult = z
    .tuple([z.coerce.number().int(), z.coerce.number().int()])
    .safeParse(split);

  if (tupleResult.success) {
    return tupleResult;
  }

  const numberResult = z.coerce
    .number()
    .int()
    .transform((value) => [value, value] as const)
    .safeParse(value);

  return numberResult;
};

// Setup
const browser = await chromium.launch({
  headless: config.isHeadless,
  slowMo: config.slowdownMilliseconds,
});
const page = await browser.newPage({
  baseURL: config.baseUrl,
});

await fs.mkdir(config.storage.imagesDir, { recursive: true });
await fs.mkdir(config.storage.gameboardsDir, { recursive: true });

// Run scraper
try {
  // Auth
  await page.goto("/");
  await page.getByText("Sign In").click();
  await page.getByPlaceholder("Username").fill(config.auth.username);
  await page.getByPlaceholder("Password").fill(config.auth.password);
  await page.getByRole("button", { name: "Sign In" }).click();

  // Iterate through collection pages
  for (let i = 1; i <= config.maxCollectionPages; i++) {
    const gameboards: Gameboard[] = [];
    const images = new Map<string, ArrayBuffer>();

    // Go to collection page
    const collectionUrl = `/browse/boardgame/page/${i}`;
    await page.goto(collectionUrl);

    // Get the current collection
    const collection = await page.locator(".collection_objectname").all();

    // Download info for the games in the collection
    for (const gameboard of collection) {
      // Return to collection page
      await page.goto(collectionUrl);

      // Click on current game to view its details
      await gameboard.locator("a").click();

      const gameUrl = page.url();

      console.debug(`[SCRAPER]: ${gameUrl}`);

      // Game ID from URL
      const gameId = parseIdFromUrl(gameUrl);

      if (!gameId.success) {
        throw new Error(`Invalid game ID for game: '${gameUrl}'`);
      }

      // Game details
      const rank = coerceNumber(
        await page.locator(".rank-number").first().textContent(),
      );

      if (!rank.success) {
        throw new Error(`Invalid rank for game: '${gameUrl}'`);
      }

      const players = parseRange(
        await page.locator(".gameplay-item-primary span").first().textContent(),
      );

      if (!players.success) {
        console.error(new Error(`Invalid players for game: '${gameUrl}'`));
        continue;
      }

      const communityPlayers = parseRange(
        await page
          .locator(".gameplay-item-secondary span")
          .nth(2)
          .textContent(),
      );

      if (!communityPlayers.success) {
        console.error(
          new Error(`Invalid community players for game: '${gameUrl}'`),
        );
        continue;
      }

      const bestPlayers = parseRange(
        (
          await page
            .locator(".gameplay-item-secondary span")
            .nth(3)
            .textContent()
        )?.replaceAll("— 								Best:", ""),
      );

      if (!bestPlayers.success) {
        console.error(new Error(`Invalid best players for game: '${gameUrl}'`));
        continue;
      }

      const duration = parseRange(
        await page
          .locator(".gameplay-item-primary")
          .nth(1)
          .locator("span span")
          .first()
          .textContent(),
      );

      if (!duration.success) {
        throw new Error(`Invalid duration for game: '${gameUrl}'`);
      }

      const types = await Promise.all(
        (
          await page
            .locator(".feature")
            .filter({ hasText: "Type" })
            .first()
            .locator(".feature-description a")
            .all()
        ).map(async (type) => {
          const name = await type.textContent();

          if (!name) {
            throw new Error(`Type name not found for game: '${gameUrl}'`);
          }

          const href = await type.getAttribute("href");
          const id = parseIdFromUrl(href);

          if (!id.success) {
            throw new Error(`Invalid type id for game: '${gameUrl}'`);
          }

          return {
            id: id.data,
            name,
          };
        }),
      );

      const longDescription = await page
        .locator(".game-description-body")
        .textContent();

      if (!longDescription) {
        throw new Error(`Long description not found for game: '${gameUrl}'`);
      }

      const shortDescription = await page
        .locator(".game-header-title-info p")
        .textContent();

      if (!shortDescription) {
        throw new Error(`Short description not found for game: '${gameUrl}'`);
      }

      await page.goto(gameUrl + "/credits");

      const creditsElements = page
        .locator(".panel")
        .filter({ hasText: "Full Credits" })
        .first()
        .locator("li");

      const gameName = await creditsElements
        .filter({ hasText: "Primary Name" })
        .first()
        .locator(".outline-item-description")
        .textContent();

      if (!gameName) {
        throw new Error(`Name not found for game: '${gameUrl}'`);
      }

      const gameNames = (
        await creditsElements
          .filter({ hasText: "Alternate Names" })
          .first()
          .locator(".outline-item-description div div")
          .allTextContents()
      ).slice(1);

      const year = coerceIntNumber(
        await creditsElements
          .filter({ hasText: "Year Released" })
          .first()
          .locator(".outline-item-description")
          .textContent(),
      );

      if (!year.success) {
        throw new Error(`Invalid year for game: '${gameUrl}'`);
      }

      const categories = await Promise.all(
        (
          await creditsElements
            .filter({ hasText: /Categories|Category/ })
            .first()
            .locator(".outline-item-description a")
            .all()
        ).map(async (category) => {
          const name = await category.textContent();

          if (!name) {
            throw new Error(`Category name not found for game: '${gameUrl}'`);
          }

          const href = await category.getAttribute("href");
          const id = parseIdFromUrl(href);

          if (!id.success) {
            throw new Error(`Invalid category id for game: '${gameUrl}'`);
          }

          return {
            id: id.data,
            name,
          };
        }),
      );

      const mechanisms = await Promise.all(
        (
          await creditsElements
            .filter({ hasText: "Mechanisms" })
            .first()
            .locator(".outline-item-description a")
            .all()
        ).map(async (mechanism) => {
          const name = await mechanism.textContent();

          if (!name) {
            throw new Error(`Mechanism name not found for game: '${gameUrl}'`);
          }

          const href = await mechanism.getAttribute("href");
          const id = parseIdFromUrl(href);

          if (!id.success) {
            throw new Error(`Invalid mechanism id for game: '${gameUrl}'`);
          }

          return {
            id: id.data,
            name,
          };
        }),
      );

      // Get game stats
      await page.goto(gameUrl + "/stats");

      const gameStatsElements = page.locator(".game-stats li");

      const avgRating = coerceNumber(
        await gameStatsElements
          .filter({ hasText: "Avg. Rating" })
          .first()
          .locator("a")
          .textContent(),
      );

      if (!avgRating.success) {
        throw new Error(`Invalid average rating for game: '${gameUrl}'`);
      }

      const ratingsCount = coerceNumber(
        (
          await gameStatsElements
            .filter({ hasText: "No. of Ratings" })
            .first()
            .locator("a")
            .textContent()
        )?.replaceAll(",", "."),
      );

      if (!ratingsCount.success) {
        throw new Error(`Invalid ratings count for game: '${gameUrl}'`);
      }

      const complexity = coerceNumber(
        (
          await gameStatsElements
            .filter({ hasText: "Weight" })
            .first()
            .locator("a")
            .textContent()
        )?.split("/", 1)[0],
      );

      if (!complexity.success) {
        throw new Error(`Invalid complexity for game: '${gameUrl}'`);
      }

      // Download the game image
      await page.goto(gameUrl);
      await page.locator(".game-header-image a").first().click();
      await page.locator(".image-nav").click();
      await page.locator(".img-modal-img").click();

      const src = await page.locator(".img-modal-img").getAttribute("src");

      if (!src) {
        throw new Error(`Image source not found for game: '${gameUrl}'`);
      }

      const { data: imageBuffer } = await axios.get<ArrayBuffer>(src, {
        responseType: "arraybuffer",
      });

      const imageFileName = Date.now() + "-" + path.basename(src);

      images.set(imageFileName, imageBuffer);

      const data: Gameboard = {
        id: gameId.data,
        name: gameName.trim(),
        names: gameNames.map((name) => name.trim()),
        url: gameUrl,
        rank: rank.data,
        year: year.data,
        description: {
          long: longDescription.trim(),
          short: shortDescription.trim(),
        },
        img: {
          name: imageFileName,
        },
        rating: {
          avg: avgRating.data,
          count: ratingsCount.data,
        },
        players: {
          min: players.data[0],
          max: players.data[1],
          community: {
            min: communityPlayers.data[0],
            max: communityPlayers.data[1],
          },
          best: {
            min: bestPlayers.data[0],
            max: bestPlayers.data[1],
          },
        },
        duration: {
          min: duration.data[0],
          max: duration.data[1],
        },
        complexity: complexity.data,
        types: types.map((type) => ({
          id: type.id,
          name: type.name.trim(),
        })),
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name.trim(),
        })),
        mechanisms: mechanisms.map((mechanism) => ({
          id: mechanism.id,
          name: mechanism.name.trim(),
        })),
      };

      gameboards.push(data);
      console.debug(
        `[SCRAPER]: ${inspect(data, { depth: null, colors: true })}`,
      );
    }

    for (const [filename, imageBuffer] of images) {
      await fs.writeFile(
        path.join(config.storage.imagesDir, filename),
        Buffer.from(imageBuffer),
      );
    }

    const filename = Date.now() + "-" + i + ".json";
    await fs.writeFile(
      path.join(config.storage.gameboardsDir, filename),
      JSON.stringify(gameboards),
    );
  }
} finally {
  await browser.close();
}
