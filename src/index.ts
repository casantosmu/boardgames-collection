import { z } from "zod";
import { MongoClient, type WithId, type AnyBulkWriteOperation } from "mongodb";
import { chromium, type Page } from "playwright";

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
          `\n- [${validationError.path.join()}] ${validationError.message}`,
      )
      .join()}`,
  );
}

const config = {
  playwright: {
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

const authenticateScraper = async (
  page: Page,
  auth: { username: string; password: string },
): Promise<void> => {
  await page.goto("/");
  await page.getByText("Sign In").click();
  await page.getByPlaceholder("Username").fill(auth.username);
  await page.getByPlaceholder("Password").fill(auth.password);
  await page.getByRole("button", { name: "Sign In" }).click();
};

const scrapeGamesLinksByListLink = async (
  page: Page,
  listLink: string,
): Promise<string[]> => {
  await page.goto(listLink);

  const element = await page.locator(".collection_objectname a").all();

  return Promise.all(
    element.map(async (element) => {
      const href = await element.getAttribute("href");
      const text = await element.textContent();
      if (!href) {
        throw new Error(`Missing href attribute in ${text}`);
      }
      return href;
    }),
  );
};

const generateListsLinks = (): string[] => {
  const link: string[] = [];
  for (let page = 1; page <= 100; page++) {
    link.push(`/browse/boardgame/page/${page}`);
  }
  return link;
};

interface LinkDocument {
  link: string;
  type: "list" | "game";
  data?: unknown;
  visitedAt: Date | null;
}

const client = new MongoClient(config.mongoDb.url);
const db = client.db();
const links = db.collection<LinkDocument>("links");

const insertLinksIfNotExistsRepository = async (
  documents: LinkDocument[],
): Promise<void> => {
  await links.bulkWrite(
    documents.map((document) => {
      return {
        updateOne: {
          filter: {
            link: document.link,
            type: document.type,
          },
          update: {
            $setOnInsert: document,
          },
          upsert: true,
        },
      };
    }),
  );
};

const findNonVisitedLinksRepository = async (
  type: LinkDocument["type"],
): Promise<WithId<LinkDocument>[]> =>
  links
    .find({
      type,
      visitedAt: null,
    })
    .toArray();

const browser = await chromium.launch({
  headless: config.playwright.isHeadless,
  slowMo: config.playwright.slowdownMilliseconds,
});

try {
  console.log("Connecting to MongoDb...");
  await client.connect();
  console.log("Connected to MongoDb");
  await links.createIndex({ type: 1, link: 1 }, { unique: true });

  const page = await browser.newPage({
    baseURL: config.playwright.baseUrl,
  });

  await authenticateScraper(page, config.playwright.auth);

  const listsLinks = generateListsLinks();
  const listsDocuments = listsLinks.map((link) => ({
    link,
    type: "list" as const,
    visitedAt: null,
  }));
  await insertLinksIfNotExistsRepository(listsDocuments);

  const nonVisitedLists = await findNonVisitedLinksRepository("list");

  for (const list of nonVisitedLists) {
    const gamesLinks = await scrapeGamesLinksByListLink(page, list.link);

    const operations: AnyBulkWriteOperation<LinkDocument>[] = [];
    gamesLinks.forEach((link) => {
      operations.push({
        insertOne: {
          document: {
            link,
            type: "game",
            visitedAt: null,
          },
        },
      });
    });
    operations.push({
      updateOne: {
        filter: {
          _id: list._id,
        },
        update: {
          $set: {
            visitedAt: new Date(),
          },
        },
      },
    });
    await links.bulkWrite(operations);

    console.log(`Finished scraping collection link: ${list.link}`);
  }

  const nonVisitedGames = await findNonVisitedLinksRepository("game");

  for (const game of nonVisitedGames) {
    console.log(`Scraping boardgame link: ${game.link}`);
    await page.goto(game.link);

    // This JS object contains all game data
    const data = await page.evaluate("GEEK.geekitemPreload.item");

    await links.updateOne(
      { _id: game._id },
      {
        $set: {
          data,
          visitedAt: new Date(),
        },
      },
    );
    console.log(`Finished scraping boardgame link: ${game.link}`);
  }

  console.log("Success");
} finally {
  await browser.close();
  await client.close();
}
